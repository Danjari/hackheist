from flask import Flask, request, jsonify
import torch
import cv2
import numpy as np
import base64
# import openai
import os
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path
from flask import send_from_directory

# Load environment variables
load_dotenv()

app = Flask(__name__)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load YOLOv5
yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
yolo_model.to(device)

yolo_conf_thres = 0.25

# Load MiDaS
midas_model = torch.hub.load('intel-isl/MiDaS', 'MiDaS')
midas_model.to(device)
midas_model.eval()
midas_transforms = torch.hub.load('intel-isl/MiDaS', 'transforms')
midas_transform = midas_transforms.default_transform


def estimate_depth(image):
    input_image = midas_transform(image).to(device)
    depth = midas_model(input_image)
    depth = torch.nn.functional.interpolate(
        depth.unsqueeze(1),
        size=image.shape[:2],
        mode='bicubic',
        align_corners=False
    ).squeeze()
    return depth.detach().cpu().numpy()


def decode_image(base64_string):
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data)).convert('RGB')
    return np.array(image)


def detect_objects(image):
    results = yolo_model(image)
    detections = results.pandas().xyxy[0]
    objects = []
    
    for _, row in detections.iterrows():
        if row['confidence'] < yolo_conf_thres:
            continue
        objects.append({
            "name": row['name'],
            "xmin": int(row['xmin']),
            "ymin": int(row['ymin']),
            "xmax": int(row['xmax']),
            "ymax": int(row['ymax'])
        })
    return objects


def get_nearby_object(image, objects, threshold = float('inf')):
    depth_map = estimate_depth(image)
    depth_map = depth_map.max() - depth_map
    nearby_object = []
    
    for obj in objects:
        xmin, ymin, xmax, ymax = map(int, [obj['xmin'],obj['ymin'], obj['xmax'], obj['ymax']])
        object_depth = depth_map[ymin:ymax, xmin:xmax]
        median_depth = np.median(object_depth)
        object_name = obj['name']
        
        if median_depth > threshold:
            continue

        nearby_object.append({
            "name": object_name,
            "xmin": xmin,
            "ymin": ymin,
            "xmax": xmax,
            "ymax": ymax,
            "median_depth": median_depth
        })

    return nearby_object
    

def generate_description(objects):
    # Initialize OpenAI client
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    if not objects:
        return "No objects detected."
    
    object_descriptions = [f"{obj['name']} is in the in front of the user at {(obj['xmin'] + obj['xmax']) / 2.0} X {(obj['ymin'] + obj['ymax']) / 2.0} Y coordinate with a distance of {obj['median_depth']} (use this information for qualitative descriptions)." for obj in objects]
    prompt = '''You are a helpful assistant for visually impaired users. You are given a set of objects detected in a scene, along with their approximate X and Y coordinates and relative distances from the camera.

        Your task:

        Create a clear, concise, and auditory-friendly description of the scene in front of the user that can help the user build a mental picture.
        Use spatial terms like "to the left," "to the right," "in front of," "behind," "closer," and "farther" to describe the layout and relationships between objects.  Avoid technical terms like "x/y-coordinates" or "depth values" and focus on intuitive descriptions. don't specify quantitatif distance of the object: \n''' 
    
    prompt += '\n'.join(map(str, object_descriptions))
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI."},
                {"role": "user", "content": prompt}
            ]
        )
        
        description = completion.choices[0].message.content.strip()
                
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=description
        )
        
        audio_bytes = BytesIO(response.content).getvalue()
        base64_audio = base64.b64encode(audio_bytes).decode('utf-8')

        # Return the public URL of the audio file
        return {"description": description, "audio_content": f'data:audio/wav;base64,{base64_audio}'}
    except Exception as e:
        print("Error generating description or speech:", e)
        return {"error": f"Error generating description or speech: {e}"}
    

def generate_immediate_description(objects):
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    if not objects:
        return "No objects detected."

    object_descriptions = [
            f"{obj['name']} is in the in front of the user at {(obj['xmin'] + obj['xmax']) / 2.0} X {(obj['ymin'] + obj['ymax']) / 2.0} Y coordinate with a distance of {obj['median_depth']} (use this information for qualitative descriptions)."
            for obj in objects
        ]
    
    print("Object description ", object_descriptions)
    prompt = '''You are a helpful assistant for visually impaired users. You are given a set of objects detected in front of the user, along with their approximate X and Y coordinates and relative distances from the camera.

    Your task:
    Create a clear, concise, and auditory-friendly description of the nearest object first to warn the user and the scene that can help the user build a mental picture.
    Provide a safe path to guide the user and avoid obstacles. 
    Use spatial terms like "to the left," "to the right," "in front of," "behind," "closer," and "farther" to describe the layout and relationships between objects. Avoid technical terms like "x/y-coordinates" or "depth values" and focus on intuitive descriptions. don't specify quantitatif distance of the object :\n''' 
    prompt += '\n'.join(map(str, object_descriptions))
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI."},
                {"role": "user", "content": prompt}
            ]
        )
        
        description = completion.choices[0].message.content.strip()
                
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=description
        )
        
        audio_bytes = BytesIO(response.content).getvalue()
        base64_audio = base64.b64encode(audio_bytes).decode('utf-8')

        return {"description": description, "audio_content": f'data:audio/wav;base64,{base64_audio}'}
    except Exception as e:
        print("Error generating description or speech:", e)
        return {"error": f"Error generating description or speech: {e}"}


@app.route('/api/checkForNearBy/', methods=['POST'])
def check_for_nearby():
    data = request.get_json()
    frame = decode_image(data.get("frame"))
    
    objects = detect_objects(frame)
    nearby_object = get_nearby_object(frame, objects, threshold=1800)
    
    if len(nearby_object) > 0:
        object_description = generate_immediate_description(nearby_object)
        return jsonify({
            "nearByObject": True,
            "objectDescription": object_description
        })
    else:
        return jsonify({
            "nearByObject": False,
            "objectDescription": None
        })


@app.route('/api/describe/', methods=['POST'])
def describe_scene():
    data = request.get_json()
    frame = decode_image(data.get("frame"))
    
    objects = detect_objects(frame)
    nearby_object = get_nearby_object(frame, objects)
    scene_description = generate_description(nearby_object)
    
    return jsonify({
        "sceneDescription": scene_description
    })
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5050,debug=True)

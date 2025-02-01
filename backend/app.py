from flask import Flask, request, jsonify
import torch
import cv2
import numpy as np
import base64
import openai
import os
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

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
    return depth.cpu().numpy()


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


def get_nearby_object(image, objects, threshold=float('inf')):
    depth_map = estimate_depth(image)
    depth_map = depth_map.max() - depth_map
    
    min_depth = float('inf')
    nearby_object = None
    
    for obj in objects:
        obj_depth = depth_map[obj['ymin']:obj['ymax'], obj['xmin']:obj['xmax']]
        median_depth = np.median(obj_depth)
        
        if median_depth < min_depth:
            min_depth = median_depth
            nearby_object = obj
            nearby_object['median_depth'] = median_depth
    
    return nearby_object if min_depth < threshold else None 


def generate_description(objects):
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    if not objects:
        return "No objects detected."
    
    object_descriptions = [f"{obj['name']} is in the scene." for obj in objects]
    prompt = "Describe the scene in a detailed yet concise way, left to right order:\n" + "\n".join(object_descriptions)
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are a helpful AI."},
                      {"role": "user", "content": prompt}]
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"Error generating description: {e}"


@app.route('/api/checkForNearBy/', methods=['POST'])
def check_for_nearby():
    data = request.get_json()
    frame = decode_image(data.get("frame"))
    
    objects = detect_objects(frame)
    nearby_object = get_nearby_object(frame, objects, 1000)
    
    if nearby_object:
        object_description = generate_description([nearby_object])
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
    scene_description = generate_description(objects)
    
    return jsonify({
        "sceneDescription": scene_description
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5050,debug=True)

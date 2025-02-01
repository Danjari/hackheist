

import { useEffect, useRef, useState } from "react";

const BACKEND_URL = "api/describe"; 
const CameraStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera not supported in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Use back camera
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 🖼️ Capture Frame and Convert to Base64
  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL("image/jpeg"); // Convert frame to base64
    return imageData.split(",")[1]; // Remove metadata prefix
  };

  // 🔥 Send Image to Backend for Scene Description
  const describeScene = async () => {
    const frame = captureFrame();
    if (!frame) return alert("Failed to capture frame.");

    try {
      const response = await fetch(`/api/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });

      const data = await response.json();
      setDescription(data.sceneDescription);
    } catch (error) {
      console.error("Error fetching description:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-lg font-semibold mb-4">Live Camera Stream</h1>
      
      <video ref={videoRef} autoPlay playsInline className="w-full max-h-[80vh] rounded-lg" />
      <canvas ref={canvasRef} className="hidden" /> {/* Used for capturing frames */}

      <button
        onClick={describeScene}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Describe Scene
      </button>

      {description && (
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default CameraStream;
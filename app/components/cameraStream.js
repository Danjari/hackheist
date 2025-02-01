import { useEffect, useRef, useState } from "react";

const BACKEND_URL = "api/describe"; 
const CameraStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

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
    
    const imageData = canvas.toDataURL("image/jpeg");
    return imageData.split(",")[1];
  };

  // 🔥 Send Image to Backend for Scene Description
  const describeScene = async () => {
    const frame = captureFrame();
    if (!frame) return alert("Failed to capture frame.");

    setLoading(true); // Set loading to true when the request starts

    try {
      const response = await fetch(`/api/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      setDescription(data.sceneDescription);

      // Fetch the audio file as a blob
      const audioResponse = await fetch(data.audioUrl);
      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log("Audio URL:", audioUrl);

      // Play the audio file using the Object URL
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error fetching description:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-lg font-semibold mb-4">Live Camera Stream</h1>
      
      <video ref={videoRef} autoPlay playsInline className="w-full max-h-[80vh] rounded-lg" />
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={describeScene}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        style={{ position: 'relative' }}
      >
        {loading ? "Loading..." : "Describe Scene"}
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
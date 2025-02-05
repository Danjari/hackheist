import { useEffect, useRef, useState } from "react";
import Loader from "./ui/loader";

const CameraStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [description, setDescription] = useState("");
  const [audioContent, setAudioContent] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      // Check if the browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera not supported in this browser.");
        return;
      }

      try {
        // Request access to the camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        // Set the video stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    // Cleanup function to stop the camera when the component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Reset state or add additional logic when the audio ends, if needed.
  useEffect(() => {
    if (audioRef.current) {
      const handleAudioEnd = () => {
      };
      audioRef.current.addEventListener("ended", handleAudioEnd);
      return () => {
        audioRef.current.removeEventListener("ended", handleAudioEnd);
      };
    }
  }, []);

  // Auto-play audio whenever audioContent updates.
  useEffect(() => {
    if (audioContent) {
      playAudio(audioContent);
    }
  }, [audioContent]);

  // Function to capture the current frame from the video stream
  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    // Ensure both canvas and video elements are available
    if (!canvas || !video) return null;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convert the canvas image to a base64 string
    const imageData = canvas.toDataURL("image/jpeg");
    return imageData.split(",")[1];
  };

  const describeScene = async () => {
    // Immediately try to unlock audio playback with the user gesture.
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setAudioContent(null);
    const frame = captureFrame();
    if (!frame) return alert("Failed to capture frame.");

    setLoading(true);

    try {
      // Send the captured frame to the server for description
      const response = await fetch("/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });

      const data = await response.json();
      if (data.description) {
        setDescription(data.description);
      }

      if (data.sceneDescription.audio_content) {
        // Update the state with the new audio source.
        setAudioContent(data.sceneDescription.audio_content);
      }
    } catch (error) {
      console.error("Error fetching description:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (content) => {
    if (audioRef.current) {
      if (audioRef.current.src !== content) {
        audioRef.current.src = content;
      }
      audioRef.current.play().catch((err) =>
        console.error("Error playing audio:", err)
      );
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="relative text-white min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Live Camera Stream</h1>

      <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-h-[70vh] rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Action buttons: Describe Scene and Start/Stop Monitoring */}
      <div className="mt-6 flex flex-col sm:flex-row gap-6">
        {/* Describe Scene button with icon and label */}
        <div className="flex items-center gap-3">
          <button
            onClick={describeScene}
            disabled={loading}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 shadow-lg hover:from-gray-400 hover:to-gray-600 transition"
          >
            {loading ? (
              <Loader className="w-5 h-5" />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 2h16a2 2 0 012 2v14a2 2 0 01-2 2H8l-4 4V4a2 2 0 012-2z" />
              </svg>
            )}
          </button>
          <span className="text-xl font-semibold">Describe Scene</span>
        </div>

        {/* Start/Stop Monitoring button with icon and label */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 shadow-lg hover:from-gray-400 hover:to-gray-600 transition"
          >
            {isMonitoring ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
          </button>
          <span className="text-xl font-semibold">
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </span>
        </div>
      </div>

      {/* Audio Controls: Two circular buttons for Play and Pause. Rendered only if audioContent exists and not loading. */}
      {audioContent && !loading && (
        <div className="mt-6 flex gap-6">
          {/* Play Button */}
          <button
            onClick={() => playAudio(audioContent)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 shadow-lg hover:from-gray-400 hover:to-gray-600 transition"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </button>
          {/* Pause Button */}
          <button
            onClick={pauseAudio}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 shadow-lg hover:from-gray-400 hover:to-gray-600 transition"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          </button>
        </div>
      )}

      {description && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md max-w-lg text-center">
          <p>{description}</p>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default CameraStream;

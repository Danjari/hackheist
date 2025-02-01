import { useEffect, useRef, useState } from "react";

const CameraStream = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [description, setDescription] = useState(""); // ✅ Re-added state
    const [audioContent, setAudioContent] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const audioRef = useRef(null); // ✅ Added reference for audio element

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

        if (!canvas || !video) return null;

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
            const response = await fetch("/api/describe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frame }),
            });

            const data = await response.json();
            console.log("✅ Received data:", data); // Debugging

            if (data.description) {
                setDescription(data.description);
            }
            
            if (data.sceneDescription.audio_content) {
                const audioContent = data.sceneDescription.audio_content;
                setAudioContent(audioContent);

                console.log("🎵 Audio Content:", audioContent); // Log the URL before playing
                console.log("🎧 Trying to play audio...");
                
                // ✅ Ensure audio plays after setting URL
                setTimeout(() => playAudio(audioContent), 500);
        } else {
            console.warn("⚠️ No audio URL in response");
        }
        } catch (error) {
            console.error("Error fetching description:", error);
        }
    };

    // 🔊 Function to Play Audio
    const playAudio = (content) => {
        if (audioRef.current) {
            audioRef.current.src = content;
            audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        }
    };

    // 🔥 Send Image to Backend for Nearby Object Detection
    const checkForNearbyObjects = async () => {
        const frame = captureFrame();
        if (!frame) return;

        try {
            const response = await fetch("/api/checkForNearBy", {  // Call Flask API
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frame }),
            });

            const data = await response.json();

            if (data.nearByObject) {
                setDescription(data.objectDescription);
                if (data.isDanger) {
                    alert("⚠️ Warning: An object is too close! " + data.objectDescription);
                }
            } 
        } catch (error) {
            console.error("Error detecting nearby objects:", error);
        }
    };

    // ⏳ Start Monitoring (Runs Both APIs Every 4 Seconds)
    useEffect(() => {
        let interval;
        if (isMonitoring) {
            interval = setInterval(() => {
                checkForNearbyObjects();
            }, 4000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isMonitoring]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-lg font-semibold mb-4">Live Camera Stream</h1>
            
            <video ref={videoRef} autoPlay playsInline className="w-full max-h-[80vh] rounded-lg" />
            <canvas ref={canvasRef} className="hidden" /> {/* Used for capturing frames */}

            {/* Button to Describe Scene Manually */}
            <button
                onClick={describeScene}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
                Describe Scene
            </button>

            {/* Button to Start/Stop Automatic Scanning */}
            <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`mt-4 px-4 py-2 rounded-md ${isMonitoring ? "bg-red-500" : "bg-green-500"} text-white`}
            >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </button>

            {/* Audio Element for Playback */}
            <audio ref={audioRef} className="hidden" />

            {/* Button to Play Audio (Only shows if audioContent is available) */}
            {audioContent && (
                <button onClick={() => playAudio(audioContent)} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md">
                    🔊 Play Description
                </button>
            )}

            {/* Show Description */}
            {description && (
                <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                    <p>{description}</p>
                </div>
            )}
        </div>
    );
};

export default CameraStream;
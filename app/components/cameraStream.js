
import { useEffect, useRef, useState } from "react";
import Loader from "./ui/loader"

const CameraStream = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [description, setDescription] = useState("");
    const [audioContent, setAudioContent] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error("Camera not supported in this browser.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
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

    const captureFrame = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) return null;

        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL("image/jpeg");
        return imageData.split(",")[1];
    };

    const describeScene = async () => {
        const frame = captureFrame();
        if (!frame) return alert("Failed to capture frame.");

        setLoading(true);

        try {
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
                setAudioContent(data.sceneDescription.audio_content);
                setTimeout(() => playAudio(data.sceneDescription.audio_content), 500);
            }
        } catch (error) {
            console.error("Error fetching description:", error);
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (content) => {
        if (audioRef.current) {
            audioRef.current.src = content;
            audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        }
    };

    return (
        <div className="relative  text-white min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold mb-6">Live Camera Stream</h1>
            
            <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-700">
                <video ref={videoRef} autoPlay playsInline className="w-full max-h-[70vh] rounded-lg" />
                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={describeScene}
                    className="px-6 py-3 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Describe Scene"}
                </button>

                <button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${isMonitoring ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"}`}
                >
                    {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
                </button>
            </div>

            {audioContent && (
                <button
                    onClick={() => playAudio(audioContent)}
                    className="mt-4 px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 transition-all"
                >
                    🔊 Play Description
                </button>
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

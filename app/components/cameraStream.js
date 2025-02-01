import { useEffect, useRef } from "react";

const CameraStream = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia is not supported on this browser");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" }, // Forces back camera
          },
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

  return (
    <div className="flex justify-center items-center h-screen">
      <video ref={videoRef} autoPlay playsInline className="w-full max-h-[80vh] rounded-lg" />
    </div>
  );
};

export default CameraStream;
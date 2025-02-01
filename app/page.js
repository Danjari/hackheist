'use client'
import CameraStream from "./components/cameraStream";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <CameraStream />
    </div>
  );
}

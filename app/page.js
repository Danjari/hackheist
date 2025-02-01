'use client'
import CameraStream from "./components/cameraStream";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-lg font-semibold mb-4">Live Camera Stream</h1>
      <CameraStream />
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
        Describe Scene
      </button>
    </div>
  );
}

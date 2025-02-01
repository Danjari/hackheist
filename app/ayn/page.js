'use client'
import CameraStream from "../components/cameraStream";

export default function Home() {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600">
      <CameraStream />
    </div>
  );
}

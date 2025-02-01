import React from "react";

export default function HowItWorks() {
  return (
    <div className="mt-32 py-32">
      {/* Background Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ffffff30] to-[#ffffff10] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Section Title */}
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-lg font-semibold text-indigo-400">How It Works</h2>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          A Seamless Experience
        </p>
        <p className="mt-6 text-lg text-gray-300">
          Watch how Ayn's MVP works.
        </p>
      </div>

      {/* Video Container */}
      <div className="mt-16 flex justify-center">
        <div className="relative rounded-2xl p-[6px] bg-gradient-to-br from-slate-500 to-slate-800 shadow-xl">
          <video
            controls
            className="rounded-xl w-full max-w-3xl shadow-lg"
          >
            <source src="/test.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
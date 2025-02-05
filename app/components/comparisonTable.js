import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const competitors = [
  {
    name: "AYN",
    features: [true, true, true, true, true, true],
    highlight: true, // This will have a subtle border glow
  },
  {
    name: "BlindSquare",
    features: [false, true, false, true, false, false],
  },
  {
    name: "Humanware",
    features: [false, true, false, false, false, false],
  },
  {
    name: "Biped.ai",
    features: [true, false, true, true, false, false],
  },
  {
    name: "Google Glasses",
    features: [false, false, false, true, false, false],
  },
];

const featureNames = [
  "Real-Time Object Detection",
  "Interactive Voice Assistance",
  "Indoor Navigation",
  "Outdoor Navigation",
  "Proximity Alerts",
  "Live Updates for Family & Caregivers",
];

export default function ComparisonTable() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-lg font-semibold text-indigo-400">Why Ayn?</h2>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Feature Comparison
        </p>
        <p className="mt-6 text-lg text-gray-300">See how Ayn stands out.</p>
      </div>

      {/* Table container: retains the original width */}
      <div className="mt-16 overflow-hidden rounded-lg shadow-lg max-w-4xl mx-auto bg-slate-800/80">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium">
              <th className="px-6 py-4 text-left">Product</th>
              {featureNames.map((feature, index) => (
                <th key={index} className="px-4 py-3 text-center">
                  {feature}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-sans text-gray-100 text-sm">
            {competitors.map((comp, idx) => {
              // For the highlighted row (AYN), use a darker background with a blue left border.
              const rowClasses = comp.highlight
                ? "bg-gray-900 border-l-4 border-blue-700"
                : hovered === idx
                ? "bg-gray-700"
                : "bg-gray-800";
              return (
                <tr
                  key={idx}
                  className={`transition-colors duration-300 ${rowClasses}`}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <td className="px-6 py-4 font-semibold text-lg">
                    {comp.name}
                  </td>
                  {comp.features.map((hasFeature, index) => (
                    <td key={index} className="px-4 py-3 text-center">
                      {hasFeature ? (
                        <CheckIcon className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
'use client'

import ComparisonTable from "./components/comparisonTable";
import Features from "./components/features";
import LandingPage from "./components/hero";
import HowItWorks from "./components/howItWorks";

export default function Home() {
  return (
    <div className="relative bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 text-white min-h-screen">
      <LandingPage/>
      <Features/>
      <HowItWorks/>
      <ComparisonTable/>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import SunArc from "../../components/SunArc";

// Dynamically import the GameComponent with SSR disabled
const GameComponent = dynamic(() => import("./GameComponent"), {
  ssr: false,
});

export default function GamePage() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <SunArc />
      <GameComponent />
    </div>
  );
}

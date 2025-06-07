"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SunArc() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

  const totalMinutes = 24 * 60;
  const now = time.getHours() * 60 + time.getMinutes();
  const x = (now / totalMinutes) * 100; // position as %
  const y = 50 - 50 * Math.sin((Math.PI * x) / 100); // simple sine wave arc

  return (
    <div className="fixed top-4 left-4 w-64 h-24 z-50 pointer-events-none">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path
          d="M0,50 Q50,0 100,50"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <motion.circle
          cx={x}
          cy={y}
          r="3"
          fill="yellow"
          initial={false}
          animate={{ cx: x, cy: y }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        />
      </svg>
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";

interface HeaderCountdownProps {
  targetDate: Date;
}

/**
 * Header Countdown - Precise to the second
 * Minimal B&W design matching site aesthetic
 */
export function HeaderCountdown({ targetDate }: HeaderCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const diff = targetDate.getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-0.5 md:gap-1 font-mono">
      <div className="px-1.5 py-1 md:px-3 md:py-2 bg-white text-black font-black text-sm md:text-lg">
        {String(timeLeft.days).padStart(2, '0')}
      </div>
      <span className="text-white/40 text-xs">:</span>
      <div className="px-1.5 py-1 md:px-3 md:py-2 bg-white text-black font-black text-sm md:text-lg">
        {String(timeLeft.hours).padStart(2, '0')}
      </div>
      <span className="text-white/40 text-xs">:</span>
      <div className="px-1.5 py-1 md:px-3 md:py-2 bg-white text-black font-black text-sm md:text-lg">
        {String(timeLeft.minutes).padStart(2, '0')}
      </div>
      <span className="text-white/40 text-xs">:</span>
      <div className="px-1.5 py-1 md:px-3 md:py-2 bg-white text-black font-black text-sm md:text-lg">
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

"use client";

import { Users, Package, Clock } from "lucide-react";

interface HeaderStatsProps {
  visitorCount: number;
  teesLeft: number;
  totalTees: number;
  saleStatus?: {
    status: 'before' | 'during' | 'after';
    timeUntilStart?: number;
    timeUntilEnd?: number;
  };
}

export function HeaderStats({ visitorCount, teesLeft, totalTees, saleStatus }: HeaderStatsProps) {
  // Calculate compact countdown
  let countdownText = "";
  if (saleStatus) {
    if (saleStatus.status === 'before' && saleStatus.timeUntilStart) {
      const days = Math.floor(saleStatus.timeUntilStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((saleStatus.timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      countdownText = `${days}d ${hours}h`;
    } else if (saleStatus.status === 'during') {
      countdownText = "LIVE";
    }
  }

  return (
    <div className="hidden md:flex items-center gap-6 text-2xl">
      {/* Visitor Count - 2X BIGGER */}
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-lg bg-white/5 border border-white/10 animate-pulse"
        key={visitorCount}
      >
        <Users className="w-8 h-8 text-white" />
        <span className="font-mono font-bold text-white">{visitorCount}</span>
      </div>

      {/* Tees Left - 2X BIGGER */}
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-lg bg-white/5 border border-white/10 animate-pulse"
        key={teesLeft}
      >
        <Package className="w-8 h-8 text-white" />
        <span className="font-mono font-bold text-white">
          {teesLeft}/{totalTees}
        </span>
      </div>

      {/* Sale Countdown - 2X BIGGER */}
      {countdownText && (
        <div
          className={`flex items-center gap-3 px-6 py-3 rounded-lg animate-in fade-in duration-300 ${
            saleStatus?.status === 'during'
              ? 'bg-white/20 text-white border border-white/30 animate-pulse'
              : 'bg-white/5 border border-white/10'
          }`}
        >
          <Clock className="w-8 h-8 text-white" />
          <span className="font-mono font-bold text-xl text-white">
            {countdownText}
          </span>
        </div>
      )}
    </div>
  );
}

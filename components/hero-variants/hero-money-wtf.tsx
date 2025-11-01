"use client";

import { motion } from "framer-motion";

interface HeroMoneyWTFProps {
  visitorCount: number;
  saleStatus: {
    isActive: boolean;
    status: 'before' | 'during' | 'after';
    startTime: string;
    endTime: string;
  } | null;
  onCTAClick?: () => void;
}

/**
 * HERO VARIANT: MONEY-WTF (Second Talk Shit)
 * From WTF component context - strikethrough version
 * Different styling from original money hero
 */
export function HeroMoneyWTF({ visitorCount, saleStatus, onCTAClick }: HeroMoneyWTFProps) {
  return (
    <section className="w-full min-h-screen bg-background flex items-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-12">

        {/* Talk Shit / Make Money - WTF Context Styling */}
        <div>
          <h1 className="font-black tracking-tight leading-[0.95]">
            <span className="block text-5xl md:text-7xl lg:text-8xl line-through decoration-white/70 decoration-8 opacity-50 text-white/50">
              talk shit
            </span>
            <span className="block text-5xl md:text-7xl lg:text-8xl opacity-100 text-white mt-2">
              make money
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 font-mono">
            Thanks for watching!
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm font-mono text-white/50">
          <span>{visitorCount} observers</span>
          <span>•</span>
          <span>31 pieces</span>
          <span>•</span>
          <span>R$149 each</span>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onCTAClick}
            className="h-14 px-8 bg-white text-black font-bold text-base hover:bg-white/90 transition-colors"
          >
            ENTER THE SITE
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="text-xs text-white/30 font-mono">
          Press A ← prev | → next D
        </div>

      </div>
    </section>
  );
}

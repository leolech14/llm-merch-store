"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface HeroStrikethroughProps {
  visitorCount: number;
  saleStatus: {
    isActive: boolean;
    status: 'before' | 'during' | 'after';
    startTime: string;
    endTime: string;
  } | null;
  onCTAClick?: () => void;
}

export function HeroStrikethrough({ visitorCount, saleStatus, onCTAClick }: HeroStrikethroughProps) {
  const [stage, setStage] = useState<'experiment' | 'metoo' | 'dontcare'>('experiment');

  return (
    <section id="hero" className="w-full px-4 py-12 md:py-20 min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto text-center w-full">
        {/* Fixed height container to prevent jumps */}
        <div className="min-h-[600px] flex flex-col items-center justify-center">

        {/* Hero Text - 3 States - FIXED POSITION */}
        <div className="relative w-full min-h-[300px] flex items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          {stage === 'experiment' && (
            <motion.h1
              key="exp"
              className="text-4xl md:text-6xl font-bold tracking-tight absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block line-through text-muted-foreground/40 text-xl md:text-xl mb-2">
                THIS IS A COSTUME
              </span>
              <span className="block line-through text-muted-foreground/50 text-xl md:text-xl mb-2">
                THIS IS A STORE
              </span>
              <span className="block text-foreground text-4xl md:text-6xl">
                THIS IS AN EXPERIMENT
              </span>
            </motion.h1>
          )}

          {stage === 'metoo' && (
            <motion.h1
              key="mt"
              className="text-5xl md:text-7xl font-black text-white cursor-pointer absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setStage('dontcare')}
            >
              ME TOO!
            </motion.h1>
          )}

          {stage === 'dontcare' && (
            <motion.h1
              key="dc"
              className="text-5xl md:text-7xl font-black text-white absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              I DON'T CARE!
            </motion.h1>
          )}
        </AnimatePresence>
        </div>

        {/* Subtitle - FIXED POSITION */}
        <div className="min-h-[80px] flex items-center justify-center mb-8">
          <p className="text-lg md:text-xl text-white/70 max-w-2xl">
            Adding visual shit to t-shirts to make valuable knowledge travel around the physical world.
          </p>
        </div>

        {/* Buttons - Stage dependent - FIXED HEIGHT CONTAINER */}
        <div className="min-h-[180px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === 'experiment' && (
            <motion.div
              key="exp-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setStage('metoo')}
                className="h-14 px-8 bg-foreground text-background font-bold text-lg hover:opacity-90"
              >
                I HATE EXPERIMENTS
              </button>
            </motion.div>
          )}

          {stage === 'metoo' && (
            <motion.div
              key="mt-btns"
              className="w-full space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-lg md:text-2xl font-mono text-white/50 italic">
                so cringy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const msg = encodeURIComponent("SO CRINGY\n\nComputer Mathy T-Shirts\n" + window.location.href);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-colors flex items-center gap-2"
                >
                  <span>TELL EVERYONE</span>
                  <span>💬</span>
                </button>

                <button
                  onClick={onCTAClick}
                  className="h-14 px-8 bg-white text-black font-bold text-base hover:bg-white/90 transition-colors"
                >
                  Agree to continue
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'dontcare' && (
            <motion.div
              key="dc-btn"
              className="pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={onCTAClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm hover:bg-white/90"
              >
                BUY LIMITED EDITION SCIENCE SHIT <MessageCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Stats - FIXED POSITION */}
        <div className="flex items-center justify-center gap-6 text-xs font-mono text-white/50">
          <span>{visitorCount} observers</span>
          <span>•</span>
          <span>31 pieces</span>
          <span>•</span>
          <span>1 of each</span>
        </div>

        </div>
      </div>
    </section>
  );
}

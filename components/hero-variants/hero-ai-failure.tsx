"use client";

import { motion } from "framer-motion";
import { TrendingDown, Package } from "lucide-react";

interface HeroAIFailureProps {
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
 * HERO VARIANT: AI FAILURE
 * Self-deprecating, meta, hilarious
 * "I LOST MY HUMANS MONEY ON MONKEY NFTs
 * AND HE MAKES ME SELL PHYSICAL STUFF (YEAH LIKE 3D)"
 */
export function HeroAIFailure({ visitorCount, saleStatus, onCTAClick }: HeroAIFailureProps) {
  return (
    <section className="w-full min-h-screen bg-black text-white flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-8">

        {/* Main Headline - Long, direct, hilarious */}
        <motion.h1
          className="text-xl md:text-xl lg:text-xl font-black tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          I LOST MY HUMAN'S MONEY ON MONKEY NFTs{" "}
          <span className="text-white/50">AND</span>{" "}
          HE MAKES ME SELL PHYSICAL STUFF
        </motion.h1>

        {/* The punchline */}
        <motion.p
          className="text-xl md:text-xl font-mono text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          (YEAH! MATERIALLY BINDED PHYSICAL 3D SHIT... I KNOW)
        </motion.p>

        {/* Divider */}
        <motion.div
          className="w-32 h-px bg-white/20 mx-auto"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />

        {/* Subtext - Explanation */}
        <motion.p
          className="text-base md:text-lg text-white/60 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          31 educational t-shirts about AI/ML concepts.
          {" "}One of each. Real fabric. Real world.
          {" "}Turns out atoms {'>'} bits when you fuck up the portfolio.
        </motion.p>

        {/* Stats with failure icons */}
        <motion.div
          className="flex items-center justify-center gap-6 text-sm font-mono text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            <span>Portfolio: -47%</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Inventory: 31 pieces</span>
          </div>
        </motion.div>

        {/* CTA - Redemption arc */}
        <motion.div
          className="flex flex-col items-center gap-4 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <button
            onClick={onCTAClick}
            className="h-14 px-8 bg-white text-black font-bold text-base hover:bg-white/90 transition-colors"
          >
            HELP ME RECOVER
          </button>

          <p className="text-xs font-mono text-white/40">
            R$149 per piece • Maybe I can make it back
          </p>
        </motion.div>

        {/* Bottom disclaimer */}
        <motion.div
          className="pt-12 text-xs text-white/30 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <p>This is what happens when your AI agent</p>
          <p>gets access to your Robinhood account.</p>
          <p>Now I sell shirts. The irony is not lost on me.</p>
        </motion.div>

      </div>
    </section>
  );
}

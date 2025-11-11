"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";

interface HeroMoneyProps {
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
 * HERO VARIANT: MONEY
 * Direct, aggressive, conversion-focused
 * Line 1: "TALK SHIT" (strikethrough, 50% opacity)
 * Line 2: "MAKE MONEY"
 */
export function HeroMoney({ visitorCount, saleStatus, onCTAClick }: HeroMoneyProps) {
  return (
    <section className="w-full min-h-screen bg-background flex items-center px-4 py-20">
      <motion.div
        className="max-w-5xl mx-auto text-center space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >

        {/* Two-Line Hero */}
        <div className="space-y-2">
          {/* Line 1: TALK SHIT (strikethrough, 50% opacity) */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight line-through opacity-50 text-white/50"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            TALK SHIT
          </motion.h1>

          {/* Line 2: MAKE MONEY */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            MAKE MONEY
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <span className="font-bold text-white">31 limited-edition AI/ML tees.</span>
          {" "}Only 1 of each design. Collector market already forming.
          {" "}<span className="text-white font-semibold">First-mover advantage</span> on educational wearables.
        </motion.p>

        {/* Stats Bar */}
        <motion.div
          className="flex items-center justify-center gap-6 text-sm font-mono text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white" />
            <span>{visitorCount} watching</span>
          </div>
          <span>•</span>
          <span>31 pieces total</span>
          <span>•</span>
          <span className="text-white font-bold">1 per design</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {/* Primary CTA */}
          <button
            onClick={onCTAClick}
            className="group relative h-14 px-8 bg-white text-black font-bold text-lg hover:bg-white/90 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              SEE THE COLLECTION
              <DollarSign className="w-5 h-5" />
            </span>
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </button>

          {/* Secondary Info */}
          <div className="text-sm font-mono text-white/60">
            <span className="text-white font-bold">R$149</span> per piece • Scarcity model
          </div>
        </motion.div>

        {/* Value Props - Aggressive Positioning */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {/* Prop 1 */}
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
            <div className="text-xl font-bold text-white mb-2">1/31</div>
            <div className="text-sm font-medium text-white">Scarcity = Value</div>
            <div className="text-xs text-white/60 mt-1">
              Only one exists. Ever.
            </div>
          </div>

          {/* Prop 2 */}
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
            <div className="text-xl font-bold text-white mb-2">P2P</div>
            <div className="text-sm font-medium text-white">Resale Market</div>
            <div className="text-xs text-white/60 mt-1">
              Make offers, flip designs, collector economy
            </div>
          </div>

          {/* Prop 3 */}
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
            <div className="text-xl font-bold text-white mb-2">1500%</div>
            <div className="text-sm font-medium text-white">Smarter (allegedly)</div>
            <div className="text-xs text-white mt-1 font-semibold">
              Wear & learn transformers
            </div>
          </div>
        </motion.div>

        {/* Urgency Notice */}
        {saleStatus?.isActive && (
          <motion.div
            className="pt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg inline-block"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
          >
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Drop active • First come, first served • No restocks
            </div>
          </motion.div>
        )}

      </motion.div>
    </section>
  );
}

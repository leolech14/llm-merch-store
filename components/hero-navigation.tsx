"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface HeroNavigationProps {
  currentIndex: number;
  totalVariants: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function HeroNavigation({
  currentIndex,
  totalVariants,
  onPrevious,
  onNext,
}: HeroNavigationProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/10 rounded-full transition-all"
        aria-label="Previous hero variant"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Counter - Minimal */}
      <div className="text-xs font-mono text-foreground/50 tracking-wider px-2">
        {currentIndex + 1}/{totalVariants}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/10 rounded-full transition-all"
        aria-label="Next hero variant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </motion.div>
  );
}

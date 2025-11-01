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
        className="w-6 h-6 flex items-center justify-center text-foreground/40 hover:text-foreground/80 transition-colors"
        aria-label="Previous hero variant"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Counter - Minimal */}
      <div className="text-[10px] font-mono text-foreground/30 tracking-wider">
        {currentIndex + 1}/{totalVariants}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-6 h-6 flex items-center justify-center text-foreground/40 hover:text-foreground/80 transition-colors"
        aria-label="Next hero variant"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

/**
 * Website Scaffold - Constant Elements
 * Shows across ALL heroes (not hero-specific)
 * Black & white strict compliance
 */
export function WebsiteScaffold() {
  return (
    <motion.div
      className="w-full bg-black/95 backdrop-blur-sm border-y border-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-6 text-sm md:text-base font-semibold text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">🛹</span>
            <span>Skateboard bar approved</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-2">
            <span>100% fabric</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-2">
            <span>No electronic chips</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

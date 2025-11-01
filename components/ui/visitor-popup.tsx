"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface VisitorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  visitorCount: number;
}

export function VisitorPopup({ isOpen, onClose, visitorCount }: VisitorPopupProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [displayCount, setDisplayCount] = useState(visitorCount - 1);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setShowUpdate(false);
      setDisplayCount(visitorCount - 1);
    }
  }, [isOpen, visitorCount]);

  const handleOkClick = () => {
    // 1. Animate + Update number INSTANTLY (no delay!)
    setShowUpdate(true);
    setDisplayCount(visitorCount);

    // 2. After 0.5s, auto-close (2x faster!)
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Popup Card - Compact & Centered */}
          <motion.div
            className="relative bg-card rounded-xl p-6 md:p-8 shadow-2xl border border-primary/20 max-w-sm w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.2, 0, 0.8, 1] }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            {/* Icon - Smaller */}
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
            >
              <Users className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Title - Smaller */}
            <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
              Welcome! 🛹
            </h2>

            {/* Visitor Count Display - Compact */}
            <div className="text-center mb-5">
              <p className="text-xs text-muted-foreground mb-2">
                Visitor #
              </p>
              <motion.div
                className="text-5xl md:text-6xl font-black text-primary"
                key={displayCount}
                animate={showUpdate ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -3, 3, 0]
                } : {}}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {displayCount.toLocaleString()}
              </motion.div>

              {/* Update indicator - Minimal */}
              {showUpdate && (
                <motion.div
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Zap className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-medium text-white">
                    Updated
                  </span>
                </motion.div>
              )}
            </div>

            {/* Message - Compact */}
            <p className="text-center text-xs text-muted-foreground/80 mb-4">
              Thanks for checking out our educational experiment!
            </p>

            {/* Ok Button - Ultra Compact */}
            <motion.button
              onClick={handleOkClick}
              disabled={showUpdate}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: showUpdate ? 1 : 1.02 }}
              whileTap={{ scale: showUpdate ? 1 : 0.98 }}
            >
              {showUpdate ? "Updating..." : "KEEP GOING"}
            </motion.button>

            {/* Auto-close hint - Compact */}
            {showUpdate && (
              <motion.p
                className="text-center text-[10px] text-muted-foreground/60 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Closing...
              </motion.p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Heart, MessageCircle, Loader2, Check, Sparkles } from "lucide-react";
import { TRANSITIONS } from "@/lib/easings";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    description: string;
    images: string[];
    category?: string;
    tags?: string[];
    isSold?: boolean;
    isSaleActive?: boolean;
  };
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiProvider, setAiProvider] = useState<'claude' | 'chatgpt' | null>(null);
  const [explanation, setExplanation] = useState('');
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Capture card IMAGE position when opening
  useEffect(() => {
    if (isOpen) {
      // Find the clicked card image
      const cards = document.querySelectorAll('[data-product-card]');
      const activeCard = Array.from(cards).find(card =>
        card.querySelector('img')?.src.includes(product.images[0].split('/').pop() || '')
      );

      if (activeCard) {
        const img = activeCard.querySelector('img');
        if (img) {
          const rect = img.getBoundingClientRect();
          setCardPosition({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          });

          // Hide the card image during modal
          img.style.opacity = '0';
        }
      }
    } else {
      // Show card image again
      const cards = document.querySelectorAll('[data-product-card]');
      cards.forEach(card => {
        const img = card.querySelector('img') as HTMLImageElement;
        if (img) img.style.opacity = '1';
      });
      setCardPosition(null);
    }
  }, [isOpen, product.images]);

  // Lock body scroll AND preserve scroll position
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Cleanup: Restore scroll position
      return () => {
        document.body.style.overflow = "unset";
        document.body.style.position = "unset";
        document.body.style.top = "unset";
        document.body.style.width = "unset";

        // Restore exact scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isZoomed, onClose]);

  const handleAddToCart = async () => {
    if (isAddedToCart || product.isSold) return;
    setIsAddingToCart(true);

    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'add_to_cart',
          eventData: { productName: product.name }
        })
      });
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }

    setTimeout(() => {
      setIsAddingToCart(false);
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }, 800);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    try {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'product_like',
          eventData: { productName: product.name }
        })
      });
    } catch {}
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `${product.name} - R$${product.price}\n\nCognitive Wearables • LLMMerch\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleExplain = async (provider: 'claude' | 'chatgpt') => {
    setAiProvider(provider);
    setShowExplanation(true);
    setExplanation(''); // Reset

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Explain the technical concept in this design: ${product.name}. ${product.description}. Be concise, educational, and enthusiastic.`,
          provider: provider === 'claude' ? 'anthropic' : 'openai'
        })
      });

      const data = await response.json();
      setExplanation(data.answer || 'This design represents cutting-edge AI/ML concepts in wearable form!');
    } catch (error) {
      setExplanation('Technical explanation: ' + product.description);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* 1. Dark Blurred Background - Instant */}
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.1,
              ease: [0.2, 0, 0.8, 1]
            }}
            onClick={() => {
              if (isZoomed) {
                setIsZoomed(false);
              } else {
                onClose();
              }
            }}
          />

          {/* 2. T-Shirt PNG - Emerges from card position */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-2 md:p-8"
            onClick={handleImageClick}
            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
          >
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="object-contain"
              initial={cardPosition ? {
                position: 'absolute',
                left: cardPosition.x,
                top: cardPosition.y,
                width: cardPosition.width,
                height: cardPosition.height,
                opacity: 1
              } : {
                scale: 0.8,
                opacity: 0
              }}
              animate={{
                position: 'relative',
                left: 0,
                top: 0,
                width: '95%',
                height: '95%',
                scale: isZoomed ? 1.1 : 1.02,
                opacity: 1
              }}
              exit={cardPosition ? {
                position: 'absolute',
                left: cardPosition.x,
                top: cardPosition.y,
                width: cardPosition.width,
                height: cardPosition.height,
                scale: 1,
                opacity: 1
              } : {
                scale: 0.8,
                opacity: 0
              }}
              transition={{
                duration: 0.1,
                ease: [0.2, 0, 0.8, 1]
              }}
            />
          </motion.div>

          {/* 3. Close Button - Quick (200ms delay) */}
          <motion.button
            onClick={onClose}
            className="fixed top-3 right-3 md:top-4 md:right-4 z-50 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.1,
              ease: [0.2, 0, 0.8, 1]
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* 4. Product Info Box - Quick (300ms delay) */}
          <motion.div
            className="fixed top-3 left-3 md:top-4 md:left-4 z-50 max-w-[280px] md:max-w-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{
              duration: 0.1,
              ease: [0.2, 0, 0.8, 1]
            }}
          >
            <div className="bg-black/30 backdrop-blur-xl p-3 border border-white/10 space-y-2">
              <div className="space-y-1">
                {product.category && (
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">{product.category}</p>
                )}
                <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs text-white/70 leading-snug">{product.description}</p>
              </div>

              {/* Explain Button - Compact */}
              {!showExplanation ? (
                <button
                  onClick={() => setShowExplanation(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 transition text-[11px] font-mono text-white/80"
                >
                  <Sparkles className="w-3 h-3" />
                  EXPLAIN
                </button>
              ) : !aiProvider ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-white/50 font-mono">AI:</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleExplain('claude')}
                      className="flex-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-mono text-white transition"
                    >
                      Claude
                    </button>
                    <button
                      onClick={() => handleExplain('chatgpt')}
                      className="flex-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-mono text-white transition"
                    >
                      GPT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    <p className="text-[10px] text-white/50 font-mono">
                      {aiProvider === 'claude' ? 'Claude' : 'GPT'}
                    </p>
                  </div>
                  {explanation && (
                    <p className="text-[11px] text-white/90 leading-relaxed bg-black/10 p-2 rounded-md">
                      {explanation}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setShowExplanation(false);
                      setAiProvider(null);
                      setExplanation('');
                    }}
                    className="text-[9px] text-white/30 hover:text-white/50 transition font-mono"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* 5. Action Buttons - Quick (400ms delay) */}
          <motion.div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{
              duration: 0.1,
              ease: [0.2, 0, 0.8, 1]
            }}
          >
            {/* Price - Minimal & Compact */}
            <div className="bg-black/40 backdrop-blur-xl px-4 py-2 border border-white/10">
              <span className="text-lg font-mono font-bold text-white">R${product.price}</span>
            </div>

            {/* Buy Button - Minimal */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={product.isSold || !product.isSaleActive || isAddingToCart || isAddedToCart}
              className="h-10 px-5 font-medium text-sm bg-white text-black hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/20"
              whileHover={{ scale: product.isSold ? 1 : 1.02 }}
              whileTap={{ scale: product.isSold ? 1 : 0.98 }}
            >
              {product.isSold ? (
                "SOLD"
              ) : !product.isSaleActive ? (
                "Not Active"
              ) : isAddingToCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAddedToCart ? (
                <Check className="w-4 h-4" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </>
              )}
            </motion.button>

            {/* Like (Icon Only) */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`w-10 h-10 flex items-center justify-center transition border ${
                isLiked
                  ? "bg-white text-black border-white/80"
                  : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/20"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </motion.button>

            {/* WhatsApp (Icon Only) */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsApp();
              }}
              className="w-10 h-10 bg-emerald-500/80 text-white hover:bg-emerald-500 border border-emerald-400/30 flex items-center justify-center transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* 6. Zoom Hint - Quick (500ms delay) */}
          {!isZoomed && (
            <motion.div
              className="fixed bottom-4 left-4 z-40 text-[10px] text-white/30 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.1,
                ease: [0.2, 0, 0.8, 1]
              }}
            >
              Tap to zoom
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { X, ShoppingCart, Heart, MessageCircle, Loader2, Check, Sparkles, ChevronDown } from "lucide-react";

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
    isNew?: boolean;
    isBestSeller?: boolean;
    isSold?: boolean;
    isSaleActive?: boolean;
  };
}

export function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Swipe to close (mobile) - More sensitive threshold
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0.5]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Prevent iOS bounce
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Handle swipe to close - More sensitive for mobile
  function handleDragEnd(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.y > 100) {  // Reduced from 150
      onClose();
    }
  }

  const handleAddToCart = async () => {
    if (isAddedToCart || product.isSold) return;

    setIsAddingToCart(true);

    // Track event
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
    // Track like event
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
    // WhatsApp share link - Fast & Minimal
    const message = encodeURIComponent(
      `${product.name} - R$${product.price}\n\nCognitive Wearables • LLMMerch\n${window.location.href}`
    );

    // WhatsApp Web (desktop) or App (mobile)
    const whatsappUrl = `https://wa.me/?text=${message}`;

    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop - Darker for better focus */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
            style={{ opacity }}
          />

          {/* Close Button - Always accessible */}
          <motion.button
            onClick={onClose}
            className="fixed top-4 right-4 md:top-6 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0.8, 1] }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6 md:w-7 md:h-7" />
          </motion.button>

          {/* MOBILE-FIRST: Bottom sheet style on mobile, centered on desktop */}
          <motion.div
            className="relative w-full h-[95vh] md:h-auto md:max-h-[90vh] max-w-7xl mx-auto"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0.8, 1] }}
          >
            {/* Swipe Indicator - Mobile only, top of sheet */}
            <div className="md:hidden w-full flex justify-center pt-3 pb-2">
              <motion.div
                className="w-12 h-1.5 rounded-full bg-white/40"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </div>

            {/* MOBILE: Stack layout (image → info → CTA) */}
            {/* DESKTOP: Grid layout (floating components) */}
            <div className="h-full md:h-auto flex flex-col md:grid md:grid-cols-2 md:gap-8 md:p-8 lg:p-12 bg-gradient-to-b from-black/80 to-black/95 md:bg-transparent md:rounded-3xl overflow-hidden">

              {/* LEFT SIDE - Image Container */}
              <div className="relative flex-shrink-0 h-[50vh] md:h-auto md:aspect-[3/4] flex items-center justify-center p-4 md:p-0">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain rounded-xl md:rounded-2xl shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Image Navigation Dots (if multiple) */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white w-6"
                            : "bg-white/40 w-2 hover:bg-white/60"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE - Product Info & Actions */}
              <div className="flex-1 md:flex-none flex flex-col justify-between p-6 md:p-0 space-y-6 overflow-y-auto md:overflow-visible">

                {/* Product Info */}
                <div className="space-y-4">
                  {/* Badges removed - business model doesn't use them */}

                  {/* Category */}
                  {product.category && (
                    <p className="text-sm text-white/60 uppercase tracking-wider">{product.category}</p>
                  )}

                  {/* Product Name - Larger on mobile */}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {product.name}
                  </h2>

                  {/* Description */}
                  <p className="text-base md:text-lg text-white/80 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Tags - Scrollable on mobile */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-sm backdrop-blur-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Actions - Sticky on mobile */}
                <div className="space-y-4 md:space-y-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <div className="text-5xl md:text-6xl font-bold text-white">
                      R${product.price}
                    </div>
                    <div className="text-sm text-white/50">cada</div>
                  </div>

                  {/* CTA Button - Large touch target (56px height) */}
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={product.isSold || !product.isSaleActive || isAddingToCart || isAddedToCart}
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl"
                    style={{
                      background: product.isSold
                        ? "rgba(239, 68, 68, 1)"
                        : "rgba(255, 255, 255, 1)",
                      color: product.isSold ? "white" : "black",
                    }}
                    whileHover={{ scale: product.isSold ? 1 : 1.02 }}
                    whileTap={{ scale: product.isSold ? 1 : 0.95 }}
                  >
                    {product.isSold ? (
                      <>
                        <X className="w-6 h-6" />
                        SOLD OUT
                      </>
                    ) : !product.isSaleActive ? (
                      "Sale Not Active"
                    ) : isAddingToCart ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Adding...
                      </>
                    ) : isAddedToCart ? (
                      <>
                        <Check className="w-6 h-6" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6" />
                        Buy Now - R${product.price}
                      </>
                    )}
                  </motion.button>

                  {/* Secondary Actions - Large touch targets */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Like Button */}
                    <motion.button
                      onClick={handleLike}
                      className={`h-14 rounded-xl font-semibold text-sm md:text-base transition-all flex items-center justify-center gap-2 ${
                        isLiked
                          ? "bg-rose-500 text-white"
                          : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart
                        className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                      />
                      {isLiked ? "Liked" : "Like"}
                    </motion.button>

                    {/* WhatsApp Button */}
                    <motion.button
                      onClick={handleWhatsApp}
                      className="h-14 rounded-xl font-semibold text-sm md:text-base bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </motion.button>
                  </div>

                  {/* Size Selector - Touch-friendly */}
                  <div className="space-y-3">
                    <p className="text-xs md:text-sm text-white/60 uppercase tracking-wider">Available Sizes:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {["S", "M", "L", "XL", "XXL"].map((size) => (
                        <button
                          key={size}
                          className="h-12 md:h-14 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm md:text-base font-medium transition-all active:scale-95"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cognitive Wearables Pitch - Mobile readable */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <p className="text-xs md:text-sm text-white/80">
                      ✅ <span className="font-semibold">100% Fabric</span> - Zero electronic chips
                    </p>
                    <p className="text-xs md:text-sm text-white/80">
                      🧠 <span className="font-semibold">Educational</span> - Actually teaches concepts
                    </p>
                    <p className="text-xs md:text-sm text-white/80">
                      🛹 <span className="font-semibold">Sk8 Bar Approved</span> - Halloween Edition
                    </p>
                    <p className="text-xs text-white/50 italic mt-2">
                      Guaranteed 1300% smarter or your neurons back*
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Swipe Hint - Mobile Only - Better positioned */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 pt-2 md:hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col items-center gap-1 text-white/40 text-xs">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                <span>Swipe down to close</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

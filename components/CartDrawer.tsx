"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { X } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (!isOpen) return null;

  const isEmpty = items.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l-4 border-white z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-white/20">
          <h2 className="text-2xl font-black text-white">YOUR CART</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-xl font-black text-white/50 mb-4">CART EMPTY</p>
              <p className="text-sm text-white/30 mb-6">Add some cognitive wearables</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white text-black font-bold text-sm hover:bg-white/90"
              >
                KEEP SHOPPING
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-white/10 pb-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-white/5 border border-white/20 flex-shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white mb-1">{item.name}</h3>
                    <p className="text-xs font-mono text-white/50 mb-2">R$ {item.price.toFixed(2)}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 bg-white text-black font-black text-xs flex items-center justify-center hover:bg-white/90"
                      >
                        −
                      </button>
                      <span className="text-sm font-mono text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-white text-black font-black text-xs flex items-center justify-center hover:bg-white/90"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-xs text-white/40 hover:text-white/80 uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t-2 border-white/20 p-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-black text-white">TOTAL</span>
              <span className="text-2xl font-mono font-black text-white">R$ {totalPrice.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push("/checkout");
                  onClose();
                }}
                className="w-full py-3 bg-white text-black font-black text-sm hover:bg-white/90 transition-colors"
              >
                CHECKOUT
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-white text-white font-black text-sm hover:bg-white/10 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

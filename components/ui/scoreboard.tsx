"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import type { Inventory, MarketPrices } from "@/types/api"

interface Product {
  name: string;
  images: string[];
  price: number;
  [key: string]: any;
}

interface ScoreboardProps {
  inventory: Inventory;
  products?: Product[];
  marketPrices?: MarketPrices;
  onMakeOffer?: (productId: string, productName: string, price: number) => void;
  onAddToCart?: (productId: string, productName: string, price: number, image: string) => void;
}

export function Scoreboard({ inventory, products: catalogProducts, marketPrices, onMakeOffer, onAddToCart }: ScoreboardProps) {
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set())

  if (!inventory || !inventory.products) {
    return null
  }

  // Create a map of product names to catalog data for image lookup
  const catalogMap = catalogProducts?.reduce((acc, p) => {
    const key = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    acc[key] = p;
    return acc;
  }, {} as Record<string, Product>) || {};

  const products = Object.entries(inventory.products).map(([id, product]) => ({
    id,
    ...product
  }))

  const toggleTradeHistory = (productId: string) => {
    setExpandedTrades(prev => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-black text-white mb-2">COLLECTOR SCOREBOARD</h2>
        <div className="flex gap-4 justify-center text-xs font-mono text-white/50">
          <span>Claimed: {products.filter(p => p.sold).length}</span>
          <span>Available: {products.filter(p => !p.sold).length}</span>
          <span>Total: {products.length}</span>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto space-y-1">
        {products.map((product, index) => {
          const marketPrice = marketPrices?.marketPrices?.[product.id];
          const hasOffers = marketPrice && marketPrice.totalOffers > 0;
          const isExpanded = expandedTrades.has(product.id);
          const currentPrice = marketPrice?.highestOffer || 149;

          const tradeHistory = hasOffers ? [
            { price: 149, buyer: "anon_001", date: "2d ago" },
            { price: currentPrice, buyer: product.collectorNickname || "anon_002", date: "1d ago" },
          ] : [];

          return (
            <div key={product.id} className="border border-white/20 bg-white/5">
              {/* Main Row */}
              <div className="flex items-center gap-3 p-2">
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-white/10 border border-white/20">
                  {(() => {
                    const catalogProduct = catalogMap[product.id];
                    const imageSrc = catalogProduct?.images?.[0]
                      ? `/images/${catalogProduct.images[0]}`
                      : `/images/${product.id.toLowerCase().replace(/\s+/g, '-')}.jpg`;

                    return (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/30">#{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-semibold text-white truncate">{product.name}</span>
                  </div>
                  <div className="text-xs text-white/50 font-mono">
                    {product.sold && product.collectorNickname ? `@${product.collectorNickname}` : 'Available'}
                  </div>
                </div>

                {/* Trades */}
                {hasOffers && (
                  <button
                    onClick={() => toggleTradeHistory(product.id)}
                    className="px-2 py-1 text-xs font-mono text-white/50 border border-white/20"
                  >
                    {marketPrice.totalOffers} {isExpanded ? '▲' : '▼'}
                  </button>
                )}

                {/* Add to Cart */}
                <button
                  onClick={() => onAddToCart?.(product.id, product.name, currentPrice, `/images/products/${product.id}.png`)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-black border border-white/40 hover:bg-white hover:text-black transition-colors"
                  title="Add to cart"
                >
                  🛒
                </button>

                {/* Make Offer */}
                <button
                  onClick={() => onMakeOffer?.(product.id, product.name, currentPrice)}
                  className="px-3 py-1.5 text-xs font-bold text-black bg-white hover:bg-white/90 transition-colors"
                >
                  💰 OFFER
                </button>
              </div>

              {/* Trade History */}
              {isExpanded && hasOffers && (
                <div className="border-t border-white/10 bg-black/20 px-2 py-1">
                  <div className="text-xs font-mono text-white/30 mb-1">TRADES</div>
                  {tradeHistory.map((trade, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono py-0.5 text-white/50">
                      <span>@{trade.buyer}</span>
                      <span>{trade.date}</span>
                      <span className="text-white">R${trade.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

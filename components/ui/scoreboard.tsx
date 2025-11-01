"use client"

import { motion } from "framer-motion"
import { ChevronDown, DollarSign } from "lucide-react"
import { useState } from "react"
import type { Inventory, MarketPrices } from "@/types/api"

interface ScoreboardProps {
  inventory: Inventory;
  marketPrices?: MarketPrices;
  onMakeOffer?: (productId: string, productName: string) => void
}

export function Scoreboard({ inventory, marketPrices, onMakeOffer }: ScoreboardProps) {
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set())

  if (!inventory || !inventory.products) {
    return null
  }

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
    <div className="w-full space-y-8">
      {/* Header - Minimal B&W */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl md:text-5xl font-black text-white">COLLECTOR SCOREBOARD</h2>
        <div className="flex gap-6 justify-center items-center text-sm font-mono text-white/60">
          <span>Claimed: {products.filter(p => p.sold).length}</span>
          <span>•</span>
          <span>Available: {products.filter(p => !p.sold).length}</span>
          <span>•</span>
          <span>Total: {products.length}</span>
        </div>
      </div>

      {/* Clean List - No grid, just vertical */}
      <div className="max-w-4xl mx-auto space-y-2">
        {products.map((product, index) => {
          const marketPrice = marketPrices?.marketPrices?.[product.id];
          const hasOffers = marketPrice && marketPrice.totalOffers > 0;
          const isExpanded = expandedTrades.has(product.id);

          // Mock trade history (you'll replace with real data)
          const tradeHistory = hasOffers ? [
            { price: 149, buyer: "anon_001", date: "2d ago" },
            { price: marketPrice.highestOffer, buyer: product.collectorNickname || "anon_002", date: "1d ago" },
          ] : [];

          return (
            <motion.div
              key={product.id}
              className="border-2 border-white/20 bg-white/5 hover:border-white/40 transition-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Main Row */}
              <div className="flex items-center gap-4 p-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 flex-shrink-0 bg-white/10 border border-white/20 overflow-hidden">
                  <img
                    src={`/images/${product.id.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/40 text-xs">IMG</div>';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-white/40">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {product.name}
                    </h3>
                  </div>

                  {/* Buyer nickname or status */}
                  {product.sold && product.collectorNickname ? (
                    <div className="text-xs text-white/60 font-mono">
                      @{product.collectorNickname}
                    </div>
                  ) : (
                    <div className="text-xs text-white/40 font-mono">
                      Available
                    </div>
                  )}
                </div>

                {/* Trade History Toggle (if has offers) */}
                {hasOffers && (
                  <button
                    onClick={() => toggleTradeHistory(product.id)}
                    className="px-3 py-1 text-xs font-mono text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{marketPrice.totalOffers} trade{marketPrice.totalOffers !== 1 ? 's' : ''}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                )}

                {/* Make Offer Button - Always on right */}
                <button
                  onClick={() => onMakeOffer?.(product.id, product.name)}
                  className="px-4 py-2 text-sm font-bold text-black bg-white hover:bg-white/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span>💰</span>
                  <span>MAKE OFFER</span>
                </button>
              </div>

              {/* Trade History Dropdown */}
              {isExpanded && hasOffers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 bg-white/5 px-3 py-2 space-y-1"
                >
                  <div className="text-xs font-mono text-white/40 mb-2">TRADE HISTORY</div>
                  {tradeHistory.map((trade, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/5 last:border-0">
                      <span className="text-white/60">@{trade.buyer}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40">{trade.date}</span>
                        <span className="text-white font-semibold">R${trade.price}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Trophy, User, Clock, Check, X, DollarSign, Sparkles } from "lucide-react"
import { useState } from "react"
import type { Inventory, MarketPrices } from "@/types/api"

interface ScoreboardProps {
  inventory: Inventory;
  marketPrices?: MarketPrices;
  onMakeOffer?: (productId: string, productName: string) => void
}

export function Scoreboard({ inventory, marketPrices, onMakeOffer }: ScoreboardProps) {
  if (!inventory || !inventory.products) {
    return null
  }

  const products = Object.entries(inventory.products).map(([id, product]) => ({
    id,
    ...product
  }))

  const soldItems = products.filter(p => p.sold).sort((a, b) =>
    new Date(b.soldAt || 0).getTime() - new Date(a.soldAt || 0).getTime()
  )
  const availableItems = products.filter(p => !p.sold)

  return (
    <div className="w-full space-y-12">
      {/* Header - Minimal */}
      <div className="text-center space-y-4">
        <h2 className="text-5xl md:text-6xl font-black text-white">COLLECTOR SCOREBOARD</h2>
        <div className="flex gap-8 justify-center items-center text-base font-mono text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span>Claimed: {soldItems.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <span>Available: {availableItems.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span>Total: {products.length}</span>
          </div>
        </div>
      </div>

      {/* Scoreboard Grid - Even layout for 31 items */}
      <div className="max-w-7xl mx-auto">
        {/* First item (1 at top) */}
        <div className="flex justify-center mb-6">
          {products.slice(0, 1).map((product) => {
            const marketPrice = marketPrices?.marketPrices?.[product.id];
            const hasOffers = marketPrice && marketPrice.totalOffers > 0;
            const priceGain = marketPrice?.priceAppreciation || 0;
            const isTrending = marketPrice?.isTrending || false;

            return (
              <motion.div
                key={product.id}
                className="p-6 rounded-lg border-2 bg-white/10 border-white/40 hover:border-white transition-all max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 text-center">{product.name}</h3>
                <p className="text-sm text-white/60 text-center font-mono mb-4">FEATURED #01</p>
                {!product.sold && (
                  <button
                    onClick={() => alert('PIX Payment for ' + product.name + ' - R$149')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95"
                  >
                    PIX IT NOW - R$149
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Remaining 30 in even grid (2 cols) */}
        <div className="grid md:grid-cols-2 gap-4">
        {products.slice(1).map((product, index) => {
          const marketPrice = marketPrices?.marketPrices?.[product.id];
          const hasOffers = marketPrice && marketPrice.totalOffers > 0;
          const priceGain = marketPrice?.priceAppreciation || 0;
          const isTrending = marketPrice?.isTrending || false;

          return (
            <motion.div
              key={product.id}
              className={`p-4 rounded-lg border-2 ${
                product.sold
                  ? 'bg-white/5 border-white/30'
                  : hasOffers
                  ? 'bg-white/10 border-white/40'
                  : 'bg-white/5 border-white/20'
              } hover:border-white transition-all relative`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-white/50">
                    #{String(index + 2).padStart(2, '0')}
                  </span>
                  <h3 className="font-semibold text-sm md:text-base truncate">
                    {product.name}
                  </h3>
                </div>
                {product.sold && product.collectorNickname ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                      <span className="text-primary font-medium text-sm md:text-base">
                        {product.collectorNickname}
                      </span>
                      {product.soldAt && (
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          {new Date(product.soldAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {onMakeOffer && (
                      <button
                        onClick={() => onMakeOffer(product.id, product.name)}
                        className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-white/80 transition-colors bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md"
                      >
                        <DollarSign className="h-3 w-3" />
                        Make Offer
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => alert('PIX Payment for ' + product.name + ' - R$149')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 text-sm"
                    >
                      PIX IT NOW
                    </button>
                    <div className="flex items-center gap-2 text-white/60 text-xs justify-center">
                      <Clock className="h-3 w-3" />
                      <span>Instant checkout</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {/* Trending indicator */}
                {isTrending && !product.sold && (
                  <div className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                    🔥 HOT
                  </div>
                )}

                {product.sold ? (
                  <>
                    <Badge className="bg-white hover:bg-white/90 text-black">
                      <Check className="h-3 w-3 mr-1" />
                      CLAIMED
                    </Badge>
                    {product.soldPrice && (
                      <span className="text-xs font-mono text-muted-foreground">
                        Sold: R${product.soldPrice}
                      </span>
                    )}
                    {hasOffers && marketPrice.highestOffer > (product.soldPrice || 149) && (
                      <div className="text-xs font-bold text-white">
                        Best Offer: R${marketPrice.highestOffer}
                        <span className="text-white ml-1">+{marketPrice.percentageGain}%</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Badge className="bg-white hover:bg-white/90 text-black animate-pulse">
                      <Sparkles className="h-3 w-3 mr-1" />
                      1 LEFT
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      Base: R$149
                    </span>
                    {hasOffers && (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white">
                          Best: R${marketPrice.highestOffer}
                        </div>
                        {priceGain > 0 && (
                          <div className="text-xs font-bold text-white">
                            +R${priceGain} (+{marketPrice.percentageGain}%)
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {marketPrice.totalOffers} offer{marketPrice.totalOffers !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Recently Claimed */}
      {soldItems.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
            🎃 Recently Claimed
          </h3>
          <div className="space-y-2">
            {soldItems.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-white" />
                  <div>
                    <div className="font-semibold text-sm md:text-base">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      by <span className="text-primary font-medium">{item.collectorNickname}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.soldAt && new Date(item.soldAt).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </div>
  )
}

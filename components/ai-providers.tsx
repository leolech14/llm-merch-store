"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * AI Providers Section
 * Shows Claude logo and AI provider info
 * B&W strict compliance
 */
export function AIProviders() {
  return (
    <section className="py-20 bg-black border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black text-white">
            POWERED BY AI
          </h2>

          {/* Claude Logo */}
          <motion.div
            className="flex justify-center items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="p-8 bg-white/5 border border-white/20 rounded-lg backdrop-blur-sm">
              <img
                src="/providers/Claude.svg"
                alt="Claude AI"
                className="h-16 w-auto opacity-90 hover:opacity-100 transition-opacity"
                style={{ filter: 'invert(1)' }}
              />
            </div>
          </motion.div>

          {/* Description */}
          <p className="text-lg text-white/70 font-mono max-w-2xl mx-auto">
            Ask questions about the store. Get answers from Claude.
            <br />
            Real AI. Real responses. Real time.
          </p>

          {/* QR Code */}
          <motion.div
            className="pt-8 flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
              <img
                src="/qr-code.png"
                alt="QR Code - llmmerch.space"
                className="w-48 h-48 md:w-64 md:h-64"
              />
              <p className="text-xs text-white/50 font-mono mt-3">
                Scan to visit
              </p>
            </div>
          </motion.div>

          {/* Provider Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20">
              <img
                src="/providers/Claude.svg"
                alt="Claude"
                className="h-8 opacity-70 hover:opacity-100 transition-opacity"
                style={{ filter: 'invert(1)' }}
              />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20">
              <img
                src="/providers/Untitled design (82).png"
                alt="AI Provider"
                className="h-12 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20">
              <img
                src="/providers/Untitled design (87).png"
                alt="AI Provider"
                className="h-12 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20">
              <img
                src="/providers/Untitled (1600 x 800 px) (1).png"
                alt="AI Provider"
                className="h-12 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

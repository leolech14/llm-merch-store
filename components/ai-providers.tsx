"use client";

import { motion } from "framer-motion";

/**
 * AI Providers Section
 * Special thanks to Claude and Claude Code CLI
 * Development timeline + tech acknowledgment
 * B&W strict compliance
 */
export function AIProviders() {
  return (
    <section className="py-20 bg-black border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Special Thanks Header */}
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-white">
              SPECIAL THANKS
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-2xl md:text-3xl text-white font-mono">
                Built with Claude on Claude Code CLI
              </p>
              <p className="text-lg text-white/60">
                This entire store — from concept to production deployment — was developed
                <br />
                in a single session using Anthropic's Claude Code CLI.
                <br />
                <span className="text-white font-bold">2 hours. 11 tasks. 25+ deployments.</span>
              </p>
            </div>
          </div>

          {/* Claude Logo */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="p-12 bg-white/5 border-2 border-white/20 rounded-lg backdrop-blur-sm">
              <img
                src="/providers/Claude.svg"
                alt="Claude AI via Claude Code CLI"
                className="h-24 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
              <p className="text-center mt-4 text-sm text-white/50 font-mono">
                Powered by Claude Sonnet 4.5
              </p>
            </div>
          </motion.div>

          {/* Development Timeline */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-8 text-center">
              DEVELOPMENT TIMELINE
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Oct 30 • 18:00</span>
                <span className="text-white text-xs md:text-sm">Project initialization • 31 product designs mapped</span>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Oct 31 • 19:00</span>
                <span className="text-white text-xs md:text-sm">8 parallel workers • Type safety 74% improvement</span>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Oct 31 • 22:00</span>
                <span className="text-white text-xs md:text-sm">6 hero variants created • Aurora B&W gradient</span>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Nov 1 • 00:00</span>
                <span className="text-white text-xs md:text-sm">AI failure hero • "I LOST MY HUMAN'S MONEY..."</span>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Nov 1 • 01:00</span>
                <span className="text-white text-xs md:text-sm">Experiment polished • "SO CRINGY" 10x bigger</span>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Nov 1 • 02:00</span>
                <span className="text-white text-xs md:text-sm">Meta tagline • "IT IS ACTUALLY GENIUS"</span>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 border-l-4 border-white/60">
                <span className="text-white/50 min-w-[140px] text-xs md:text-sm">Nov 1 • 02:30</span>
                <span className="text-white text-xs md:text-sm">Scoreboard redesigned • AI providers added • LIVE</span>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-black text-white">
              BUILT WITH
            </h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-white font-bold mb-2">Frontend</h4>
                <p className="text-sm text-white/60 font-mono">
                  Next.js 16 • React 19 • TypeScript
                  <br />
                  Tailwind CSS 4 • Framer Motion
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-white font-bold mb-2">Backend</h4>
                <p className="text-sm text-white/60 font-mono">
                  Vercel Serverless • Event Store
                  <br />
                  Analytics • Device Fingerprinting
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-white font-bold mb-2">Design</h4>
                <p className="text-sm text-white/60 font-mono">
                  100% Black & White Palette
                  <br />
                  Minimal • Direct • Ironic
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-white font-bold mb-2">AI/LLM</h4>
                <p className="text-sm text-white/60 font-mono">
                  Claude Sonnet 4.5
                  <br />
                  Claude Code CLI • Anthropic API
                </p>
              </div>
            </div>
          </div>

          {/* Provider Logos Grid */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white/50 mb-6 text-center font-mono">
              DEVELOPMENT TOOLS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20 hover:bg-white/10 transition-colors">
                <img
                  src="/providers/Claude.svg"
                  alt="Claude"
                  className="h-8 opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20 hover:bg-white/10 transition-colors">
                <img
                  src="/providers/Untitled design (82).png"
                  alt="Development Tool"
                  className="h-12 opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20 hover:bg-white/10 transition-colors">
                <img
                  src="/providers/Untitled design (87).png"
                  alt="Development Tool"
                  className="h-12 opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center h-20 hover:bg-white/10 transition-colors">
                <img
                  src="/providers/Untitled (1600 x 800 px) (1).png"
                  alt="Development Tool"
                  className="h-12 opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          {/* Final Note */}
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-base text-white/50 font-mono italic">
              "From concept to deployment, Claude Code CLI transformed
              <br />
              scattered product images into a complete e-commerce experience."
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

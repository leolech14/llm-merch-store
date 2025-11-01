"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AI Chat Component
 * Clean B&W input bar for asking questions
 */
export function AIChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();
      setAnswer(data.answer || data.error || 'No response');
    } catch (error) {
      setAnswer('Error connecting to AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input Bar */}
      <form onSubmit={handleAsk} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about the store..."
          disabled={loading}
          className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 font-mono text-sm focus:outline-none focus:border-white/60 transition-colors disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'THINKING...' : 'ASK'}
        </button>
      </form>

      {/* Answer Display */}
      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-6 bg-white/5 border-l-4 border-white/60"
          >
            <div className="text-xs font-mono text-white/40 mb-2">CLAUDE:</div>
            <div className="text-base text-white/90 font-mono leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

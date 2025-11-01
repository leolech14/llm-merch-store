"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        className="max-w-lg w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-2xl border border-border/50">
          <div className="text-center space-y-6">
            {/* Logo/Icon */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center rotate-3">
              <Zap className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                LLM.Merch <span className="text-primary">Admin</span>
              </h1>
              <p className="text-muted-foreground">
                Educational Experiment Dashboard
              </p>
            </div>

            {/* Description */}
            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm text-foreground/80">
                <span className="font-semibold">Access to:</span>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Real-time metrics & analytics</li>
                <li>• Hero A/B testing engine</li>
                <li>• System controls (toggle features)</li>
                <li>• Progressive Hero configuration</li>
                <li>• Educational insights</li>
              </ul>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              className="w-full h-14 px-6 rounded-xl bg-foreground text-background font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Footer Note */}
            <p className="text-xs text-muted-foreground/60">
              Restricted to authorized admins only
              <br />
              Educational experiment • Metrics dashboard
            </p>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-2"
          >
            ← Back to store
          </a>
        </div>
      </motion.div>
    </div>
  );
}

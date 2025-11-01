"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-500/5 to-background p-4">
      <motion.div
        className="max-w-md w-full text-center space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
          <ShieldX className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-3">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-2">
            This area is restricted to admin users only.
          </p>
          {session?.user?.email && (
            <p className="text-sm text-muted-foreground">
              Signed in as: <span className="font-mono">{session.user.email}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full h-12 px-6 rounded-lg bg-foreground text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </a>

          {session && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block w-full h-12 px-6 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-muted transition"
            >
              Sign Out
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground/60">
          Need admin access? Contact the project owner.
        </p>
      </motion.div>
    </div>
  );
}

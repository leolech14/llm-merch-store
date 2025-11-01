"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Stats } from "@/types/api";
import {
  Activity,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  Zap,
  Eye,
  EyeOff,
  BarChart3,
  TestTube2,
  Brain,
  Package,
} from "lucide-react";

/**
 * Admin Panel - Educational Experiment Dashboard
 *
 * Shows:
 * - Real-time metrics
 * - Hero A/B testing results
 * - System controls (toggle features)
 * - Progressive Hero configuration
 * - Educational insights (how the system works)
 */

interface HeroVariantStats {
  views: number;
  clicks: number;
  conversion: number;
}

interface HeroConfig {
  variantOrder: string[];
  currentVariant?: string;
  winner?: string;
  wtf?: HeroVariantStats;
  cognitive?: HeroVariantStats;
  minimal?: HeroVariantStats;
  skate?: HeroVariantStats;
  joke?: HeroVariantStats;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const [metrics, setMetrics] = useState<Stats | null>(null);
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [systemConfig, setSystemConfig] = useState({
    progressiveHeroEnabled: true,
    abTestingEnabled: true,
    analyticsEnabled: true,
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetchMetrics();
      fetchHeroConfig();

      // Refresh every 10s
      const interval = setInterval(fetchMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }

  async function fetchHeroConfig() {
    try {
      const res = await fetch('/api/admin/hero-config');
      const data = await res.json();
      setHeroConfig(data);
    } catch (error) {
      console.error('Error fetching hero config:', error);
    }
  }

  async function toggleFeature(feature: string) {
    try {
      await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          enabled: !systemConfig[feature as keyof typeof systemConfig],
        }),
      });

      setSystemConfig({
        ...systemConfig,
        [feature]: !systemConfig[feature as keyof typeof systemConfig],
      });
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  }

  // Not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <motion.div
          className="max-w-md w-full bg-card rounded-2xl p-8 shadow-xl border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
              <p className="text-muted-foreground">
                Sign in with Google to access the educational experiment dashboard
              </p>
            </div>
            <button
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              className="w-full h-12 px-6 rounded-lg bg-foreground text-background font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </button>
            <p className="text-xs text-muted-foreground">
              Educational experiment access • Metrics & controls
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if user is admin
  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
            <EyeOff className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Unauthorized</h1>
          <p className="text-muted-foreground">
            You need admin access to view this page.
            <br />
            Signed in as: {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-6 py-3 rounded-lg bg-foreground text-background font-semibold hover:opacity-90 transition"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Educational Experiment Dashboard</h1>
              <p className="text-xs text-muted-foreground">LLM.Merch Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-right hidden md:block">
              <p className="font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Visitors"
            value={metrics?.totalVisitors || 0}
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Page Views"
            value={metrics?.totalPageViews || 0}
            color="emerald"
          />
          <StatCard
            icon={<ShoppingCart className="w-6 h-6" />}
            label="Cart Adds"
            value={metrics?.addToCartEvents || 0}
            color="amber"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Sales"
            value={metrics?.totalSales || 0}
            color="rose"
          />
        </div>

        {/* Orders Quick Access */}
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Orders Management
            </h2>
            <button
              onClick={() => window.location.href = '/admin/orders'}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              View All Orders
            </button>
          </div>
          <p className="text-muted-foreground">
            View and manage customer orders, update fulfillment status, and export orders to CSV for manufacturing.
          </p>
        </div>

        {/* System Controls */}
        <div className="bg-card rounded-xl p-6 border">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            System Controls
          </h2>
          <div className="space-y-4">
            <ToggleControl
              icon={<Brain className="w-5 h-5" />}
              label="Progressive Hero System"
              description="Auto-changes hero based on visit count. Shows system cleverness."
              enabled={systemConfig.progressiveHeroEnabled}
              onToggle={() => toggleFeature('progressiveHeroEnabled')}
            />
            <ToggleControl
              icon={<TestTube2 className="w-5 h-5" />}
              label="A/B Testing Engine"
              description="Automatically optimizes hero variant based on conversion data."
              enabled={systemConfig.abTestingEnabled}
              onToggle={() => toggleFeature('abTestingEnabled')}
            />
            <ToggleControl
              icon={<BarChart3 className="w-5 h-5" />}
              label="Advanced Analytics"
              description="Track detailed metrics, device fingerprints, and engagement."
              enabled={systemConfig.analyticsEnabled}
              onToggle={() => toggleFeature('analyticsEnabled')}
            />
          </div>
        </div>

        {/* Hero A/B Testing Results */}
        <div className="bg-card rounded-xl p-6 border">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TestTube2 className="w-6 h-6 text-primary" />
            Hero A/B Testing Results
          </h2>

          {heroConfig ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <HeroVariantCard
                  variant="WTF"
                  views={heroConfig.wtf?.views || 0}
                  clicks={heroConfig.wtf?.clicks || 0}
                  conversion={heroConfig.wtf?.conversion || 0}
                />
                <HeroVariantCard
                  variant="Cognitive"
                  views={heroConfig.cognitive?.views || 0}
                  clicks={heroConfig.cognitive?.clicks || 0}
                  conversion={heroConfig.cognitive?.conversion || 0}
                />
                <HeroVariantCard
                  variant="Skate"
                  views={heroConfig.skate?.views || 0}
                  clicks={heroConfig.skate?.clicks || 0}
                  conversion={heroConfig.skate?.conversion || 0}
                />
                <HeroVariantCard
                  variant="Minimal"
                  views={heroConfig.minimal?.views || 0}
                  clicks={heroConfig.minimal?.clicks || 0}
                  conversion={heroConfig.minimal?.conversion || 0}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm font-medium mb-2">🧠 Educational Insight:</p>
                <p className="text-sm text-muted-foreground">
                  The A/B testing engine automatically serves the highest-converting hero variant.
                  Current winner: <span className="font-bold text-foreground">{heroConfig.winner || 'Testing...'}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading hero testing data...</p>
          )}
        </div>

        {/* Product Performance */}
        <div className="bg-card rounded-xl p-6 border">
          <h2 className="text-2xl font-bold mb-6">Top Performing Products</h2>
          <div className="space-y-3">
            {metrics?.topProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.clicks} clicks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{metrics.productLikes?.[product.name] || 0} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Insights */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl p-6 border-2 border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            How This System Works (Educational)
          </h2>
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed">
              <span className="font-semibold">Device Fingerprinting:</span> Tracks visitors without cookies using browser characteristics (screen size, timezone, language). Privacy-first, LGPD compliant.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold">Progressive Hero:</span> Shows different hero variants based on visit count (1st=WTF, 2nd=Cognitive, 3rd=Skate, 4+=Minimal). Adapts messaging to user familiarity.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold">A/B Testing Engine:</span> Automatically calculates conversion rates per hero variant and serves the winner more frequently. Self-optimizing system.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold">Event Store:</span> Single source of truth using event sourcing. Every action is immutable event. Metrics computed from event stream. Audit trail complete.
            </p>
          </div>
        </div>

        {/* Raw Data */}
        <details className="bg-card rounded-xl p-6 border">
          <summary className="cursor-pointer font-bold text-lg mb-4">
            📊 Raw Metrics Data (JSON)
          </summary>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const colors = {
    blue: 'bg-white/10 text-white',
    emerald: 'bg-white/10 text-white',
    amber: 'bg-white/10 text-white',
    rose: 'bg-white/10 text-white',
  };

  return (
    <div className="bg-card rounded-xl p-6 border">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-3xl font-bold mb-1">{value.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ToggleControl({ icon, label, description, enabled, onToggle }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-1 text-primary">{icon}</div>
        <div className="flex-1">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <motion.div
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
          animate={{ left: enabled ? 30 : 4 }}
          transition={{ type: "spring", damping: 20 }}
        />
      </button>
    </div>
  );
}

function HeroVariantCard({ variant, views, clicks, conversion }: {
  variant: string;
  views: number;
  clicks: number;
  conversion: number;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 border">
      <p className="font-bold mb-3">{variant} Hero</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Views:</span>
          <span className="font-mono font-semibold">{views}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Clicks:</span>
          <span className="font-mono font-semibold">{clicks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Conversion:</span>
          <span className={`font-mono font-bold ${conversion >= 40 ? 'text-emerald-500' : 'text-foreground'}`}>
            {conversion.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

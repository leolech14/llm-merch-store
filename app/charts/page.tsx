"use client";

import { useState, useEffect } from "react";
import { WebsiteScaffold } from "@/components/website-scaffold";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Hidden Charts Page - REAL DATA
 * Connected to actual APIs
 * Reset before events by clearing data files
 */

export default function ChartsPage() {
  const [stats, setStats] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, inventoryRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/inventory')
        ]);

        const statsData = await statsRes.json();
        const inventoryData = await inventoryRes.json();

        setStats(statsData);
        setInventory(inventoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-white/60 font-mono">Loading data...</div>
      </div>
    );
  }

  // Prepare chart data from real API responses
  const productData = inventory ? [
    { name: 'Available', value: inventory.stats?.available || 0 },
    { name: 'Sold', value: inventory.stats?.soldOut || 0 },
  ] : [];

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Website Scaffold */}
      <WebsiteScaffold />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white">
              SHOW ME THE
              <span className="block mt-2">DATA</span>
            </h1>
            <p className="text-lg text-white/60 font-mono">
              Live analytics • Updates every 10 seconds
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 text-xs text-white/50 font-mono">
                Hidden page • Connected to real APIs
              </span>
            </div>
          </div>

          {/* Real-time Stats Grid */}
          <section className="grid md:grid-cols-4 gap-6">
            <div className="border-2 border-white/20 p-6 bg-white/5">
              <div className="text-4xl font-black text-white font-mono mb-2">
                {stats?.totalVisitors || 0}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest">
                TOTAL VISITORS
              </div>
            </div>

            <div className="border-2 border-white/20 p-6 bg-white/5">
              <div className="text-4xl font-black text-white font-mono mb-2">
                {stats?.totalPageViews || 0}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest">
                PAGE VIEWS
              </div>
            </div>

            <div className="border-2 border-white/20 p-6 bg-white/5">
              <div className="text-4xl font-black text-white font-mono mb-2">
                {stats?.addToCartEvents || 0}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest">
                ADD TO CART
              </div>
            </div>

            <div className="border-2 border-white/20 p-6 bg-white/5">
              <div className="text-4xl font-black text-white font-mono mb-2">
                {stats?.totalSales || 0}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest">
                SALES
              </div>
            </div>
          </section>

          {/* Inventory Distribution - Pie Chart */}
          <section className="border-2 border-white/20 p-8 bg-white/5">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white mb-2">INVENTORY STATUS</h2>
              <p className="text-sm text-white/50 font-mono">Available vs Sold products</p>
            </div>
            {productData.length > 0 ? (
              <div className="flex items-center justify-center gap-12">
                <ResponsiveContainer width="50%" height={300}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      stroke="#000000"
                      strokeWidth={2}
                    >
                      {productData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ffffff' : '#ffffff40'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white border-2 border-black"></div>
                    <div>
                      <div className="text-2xl font-black text-white font-mono">
                        {inventory?.stats?.available || 0}
                      </div>
                      <div className="text-xs text-white/50">Available</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/40 border-2 border-black"></div>
                    <div>
                      <div className="text-2xl font-black text-white font-mono">
                        {inventory?.stats?.soldOut || 0}
                      </div>
                      <div className="text-xs text-white/50">Sold</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-white/40 font-mono text-sm">
                No inventory data yet
              </div>
            )}
            <div className="mt-4 text-xs text-white/40 font-mono text-right">
              {inventory?.stats?.totalProducts || 31} total pieces • Live data
            </div>
          </section>

          {/* Top Products - From Real API */}
          <section className="border-2 border-white/20 p-8 bg-white/5">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white mb-2">TOP PRODUCTS</h2>
              <p className="text-sm text-white/50 font-mono">Most clicked this session</p>
            </div>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.slice(0, 5).map((item: any, i: number) => {
                  const maxClicks = stats.topProducts[0].clicks || 1;
                  const percent = (item.clicks / maxClicks) * 100;

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white font-mono">{item.name}</span>
                        <span className="text-white/60 font-mono">{item.clicks}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 border border-white/20">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-white/40 font-mono text-sm">
                No product data yet • Start browsing to generate
              </div>
            )}
            <div className="mt-4 text-xs text-white/40 font-mono text-right">
              Real-time tracking • Resets on data clear
            </div>
          </section>

          {/* Engagement Rate */}
          <section className="border-2 border-white/20 p-8 bg-white/5">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white mb-2">ENGAGEMENT</h2>
              <p className="text-sm text-white/50 font-mono">Site interaction metrics</p>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-8xl font-black text-white font-mono">
                  {stats?.engagementRate || 0}%
                </div>
                <div className="text-sm text-white/50 uppercase tracking-widest mt-4">
                  Engagement Rate
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-white/40 font-mono text-right">
              Calculated: (addToCart + likes) / pageViews
            </div>
          </section>

          {/* Footer Note */}
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-sm text-white/40 font-mono">
              All data connected to live APIs • Clear data/telemetry.json before events
              <br />
              Access: <span className="text-white">/charts</span> (not in navigation)
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

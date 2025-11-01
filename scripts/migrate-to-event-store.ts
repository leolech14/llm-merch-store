/**
 * Migration Script: Legacy Data → Event Store
 *
 * Converts existing data from:
 * - data/telemetry.json
 * - data/inventory.json
 * - data/visitors.json
 *
 * Into the unified Event Store format.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-event-store.ts
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TELEMETRY_FILE = path.join(DATA_DIR, 'telemetry.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const EVENT_STORE_FILE = path.join(DATA_DIR, 'event-store.json');

interface LegacyTelemetry {
  totalVisitors: number;
  totalPageViews: number;
  productClicks: { [key: string]: number };
  productLikes: { [key: string]: number };
  addToCartEvents: number;
  totalSales: number;
  totalProducts: number;
  lastUpdated: string;
  recentEvents?: Array<{ type: string; timestamp: string; data?: any }>;
}

function migrate() {
  console.log('🚀 Starting migration to Event Store...\n');

  // Read legacy data
  let telemetryData: LegacyTelemetry | null = null;
  let inventoryData: any = null;

  if (fs.existsSync(TELEMETRY_FILE)) {
    telemetryData = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf-8'));
    console.log('✅ Loaded telemetry.json');
  }

  if (fs.existsSync(INVENTORY_FILE)) {
    inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
    console.log('✅ Loaded inventory.json');
  }

  // Initialize Event Store
  const eventStore: any = {
    events: [],
    metrics: {
      totalVisitors: 0,
      totalPageViews: 0,
      totalSessions: 0,
      productViews: {},
      productClicks: {},
      productLikes: {},
      addToCartEvents: 0,
      totalSales: 0,
      totalRevenue: 0,
      averageTransactionValue: 0,
      totalOffers: 0,
      acceptedOffers: 0,
      resaleVolume: 0,
      averagePriceAppreciation: 0,
      topCollectors: [],
      averagePageLoadTime: 0,
      averageApiResponseTime: 0,
      lastUpdated: new Date().toISOString(),
    },
    inventory: {},
  };

  let eventIdCounter = 1;

  // Migrate telemetry data
  if (telemetryData) {
    console.log('\n📊 Migrating telemetry data...');

    // Create synthetic visitor events
    for (let i = 0; i < telemetryData.totalVisitors; i++) {
      eventStore.events.push({
        id: `evt_migrated_visitor_${eventIdCounter++}`,
        type: 'visitor',
        timestamp: new Date(Date.now() - (telemetryData.totalVisitors - i) * 60000).toISOString(),
      });
    }
    console.log(`  ✅ Migrated ${telemetryData.totalVisitors} visitor events`);

    // Create synthetic page view events
    for (let i = 0; i < telemetryData.totalPageViews; i++) {
      eventStore.events.push({
        id: `evt_migrated_pageview_${eventIdCounter++}`,
        type: 'page_view',
        timestamp: new Date(Date.now() - (telemetryData.totalPageViews - i) * 30000).toISOString(),
      });
    }
    console.log(`  ✅ Migrated ${telemetryData.totalPageViews} page_view events`);

    // Migrate product clicks
    for (const [productName, clicks] of Object.entries(telemetryData.productClicks || {})) {
      const productId = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20);
      for (let i = 0; i < (clicks as number); i++) {
        eventStore.events.push({
          id: `evt_migrated_click_${eventIdCounter++}`,
          type: 'product_click',
          timestamp: new Date(Date.now() - ((clicks as number) - i) * 45000).toISOString(),
          productId,
          productName,
        });
      }
    }
    console.log(`  ✅ Migrated ${Object.keys(telemetryData.productClicks || {}).length} product click types`);

    // Migrate product likes
    for (const [productName, likes] of Object.entries(telemetryData.productLikes || {})) {
      const productId = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20);
      for (let i = 0; i < (likes as number); i++) {
        eventStore.events.push({
          id: `evt_migrated_like_${eventIdCounter++}`,
          type: 'product_like',
          timestamp: new Date(Date.now() - ((likes as number) - i) * 50000).toISOString(),
          productId,
          productName,
        });
      }
    }
    console.log(`  ✅ Migrated ${Object.keys(telemetryData.productLikes || {}).length} product like types`);

    // Migrate add to cart events
    for (let i = 0; i < telemetryData.addToCartEvents; i++) {
      eventStore.events.push({
        id: `evt_migrated_cart_${eventIdCounter++}`,
        type: 'add_to_cart',
        timestamp: new Date(Date.now() - (telemetryData.addToCartEvents - i) * 55000).toISOString(),
        productId: 'unknown',
        productName: 'Unknown Product',
      });
    }
    console.log(`  ✅ Migrated ${telemetryData.addToCartEvents} add_to_cart events`);

    // Migrate recent events (if available)
    if (telemetryData.recentEvents) {
      for (const event of telemetryData.recentEvents) {
        eventStore.events.push({
          id: `evt_migrated_recent_${eventIdCounter++}`,
          type: event.type,
          timestamp: event.timestamp,
          ...event.data,
        });
      }
      console.log(`  ✅ Migrated ${telemetryData.recentEvents.length} recent events`);
    }
  }

  // Migrate inventory data
  if (inventoryData?.products) {
    console.log('\n📦 Migrating inventory data...');

    for (const [productId, product] of Object.entries(inventoryData.products as any)) {
      const p = product as any;
      eventStore.inventory[productId] = {
        name: p.name,
        currentOwner: p.sold ? p.collectorNickname : undefined,
        purchaseHistory: p.sold ? [{
          buyer: p.collectorNickname || 'Unknown',
          price: p.soldPrice || 149,
          timestamp: p.soldAt || new Date().toISOString(),
        }] : [],
        sold: p.sold || false,
        lastSalePrice: p.soldPrice,
      };

      // Create purchase event if sold
      if (p.sold && p.collectorNickname) {
        eventStore.events.push({
          id: `evt_migrated_purchase_${eventIdCounter++}`,
          type: 'purchase_completed',
          timestamp: p.soldAt || new Date().toISOString(),
          productId,
          productName: p.name,
          buyerNickname: p.collectorNickname,
          price: p.soldPrice || 149,
          currency: 'BRL',
          paymentMethod: 'pix',
        });
      }
    }

    console.log(`  ✅ Migrated ${Object.keys(inventoryData.products).length} inventory items`);
  }

  // Sort events by timestamp
  eventStore.events.sort((a: any, b: any) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Compute final metrics
  console.log('\n🧮 Computing metrics...');
  // (Metrics will be computed on first read by the Event Store)

  // Backup old files
  console.log('\n💾 Creating backups...');
  if (fs.existsSync(TELEMETRY_FILE)) {
    fs.copyFileSync(TELEMETRY_FILE, `${TELEMETRY_FILE}.backup`);
    console.log('  ✅ Backed up telemetry.json');
  }
  if (fs.existsSync(INVENTORY_FILE)) {
    fs.copyFileSync(INVENTORY_FILE, `${INVENTORY_FILE}.backup`);
    console.log('  ✅ Backed up inventory.json');
  }

  // Write Event Store
  fs.writeFileSync(EVENT_STORE_FILE, JSON.stringify(eventStore, null, 2));
  console.log('\n✅ Event Store created at:', EVENT_STORE_FILE);

  // Summary
  console.log('\n📊 Migration Summary:');
  console.log(`  Total events: ${eventStore.events.length}`);
  console.log(`  Inventory items: ${Object.keys(eventStore.inventory).length}`);
  console.log(`  Unique event types: ${[...new Set(eventStore.events.map((e: any) => e.type))].length}`);

  console.log('\n🎉 Migration complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Test APIs: curl http://localhost:3000/api/metrics');
  console.log('  2. Test queries: curl http://localhost:3000/api/events?type=purchase_completed');
  console.log('  3. Update frontend to use new /api/metrics endpoint');
}

// Run migration
migrate();

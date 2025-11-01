# DUPLICATE CODE & PATTERNS - CODE EXAMPLES

## 1. DUPLICATE ensureDataDir() - Found 6 Times

### Pattern Location 1: visitors/route.ts (lines 8-12)
```typescript
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
```

### Pattern Location 2: offers/route.ts (lines 25-30) - IDENTICAL
### Pattern Location 3: inventory/route.ts (lines 21-26) - IDENTICAL
### Pattern Location 4: telemetry/route.ts (lines 23-28) - IDENTICAL
### Pattern Location 5: admin/system-config/route.ts (lines 90-93)
```typescript
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
```

### Pattern Location 6: admin/hero-config/route.ts (lines 135-138) - IDENTICAL

**CONSOLIDATION**:
```typescript
// lib/data-access.ts
export function ensureDataDir(subdir?: string): string {
  const baseDir = path.join(process.cwd(), 'data');
  const fullDir = subdir ? path.join(baseDir, subdir) : baseDir;
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  return fullDir;
}
```

---

## 2. DUPLICATE File Read Pattern - Found 5 Times

### Pattern Location 1: stats/route.ts (lines 12-15)
```typescript
if (fs.existsSync(INVENTORY_FILE)) {
  const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
  totalProducts = Object.keys(inventoryData.products || {}).length;
}
```

### Pattern Location 2: stats/route.ts (lines 17-18)
```typescript
if (fs.existsSync(TELEMETRY_FILE)) {
  const data = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf-8'));
```

### Pattern Location 3: metrics/route.ts (lines 23-25)
```typescript
if (fs.existsSync(INVENTORY_FILE)) {
  const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
  const products = inventoryData.products || {};
```

### Pattern Location 4: market-prices/route.ts (lines 29-31 & 35-37)
```typescript
if (fs.existsSync(OFFERS_FILE)) {
  offersData = JSON.parse(fs.readFileSync(OFFERS_FILE, 'utf-8'));
}
...
if (fs.existsSync(INVENTORY_FILE)) {
  inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
}
```

### Pattern Location 5: hero-config/route.ts (lines 41-42)
```typescript
if (fs.existsSync(HERO_CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(HERO_CONFIG_FILE, 'utf-8'));
}
```

**CONSOLIDATION**:
```typescript
// lib/data-access.ts
export async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

// Usage in route handlers:
export async function GET() {
  const inventoryData = await readJsonFile(INVENTORY_FILE, { products: {} });
  // ...
}
```

---

## 3. DUPLICATE File Write Pattern - Found 4 Times

### Pattern Location 1: visitors/route.ts (lines 30-36)
```typescript
function saveVisitorCount(count: number) {
  ensureDataDir();
  try {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify({ count, lastUpdated: new Date().toISOString() }));
  } catch (error) {
    console.error('Error saving visitors file:', error);
  }
}
```

### Pattern Location 2: offers/route.ts (lines 48-55)
```typescript
function saveOffers(data: OffersData) {
  ensureDataDir();
  try {
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving offers file:', error);
  }
}
```

### Pattern Location 3: inventory/route.ts (lines 73-80)
```typescript
function saveInventory(data: InventoryData) {
  ensureDataDir();
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving inventory file:', error);
  }
}
```

### Pattern Location 4: telemetry/route.ts (lines 53-60)
```typescript
function saveTelemetryData(data: TelemetryData) {
  ensureDataDir();
  try {
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving telemetry file:', error);
  }
}
```

**CONSOLIDATION**:
```typescript
// lib/data-access.ts
export async function writeJsonFile<T>(filePath: string, data: T, pretty = true): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    await fs.promises.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// Usage:
export async function POST(request: Request) {
  // ...
  await writeJsonFile(VISITORS_FILE, { count: newCount, lastUpdated: new Date().toISOString() });
}
```

---

## 4. DUPLICATE Stats Calculation - stats vs metrics

### Problem: Both GET endpoints return similar data

#### `/api/stats` (stats/route.ts:29-42)
```typescript
const stats = {
  totalVisitors: data.totalVisitors || 500,
  totalPageViews: data.totalPageViews || 1247,
  addToCartEvents: data.addToCartEvents || 89,
  totalSales: data.totalSales || 0,
  totalProducts, // ← Calculated from inventory
  totalLikes,     // ← Calculated from telemetry
  topProducts,    // ← Calculated from telemetry
  lastUpdated: data.lastUpdated,
  engagementRate: data.totalVisitors > 0
    ? Math.round((data.addToCartEvents / data.totalVisitors) * 100)
    : 0
};
```

#### `/api/metrics` (metrics/route.ts:16-37)
```typescript
const metrics = getMetrics(); // ← From event-store
// Plus:
return NextResponse.json({
  ...metrics,
  totalProducts, // ← Calculated from inventory
  soldOut,       // ← Calculated from inventory
  available,     // ← Calculated from inventory
});
```

**ISSUE**: Both calculate from different sources:
- `/stats` reads telemetry.json
- `/metrics` reads event-store.json

**CONSOLIDATION**: Use only `/metrics`, deprecate `/stats`

---

## 5. DUPLICATE Visitor Tracking - visitors vs telemetry

### `/api/visitors` (visitors/route.ts:46-51)
```typescript
export async function POST() {
  const currentCount = getVisitorCount();
  const newCount = currentCount + 1;
  saveVisitorCount(newCount);
  return NextResponse.json({ count: newCount });
}
```

**Usage** (app/page.tsx:449):
```typescript
fetch('/api/visitors', { method: 'POST' })
```

### `/api/telemetry` (telemetry/route.ts:71-96)
```typescript
export async function POST(request: Request) {
  // ...
  switch (eventType) {
    case 'visitor':
      telemetry.totalVisitors += 1;
      break;
    // ... other cases
  }
```

**CONSOLIDATION**: Delete `/api/visitors`, use telemetry instead:
```typescript
// In app/page.tsx
await fetch('/api/telemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventType: 'visitor' })
});
```

---

## 6. HARDCODED VALUES IN MULTIPLE FILES

### Base Price (R$149)

#### inventory/route.ts:39
```typescript
const basePrice = 149;
return {
  products: {
    "ask-anything-chest": { ..., soldPrice: basePrice },
    // ... 25 more products
  }
};
```

#### market-prices/route.ts:24
```typescript
const basePrice = 149;
// ... calculations
const highestOffer = productOffers.length > 0
  ? Math.max(...productOffers.map((o: any) => o.offerAmount))
  : basePrice;
```

**CONSOLIDATION**: 
```typescript
// lib/constants.ts or .env
export const BASE_PRODUCT_PRICE = 149; // R$

// Or via system-config API:
const config = await fetch('/api/admin/system-config').then(r => r.json());
const basePrice = config.basePrice || 149;
```

---

### Hardcoded Sale Dates

#### sale-status/route.ts:17-18
```typescript
const startTime = new Date(now.getTime() + (57 * 60 * 60 * 1000) + (25 * 60 * 1000));
const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
```

**PROBLEM**: Cannot change without code redeploy

**CONSOLIDATION**:
```typescript
// admin/system-config/route.ts - extend SystemConfig
interface SystemConfig {
  progressiveHeroEnabled: boolean;
  abTestingEnabled: boolean;
  analyticsEnabled: boolean;
  saleActive: boolean;
  saleStartTime?: string; // ISO string
  saleEndTime?: string;   // ISO string
  lastUpdated: string;
}

// sale-status/route.ts
export async function GET() {
  const config = await readJsonFile(SYSTEM_CONFIG_FILE, defaultConfig);
  
  const startTime = config.saleStartTime 
    ? new Date(config.saleStartTime)
    : new Date(now.getTime() + (57 * 60 * 60 * 1000) + (25 * 60 * 1000));
  
  // ... rest of logic
}
```

---

### Hardcoded Admin Emails

#### auth/[...nextauth]/route.ts:12-15
```typescript
const ADMIN_EMAILS = [
  "your.email@gmail.com",  // ← HARDCODED
];
```

**CONSOLIDATION**:
```typescript
// Requires .env.local
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim())
  .filter(Boolean);

if (ADMIN_EMAILS.length === 0) {
  throw new Error('ADMIN_EMAILS environment variable is not set');
}
```

---

## 7. INCONSISTENT ERROR HANDLING

### Inconsistent Response Format

#### Pattern A: `{ error: '...' }` (market-prices/route.ts:85)
```typescript
return NextResponse.json({ error: 'Failed to calculate market prices' }, { status: 500 });
```

#### Pattern B: `{ success: false, error: '...' }` (offers/route.ts:94-96)
```typescript
return NextResponse.json(
  { success: false, error: 'Missing required fields' },
  { status: 400 }
);
```

#### Pattern C: Both patterns (telemetry/route.ts:110-113)
```typescript
return NextResponse.json({ success: true, telemetry });
// AND
return NextResponse.json({ success: false, error: 'Failed to track event' }, { status: 500 });
```

**CONSOLIDATION**:
```typescript
// lib/api-response.ts
export const ApiResponse = {
  success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  },

  error(message: string, status = 500) {
    return NextResponse.json({ success: false, error: message }, { status });
  },

  validation(errors: Record<string, string>, status = 400) {
    return NextResponse.json(
      { success: false, errors, message: 'Validation failed' },
      { status }
    );
  }
};

// Usage:
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.required) {
      return ApiResponse.validation({ required: 'Field is required' });
    }
    return ApiResponse.success({ result: 'ok' });
  } catch (error) {
    return ApiResponse.error('Internal server error', 500);
  }
}
```

---

## 8. MISSING INPUT VALIDATION

### No EventType Validation (telemetry/route.ts:71-97)
```typescript
export async function POST(request: Request) {
  const { eventType, eventData } = body;

  switch (eventType) {
    case 'page_view':
    case 'visitor':
    case 'product_click':
    // ... etc
  }
  // NO DEFAULT CASE - accepts anything!
}
```

**FIX**:
```typescript
// lib/validation.ts
const VALID_EVENT_TYPES = [
  'page_view', 'visitor', 'product_click', 'product_like',
  // ... etc from EventType
] as const;

export function validateEventType(value: any): boolean {
  return VALID_EVENT_TYPES.includes(value);
}

// telemetry/route.ts
export async function POST(request: Request) {
  const { eventType, eventData } = body;

  if (!validateEventType(eventType)) {
    return ApiResponse.validation({ eventType: 'Invalid event type' });
  }
  // ... rest of logic
}
```

---

### No Query Limit Enforcement (events/route.ts:27)
```typescript
const limitParam = searchParams.get('limit');
const limit = limitParam ? parseInt(limitParam, 10) : 100;

const events = getEvents({
  // ...
  limit,  // ← Could be 1,000,000!
});
```

**FIX**:
```typescript
// lib/validation.ts
const MAX_QUERY_LIMIT = 1000;

export function validateLimit(value: any): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return 100;
  return Math.min(parsed, MAX_QUERY_LIMIT);
}

// events/route.ts
export async function GET(request: NextRequest) {
  const limitParam = searchParams.get('limit');
  const limit = validateLimit(limitParam);
  // ...
}
```

---

## 9. MISSING TYPE SAFETY

### Implicit Any (stats/route.ts:22)
```typescript
const topProducts = Object.entries(data.productClicks || {})
  .sort(([, a], [, b]) => (b as number) - (a as number))  // ← 'as number' needed
  .slice(0, 5)
  .map(([name, clicks]) => ({ name, clicks }));  // ← clicks type unclear
```

**FIX**:
```typescript
interface ProductClick {
  name: string;
  clicks: number;
}

const topProducts = Object.entries(data.productClicks || {})
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([name, clicks]): ProductClick => ({ 
    name, 
    clicks: clicks as number 
  }));
```

---

### Implicit Any (market-prices/route.ts:40-42)
```typescript
Object.entries(inventoryData.products || {}).forEach(([productId, product]: [string, any]) => {
  const productOffers = offersData.offers.filter((o: any) => o.productId === productId);
```

**FIX**:
```typescript
// lib/api-types.ts
export interface Product {
  name: string;
  stock: number;
  sold: boolean;
  soldAt?: string;
  collectorNickname?: string;
  soldPrice?: number;
}

export interface Offer {
  id: string;
  productId: string;
  productName: string;
  buyerEmail: string;
  buyerNickname: string;
  offerAmount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// market-prices/route.ts
Object.entries(inventoryData.products || {})
  .forEach(([productId, product]: [string, Product]) => {
    const productOffers = offersData.offers
      .filter((o: Offer) => o.productId === productId);
```


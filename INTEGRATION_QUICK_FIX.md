# Quick Fix Guide: Backend-Frontend Integration

**TL;DR:** 4 critical bugs found. Fixes provided below.

---

## BUG #1: Inventory Keys Never Match (CRITICAL)

**Problem:**
- Frontend generates product key: `"ask-anything-tee"`
- Backend has: `"ask-anything-chest"`
- Result: `inventory?.products?.[key]?.sold` always returns `undefined`

**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/inventory/route.ts` (lines 42-67)

**Quick Fix:**
Change all backend inventory keys to match frontend generation formula:

```typescript
// BEFORE:
"ask-anything-chest": { name: "Ask Anything Tee", ... }

// AFTER:
"ask-anything-tee": { name: "Ask Anything Tee", ... }
```

**Full mapping needed:**
```typescript
const productKeys = {
  "ask-anything-tee": { name: "Ask Anything Tee", ... },
  "chatgpt-pro-ask": { name: "ChatGPT PRO Ask", ... },  // Not "chatgpt-pro"!
  "mic-icon-tee": { name: "Mic Icon Tee", ... },        // Not "mic-small"!
  "back-propagation-blue": { name: "Back-Propagation (Blue)", ... },
  "back-propagation-red": { name: "Back-Propagation (Red)", ... },
  "cross-attention-tee": { name: "Cross-Attention Tee", ... },
  "self-attention-tee": { name: "Self-Attention Tee", ... },
  "query-key-matrix": { name: "Query-Key Matrix", ... },
  "value-matrix-tee": { name: "Value Matrix Tee", ... },
  "transformer-architecture": { name: "Transformer Architecture", ... },
  "fluffy-creature-layers": { name: "Fluffy Creature Layers", ... },
  "fluffy-creature-y": { name: "Fluffy Creature Y", ... },
  "llm-brunette-color": { name: "LLM Brunette (Color)", ... },
  "llm-brunette-bw": { name: "LLM Brunette (B&W)", ... },
  "llm-brunette-bw-50": { name: "LLM Brunette (B&W-50)", ... },
  "llm-blonde-color": { name: "LLM Blonde (Color)", ... },
  "llm-blonde-bw": { name: "LLM Blonde (B&W)", ... },
  "fresh-models-tee": { name: "Fresh Models Tee", ... },
  "gossip-network": { name: "Gossip Network", ... },
  "information-theory": { name: "Information Theory", ... },
  "information-theory-radial": { name: "Information Theory Radial", ... },
  "circular-node-graph": { name: "Circular Node Graph", ... },
  "circular-node-graph-small": { name: "Circular Graph (Small)", ... },
  "data-cloud-cube": { name: "Data Cloud Cube", ... },
  "paris-is-a-city": { name: "Paris is a City", ... },
  "tunable-parameters": { name: "Tunable Parameters", ... },
  "ask-anything-pro": { name: "Ask Anything Pro", ... },         // NEW
  "transformer-mini": { name: "Transformer Mini", ... },         // NEW
  "neural-flow-combo": { name: "Neural Flow Combo", ... },       // NEW
  "fluffy-stack-bundle": { name: "Fluffy Stack Bundle", ... },   // NEW
};
```

---

## BUG #2: Stats Never Update (CRITICAL)

**Problem:**
- API returns `totalProducts: 26` but frontend shows `0`
- Cause: Frontend initializes `totalProducts: 0` and never assigns API value

**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (line 411)

**Quick Fix:**
```typescript
// BEFORE:
const [stats, setStats] = useState<any>({
  totalPageViews: 1247,
  addToCartEvents: 89,
  totalSales: 156,
  totalProducts: 0,  // ← FROZEN
  totalLikes: 0,     // ← FROZEN
  engagementRate: 18,
  topProducts: []
});

// AFTER:
const [stats, setStats] = useState<any>({
  totalPageViews: 0,
  addToCartEvents: 0,
  totalSales: 0,
  totalProducts: 0,
  totalLikes: 0,
  engagementRate: 0,
  topProducts: []
});

// Then in useEffect (line 458), setStats actually updates these values
```

The bug is that the initializer values are treated as defaults that stay if fetch fails, but they're also never properly overwritten when fetch succeeds. The fix is to ensure `setStats(statsData)` is called (it is at line 458, so verify this is actually being executed).

Actually, verify: Is `setStats(statsData)` being called? If yes, the issue is that `statsData` doesn't have a valid `totalProducts`. Check `/api/stats` response.

Test: Add `console.log('statsData:', statsData)` at line 458.

---

## BUG #3: No Error Handling (CRITICAL)

**Problem:**
- If any API call fails, frontend silently fails
- No error message shown to user
- State remains in initial/stale state

**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 446-453)

**Quick Fix:**
```typescript
// BEFORE:
const [visitorData, statsData, saleData, inventoryData, marketData] = await Promise.all([
  fetch('/api/visitors', { method: 'POST' }).then(r => r.json()),
  fetch('/api/stats').then(r => r.json()),
  fetch('/api/sale-status').then(r => r.json()),
  fetch('/api/inventory').then(r => r.json()),
  fetch('/api/market-prices').then(r => r.json()),
]);

// AFTER:
try {
  const [visitorResp, statsResp, saleResp, inventoryResp, marketResp] = await Promise.all([
    fetch('/api/visitors', { method: 'POST' }),
    fetch('/api/stats'),
    fetch('/api/sale-status'),
    fetch('/api/inventory'),
    fetch('/api/market-prices'),
  ]);

  // Check for HTTP errors
  if (!visitorResp.ok) throw new Error(`Visitors API failed: ${visitorResp.status}`);
  if (!statsResp.ok) throw new Error(`Stats API failed: ${statsResp.status}`);
  if (!saleResp.ok) throw new Error(`Sale Status API failed: ${saleResp.status}`);
  if (!inventoryResp.ok) throw new Error(`Inventory API failed: ${inventoryResp.status}`);
  if (!marketResp.ok) throw new Error(`Market Prices API failed: ${marketResp.status}`);

  const [visitorData, statsData, saleData, inventoryData, marketData] = await Promise.all([
    visitorResp.json(),
    statsResp.json(),
    saleResp.json(),
    inventoryResp.json(),
    marketResp.json(),
  ]);

  // Validate responses
  if (visitorData.error) throw new Error(visitorData.error);
  if (statsData.error) throw new Error(statsData.error);
  // ... etc

  setVisitorCount(visitorData.count);
  setStats(statsData);
  setSaleStatus(saleData);
  setInventory(inventoryData);
  setMarketPrices(marketData);

} catch (error) {
  console.error('Error loading store data:', error);
  // Show toast notification to user
  // Don't crash, use fallback values already initialized
}
```

---

## BUG #4: Product Catalog Hardcoded in 2 Places (CRITICAL)

**Problem:**
- Frontend has 30 hardcoded products (page.tsx:518-550)
- Backend has 26 hardcoded products (inventory.ts:40-70)
- Product names don't match exactly
- Adding a product requires code changes in 2 places
- No single source of truth

**Files:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 518-550)
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/inventory/route.ts` (lines 40-70)

**Proper Fix (Recommended):**

1. Create `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/public/products.json`:
```json
{
  "products": [
    {
      "id": "ask-anything-tee",
      "name": "Ask Anything Tee",
      "description": "Voice-activated AI vibes",
      "price": 149,
      "images": ["/Ask-Anything-Chest.png"],
      "isNew": true,
      "category": "Interactive",
      "tags": ["voice", "ai", "chatgpt"]
    },
    // ... all 30 products
  ]
}
```

2. Backend: Load products from file
```typescript
// inventory.ts
import fs from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'public', 'products.json');

function getDefaultProducts() {
  if (fs.existsSync(PRODUCTS_FILE)) {
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    // Convert to inventory format
    return data.products.reduce((acc, p) => {
      acc[p.id] = { name: p.name, stock: 1, sold: false, soldPrice: p.price };
      return acc;
    }, {});
  }
  // Fallback...
}
```

3. Frontend: Load from API
```typescript
// page.tsx
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('/api/catalog')
    .then(r => r.json())
    .then(data => setProducts(data.products));
}, []);
```

4. Add endpoint: `/api/catalog` GET
```typescript
import fs from 'fs';
import path from 'path';

export async function GET() {
  const productsFile = path.join(process.cwd(), 'public', 'products.json');
  const data = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
  return NextResponse.json(data);
}
```

**Quick Fix (Band-Aid, 5 min):**
Just sync the backend keys to match frontend generation. Use the mapping from Bug #1.

---

## ADDITIONAL ISSUES

### Missing Error Response Validation
**Where:** All fetch calls

**Fix:** Add response validation
```typescript
const validateResponse = (response) => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response;
};

// Usage:
fetch('/api/stats')
  .then(validateResponse)
  .then(r => r.json())
  .catch(error => {
    console.error('Stats fetch failed:', error);
    // Show user-friendly error
  });
```

### Inventory Not Synced After Purchase
**Where:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (line 306 in ProductCard)

**Issue:** When user clicks "Quick Buy", telemetry is tracked but inventory is not marked as sold in backend.

**Current flow:**
```typescript
const handleAddToCart = async () => {
  // 1. Track event
  await fetch('/api/telemetry', { ... });

  // 2. Simulate delay
  setTimeout(() => {
    setIsAddedToCart(true);  // UI feedback
  }, 800);
};
```

**Missing:** Actually call inventory API to mark product sold
```typescript
const handleAddToCart = async () => {
  setIsAddingToCart(true);
  try {
    // 1. Mark product as sold
    const inventoryResp = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: productId,
        collectorNickname: 'Anonymous', // Or get from user
        price: price
      })
    });

    if (!inventoryResp.ok) throw new Error('Failed to mark as sold');

    // 2. Track event
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'add_to_cart',
        eventData: { productName: name }
      })
    });

    // 3. UI feedback
    setIsAddingToCart(false);
    setIsAddedToCart(true);
  } catch (error) {
    console.error('Add to cart failed:', error);
    setIsAddingToCart(false);
    // Show error to user
  }
};
```

---

## TESTING CHECKLIST

After fixes, verify:

- [ ] Every product shows correct inventory status (sold/available)
- [ ] Stats display real numbers from API (not hardcoded)
- [ ] Network tab shows all 5 API calls completing
- [ ] Refresh page → same data (not lost)
- [ ] Stop backend → see error message (not silent fail)
- [ ] Add product to cart → inventory marked sold → page refresh shows SOLD
- [ ] Product key generation matches backend (log to console)
- [ ] `totalProducts` > 0 on page load

---

## PRIORITIES

**Today (P0):**
1. Fix inventory keys (Bug #1) - 30 min
2. Verify stats are updating (Bug #2) - 5 min
3. Add error handling (Bug #3) - 15 min

**This week (P1):**
4. Create products.json single source of truth
5. Implement proper purchase flow (inventory sync)
6. Add validation schemas (Zod)

**Next sprint (P2):**
- API versioning
- Rate limiting
- Request/response logging
- Integration tests

---

## FILES TO MODIFY

**Critical (do first):**
- [ ] `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/inventory/route.ts` (lines 42-67)
- [ ] `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 446-453)

**Important (do second):**
- [ ] `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 306-329, handleAddToCart)
- [ ] Create `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/public/products.json`
- [ ] Create `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/catalog/route.ts`

**Nice to have:**
- [ ] `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (line 407, init stats)
- [ ] `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/components/ui/product-detail-modal.tsx` (line 159+)

---

## CONTACTS FOR CLARIFICATION

If stuck on:
- **Inventory behavior:** Check `data/inventory.json` actual file structure
- **Stats calculation:** Trace `/api/stats` response vs state variable names
- **Product names:** Align frontend hardcoded products with intended naming scheme
- **Purchase flow:** Clarify if "Add to Cart" = actual sale or wishlist

---

## ESTIMATED EFFORT

| Fix | Complexity | Time | Risk |
|-----|-----------|------|------|
| Bug #1: Keys | Low | 30 min | Low |
| Bug #2: Stats | Low | 5 min | Very Low |
| Bug #3: Errors | Medium | 15 min | Low |
| Bug #4: Catalog | Medium | 1-2 hrs | Medium |
| Total (core) | | 50 min | Low |
| Total (proper) | | 2-3 hrs | Low |

---

Generated: 2025-10-31
Reference: `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/INTEGRATION_ANALYSIS.md`

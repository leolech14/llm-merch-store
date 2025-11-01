# Backend-Frontend Integration Analysis
## LLM Merch Store - Integration Gap Report

**Analysis Date:** 2025-10-31
**Focus:** Main `app/page.tsx` vs API implementations
**Scope:** API contracts, data shapes, request/response formats, authentication, error handling

---

## Executive Summary (Haiku Style)

Frontend calls bloom,
Backend routes exist in silence—
Bridge holds for now, wait.

---

## Critical Findings

### 1. API CONTRACTS & ENDPOINTS

#### MATCH: Core Endpoints Used
```
Frontend calls              Backend exists
✓ /api/telemetry          ✓ routes.ts (POST, GET)
✓ /api/visitors           ✓ routes.ts (GET, POST)
✓ /api/stats              ✓ routes.ts (GET only)
✓ /api/sale-status        ✓ routes.ts (GET only)
✓ /api/inventory          ✓ routes.ts (GET, POST)
✓ /api/market-prices      ✓ routes.ts (GET only)
✓ /api/ask                ✓ routes.ts (POST, GET)
```

**Haiku:**
All endpoints found,
Frontend trusts what backend sings—
No ghost routes here, good.

---

### 2. DATA SHAPE MISMATCHES

#### CRITICAL: Inventory Product Keys Mismatch
**Frontend Code (page.tsx:796):**
```typescript
const productKey = product.name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .substring(0, 20);

// Example: "Ask Anything Tee" → "ask-anything-tee"
const isSold = inventory?.products?.[productKey]?.sold || false;
```

**Backend Inventory Keys (inventory.ts:42-67):**
```typescript
"ask-anything-chest": { ... }  // ← DIFFERENT from frontend!
"chatgpt-pro": { ... }
"mic-small": { ... }
```

**Contract Violation:**
- Frontend expects: `ask-anything-tee`
- Backend provides: `ask-anything-chest`
- Result: Inventory lookups ALWAYS return undefined → All products show as "available" (fallback: `false`)

**Haiku:**
Keys don't align, oops—
Frontend asks for "chest," gets null;
Inventory lies.

---

#### CRITICAL: Missing Stats Aggregation
**Frontend expects (page.tsx:408-415):**
```typescript
stats: {
  totalPageViews: 1247,
  addToCartEvents: 89,
  totalSales: 156,
  totalProducts: 0,      // ← Always 0 from API?
  totalLikes: 0,
  engagementRate: 18,
  topProducts: []
}
```

**Backend returns (stats.ts:29-42):**
```typescript
const stats = {
  totalVisitors: data.totalVisitors,      // ← Extra field!
  totalPageViews: data.totalPageViews,
  addToCartEvents: data.addToCartEvents,
  totalSales: data.totalSales,
  totalProducts,  // ← Calculated from inventory
  totalLikes,
  topProducts,    // ← Mapped from productClicks
  engagementRate: ...
};
```

**Issue:** Frontend displays `stats.totalProducts` hardcoded as 0 in initial state:
```typescript
totalProducts: 0,  // ← Never updated from API response!
```

**Haiku:**
Stats arrive alive,
Frontend ignores totals—
Numbers stay frozen.

---

#### WARNING: Missing Error Response Types
**Frontend calls without error handling:**
```typescript
const [visitorData, statsData, saleData, inventoryData, marketData] = await Promise.all([
  fetch('/api/visitors', { method: 'POST' }).then(r => r.json()),
  fetch('/api/stats').then(r => r.json()),
  ...
]);

// No .catch() or status checking!
```

**If any API fails with 500:**
- Response still calls `.json()` → May parse error object
- Frontend assigns error object to state (e.g., `stats = {error: "..."}`)
- Renders as valid data → Silent failures

**Haiku:**
Promise swallows screams,
No catch block for API fear—
Fail silently on.

---

### 3. FIELD NAMING CONSISTENCY

#### CAMELCASE vs SNAKE_CASE
**Telemetry POST body (page.tsx:315-318, 440-442):**
```typescript
// Frontend sends:
{
  eventType: 'add_to_cart',        // ← SNAKE_CASE
  eventData: { productName: name }  // ← CAMELCASE
}
```

**Backend processes (telemetry.ts:71-92):**
```typescript
switch(eventType) {
  case 'add_to_cart':
    telemetry.addToCartEvents += 1;  // ← Matches
    break;
  case 'product_click':
    const productName = eventData?.productName;  // ← Expects camelCase
    break;
}
```

**Status:** Matches OK but inconsistent naming convention
**Issue:** No field mapping—brittle to schema changes

**Haiku:**
Names mixed, not broken—
One convention would suffice;
Fragile does it grow.

---

### 4. REQUEST/RESPONSE FORMAT ISSUES

#### INFO: Sale Status Endpoint
**Frontend usage (page.tsx:450, 499):**
```typescript
const saleData = await fetch('/api/sale-status').then(r => r.json());
setSaleStatus(saleData);

// Polling every 60s for updates
const saleStatusInterval = setInterval(async () => {
  const response = await fetch('/api/sale-status');
  const data = await response.json();
  setSaleStatus(data);
}, 60000);
```

**Backend response (sale-status.ts:41-50):**
```typescript
const response: SaleStatus = {
  isActive: boolean,
  status: 'before' | 'during' | 'after',
  startTime: string (ISO),
  endTime: string (ISO),
  timeUntilStart?: number (ms),  // ← Optional
  timeUntilEnd?: number (ms)      // ← Optional
};
```

**Potential issue:** Conditional fields
- Frontend checks `saleStatus?.isActive` (safe)
- But uses `inventory?.stats?.available` (nested optional chains)
- If API response structure changes, cascading failures

**Haiku:**
Nested chains protect,
Yet deep unknowns lurk below—
One null breaks the view.

---

#### WARNING: Market Prices Response Structure
**Frontend usage (page.tsx:927):**
```typescript
<Scoreboard inventory={inventory} marketPrices={marketPrices} />
```

**Backend returns (market-prices.ts:77-82):**
```typescript
return NextResponse.json({
  marketPrices,           // ← Object keyed by productId
  trending: sorted.filter(...),
  topGainers: sorted.slice(0, 5),
  basePrice
});
```

**Issue:** Scoreboard component expects `marketPrices` at top level, but backend returns it wrapped
**Check required:** Does Scoreboard access `marketPrices.marketPrices`?

**Haiku:**
Response wraps answer—
Component searches outside;
Layers misaligned.

---

### 5. AUTHENTICATION FLOW

**Status:** NO AUTHENTICATION IMPLEMENTED
- No auth checks in any API endpoint
- No session/token validation
- No rate limiting
- No CORS headers visible

**Frontend assumption:** All APIs are public
**Backend provides:** No protection

**Haiku:**
No guards at the gate,
Frontend walks in unashamed—
Open barn, all night.

---

### 6. ERROR HANDLING GAPS

#### MISSING: Comprehensive Error Responses
**Frontend error handling (page.tsx:487-491):**
```typescript
} catch (error) {
  console.error('Error tracking visitor:', error);
  // Fallback to static data
  setVisitorCountHistory(["523", "524", ...]);
}
```

**Backend doesn't expose error details:**
```typescript
// stats.ts:61
return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
```

**Issue:** Frontend catches all errors same way → Can't distinguish:
- Network error vs API error
- Rate limit vs server failure
- Bad request vs server crash

**Also Missing:**
- 404 endpoints (no "not found" routes)
- 405 method not allowed (POST to GET-only endpoints returns 405 or 200?)
- Request validation errors (all return generic 400)

**Haiku:**
Errors trapped in dark,
Frontend knows something failed—
Why? The void answers.

---

### 7. PRODUCT DATA INCONSISTENCIES

#### CRITICAL: Product Catalog Mismatch
**Frontend hardcoded products (page.tsx:518-550):**
```typescript
const allProducts = [
  { name: "Ask Anything Tee", ... },
  { name: "ChatGPT PRO Ask", ... },
  ...
  // 30 products total hardcoded
];
```

**Backend inventory setup (inventory.ts:40-70):**
```typescript
const basePrice = 149;
return {
  products: {
    "ask-anything-chest": { name: "Ask Anything Tee", ... },
    "chatgpt-pro": { name: "ChatGPT 5 Pro Tee", ... },
    ...
    // Only 26 products in default inventory
  }
};
```

**Issues:**
1. Frontend has 30 products hardcoded
2. Backend inventory only defines 26
3. Product names don't match exactly:
   - Frontend: "ChatGPT PRO Ask"
   - Backend: "ChatGPT 5 Pro Tee"
4. No single source of truth (product-catalog.json missing)
5. New products require code changes in 2 places

**Haiku:**
Lists drift apart slow,
Frontend and backend, old friends—
Different memories.

---

### 8. VERSION & COMPATIBILITY MISMATCHES

#### WARNING: Stats Field Evolution
**Frontend state (page.tsx:407-415):**
```typescript
const [stats, setStats] = useState<any>({
  totalPageViews: 1247,
  addToCartEvents: 89,
  totalSales: 156,
  totalProducts: 0,
  totalLikes: 0,
  engagementRate: 18,
  topProducts: []
});
```

**API response (stats.ts:29-42):**
```typescript
const stats = {
  totalVisitors: ...,      // ← Extra field (not in frontend state)
  totalPageViews: ...,
  addToCartEvents: ...,
  totalSales: ...,
  totalProducts: ...,
  totalLikes: ...,
  topProducts: ...,        // ← Renamed from productClicks
  lastUpdated: ...,        // ← Extra field
  engagementRate: ...
};
```

**Forward compatibility:** OK (frontend ignores extra fields)
**Backward compatibility:** BROKEN (if API removes field, silent failure)

**Haiku:**
Schema evolves fast,
No versioning to anchor—
Contracts turn to sand.

---

### 9. INVENTORY STATUS FLOW

#### COMPLEX: Multi-Source Inventory Truth
**Frontend inventory sources:**
1. GET `/api/inventory` - Returns inventory.json snapshot
2. GET `/api/stats` - Calculates totalProducts from inventory
3. POST `/api/inventory` - Marks product as sold

**Problem:** Race condition
- Frontend fetches inventory on load
- User "buys" product → POST /api/inventory (marks sold)
- Same inventory object still in state → Product shows as "available"
- Need refresh to see change

**Haiku:**
Sold yet still shown free,
Time moves faster than data—
State goes out of sync.

---

## SUMMARY TABLE

| Category | Status | Severity | Impact |
|----------|--------|----------|--------|
| Endpoints exist | ✓ PASS | - | 0 |
| Product key mapping | **FAIL** | CRITICAL | Inventory always wrong |
| Stats aggregation | **FAIL** | HIGH | Frozen metrics display |
| Error handling | **FAIL** | MEDIUM | Silent failures |
| Auth/Security | **FAIL** | CRITICAL | No protection |
| Data naming | ✓ PASS | - | Camel/snake mixed but works |
| Response formats | PARTIAL | MEDIUM | Nested structures risky |
| Product catalog | **FAIL** | CRITICAL | Hardcoded, mismatched |
| Versioning | NONE | HIGH | No future compatibility |
| Error messages | SPARSE | MEDIUM | Debugging blind |

---

## RECOMMENDED FIXES (Priority Order)

### P0: CRITICAL (Blocks functionality)
1. **Align product keys** between frontend and backend
   - Use consistent key generation: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`
   - Update all 26 backend inventory keys to match
   - Add missing 4 products to backend inventory

2. **Create single source of truth for product catalog**
   - Export `products.json` or similar from backend
   - Frontend imports from `/api/catalog` endpoint
   - Remove hardcoded product arrays

3. **Add API authentication/validation**
   - At minimum: Rate limit by IP
   - Validate request schema (Zod/TypeGuard)
   - Return typed error responses

### P1: HIGH (Degrades UX)
4. **Fix stats not updating**
   - Initialize `totalProducts` from API response
   - Ensure all stats fields flow through

5. **Add comprehensive error handling**
   - Try/catch all fetch calls
   - Return specific error codes
   - Frontend differentiates error types

6. **Implement inventory state sync**
   - Debounce POST /api/inventory
   - Refresh entire inventory on sale
   - Or use real-time updates (WebSocket/polling)

### P2: MEDIUM (Tech debt)
7. **Add API versioning** (accept `?v=1` param or header)
8. **Add request/response logging** for debugging
9. **Create OpenAPI/TypeScript schema** for contract validation
10. **Add integration tests** to catch mismatches

---

## HAIKU SUMMARY

```
Frontend trusts the void,
Backend builds without a map—
Both pray code aligns.

Product names dance, keys don't match,
Inventory lies.

Stats arrive then freeze,
Numbers told but never heard—
Data shouts to deaf.

No guards, no promises,
Open API for all—
Security sleeps.

One catalog split,
Hardcoded in two places—
Maintainers will cry.

Contracts written on sand,
Waves crash, reshape, realign—
No versioning saves.

Error swallowed whole,
Frontend knows something broke—
Nothing tells it why.

Haikus of the gap,
Where frontend calls to backend—
Few calls go through clean.
```

---

## CODE SNIPPETS TO REFERENCE

### Frontend Fetch Calls
**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx`
- Lines 312-322: Add-to-cart telemetry (works)
- Lines 434-453: Initial data load (missing error handling)
- Lines 497-505: Sale status polling (no retry logic)

### Backend Inventory
**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/inventory/route.ts`
- Lines 42-67: Product key definitions (mismatch source)
- Lines 83-98: GET response structure

### Frontend Inventory Usage
**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx`
- Lines 795-807: Product key generation & lookup
- Line 796: Key mismatch happens here

### API Ask Endpoint
**File:** `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/ask/route.ts`
- Lines 165-179: Fallback static responses (never called if OpenAI key exists)
- Lines 138-164: Graceful degradation model

---

## TESTING CHECKLIST

- [ ] Fetch all products with inventory status (check if ANY show correct sold status)
- [ ] Add product to cart, refresh page, verify POST succeeded
- [ ] Stop backend server, watch frontend error handling
- [ ] Change product name in backend, watch frontend break
- [ ] Test market-prices endpoint directly vs. in Scoreboard component
- [ ] Verify sale-status fields match SaleStatus interface
- [ ] Test with invalid token/auth (currently: no auth, should fail gracefully)

---

**Generated by:** Integration Analysis Tool
**Analysis ID:** merch-2025-10-31
**Confidence:** HIGH (full code access, pattern-based inference)

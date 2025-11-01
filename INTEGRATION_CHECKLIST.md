# Integration Issues Checklist

Complete these tasks to fix all integration mismatches between frontend and backend.

---

## CRITICAL ISSUES (Do First)

### Issue 1: Product Inventory Keys Mismatch

**Status:** ⏳ PENDING
**Severity:** CRITICAL - Blocks inventory feature
**Time Estimate:** 30 minutes
**Difficulty:** Easy

**Description:**
Frontend generates product keys differently than backend defines them.
- Frontend: `"ask-anything-tee"` (from name.toLowerCase().replace())
- Backend: `"ask-anything-chest"` (hardcoded in inventory defaults)
- Result: All inventory lookups return undefined → all products show as "available"

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/inventory/route.ts` (lines 42-67)
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 795-796, product key generation)

**Fix Steps:**
- [ ] 1. Open `app/api/inventory/route.ts`
- [ ] 2. Update all product keys in lines 42-67 using this formula:
  ```
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  ```
- [ ] 3. Verify 30 products (including 4 missing ones):
  - [ ] ask-anything-tee
  - [ ] chatgpt-pro-ask (NOT "chatgpt-pro")
  - [ ] mic-icon-tee (NOT "mic-small")
  - [ ] back-propagation-blue
  - [ ] back-propagation-red
  - [ ] cross-attention-tee
  - [ ] self-attention-tee
  - [ ] query-key-matrix
  - [ ] value-matrix-tee
  - [ ] transformer-architecture
  - [ ] fluffy-creature-layers
  - [ ] fluffy-creature-y
  - [ ] llm-brunette-color
  - [ ] llm-brunette-bw
  - [ ] llm-brunette-bw-50
  - [ ] llm-blonde-color
  - [ ] llm-blonde-bw
  - [ ] fresh-models-tee
  - [ ] gossip-network
  - [ ] information-theory
  - [ ] circular-node-graph
  - [ ] circular-node-graph-small
  - [ ] data-cloud-cube
  - [ ] paris-is-a-city
  - [ ] tunable-parameters
  - [ ] ask-anything-pro (NEW)
  - [ ] transformer-mini (NEW)
  - [ ] neural-flow-combo (NEW)
  - [ ] fluffy-stack-bundle (NEW)
- [ ] 4. Test: `localhost:3000` → Check if any products show "SOLD"
- [ ] 5. Manual inventory test: Mark 1 product as sold → Refresh → Should show "SOLD OUT"

**Test Command:**
```bash
curl http://localhost:3000/api/inventory | jq '.products | keys'
# Should output all 30 product IDs
```

**Verification:**
- [ ] All 30 product keys generated correctly
- [ ] Product key in inventory matches generated key
- [ ] Inventory lookup returns valid product object
- [ ] Sold status correctly reflects in UI

---

### Issue 2: Stats Never Update From API

**Status:** ⏳ PENDING
**Severity:** CRITICAL - Blocks analytics display
**Time Estimate:** 5 minutes
**Difficulty:** Trivial

**Description:**
Frontend initializes `totalProducts: 0` and never updates it from API response.
- API returns: `totalProducts: 26`
- Frontend displays: `totalProducts: 0` (hardcoded initial value)
- Result: Users see "0 Total Designs" instead of "26"

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 407-415, 458, 864-919)

**Fix Steps:**
- [ ] 1. Open `app/page.tsx`
- [ ] 2. Find `const [stats, setStats] = useState<any>({` at line 407
- [ ] 3. Verify `setStats(statsData)` is called at line 458 ✓
- [ ] 4. Add debug logging at line 458:
  ```typescript
  console.log('statsData received:', statsData);
  console.log('About to setStats with:', statsData);
  ```
- [ ] 5. Refresh page and check console
- [ ] 6. If stats not updating:
  - [ ] Check `/api/stats` response in Network tab
  - [ ] Verify `totalProducts` is in response
  - [ ] Check if there's an error in the response
  - [ ] If response has `{error: ...}`, fix the endpoint

**Test Steps:**
1. Open browser console (F12)
2. Add breakpoint at line 458
3. Refresh page
4. Check that statsData contains `totalProducts: 26`
5. Remove debug logs
6. Verify UI shows "26 Total Designs"

**Verification:**
- [ ] Console shows `statsData.totalProducts` is 26
- [ ] Page displays "26" in Total Designs box (line 918)
- [ ] Page displays actual addToCartEvents count (not 89 hardcoded)
- [ ] Page displays actual totalLikes count (not 0 hardcoded)

---

### Issue 3: No Error Handling in API Calls

**Status:** ⏳ PENDING
**Severity:** CRITICAL - Silent failures hide bugs
**Time Estimate:** 15 minutes
**Difficulty:** Easy

**Description:**
Frontend Promise.all has no error handling. If any API fails, state silently remains stale.
- Current: `Promise.all([...]).then(...)` ← No catch!
- Result: API errors invisible to users and developers

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 429-507)

**Fix Steps:**
- [ ] 1. Open `app/page.tsx`, find `async function trackAndFetchData()` at line 430
- [ ] 2. Wrap the Promise.all in try-catch:
  ```typescript
  try {
    // Existing Promise.all code
    const [visitorData, statsData, saleData, inventoryData, marketData] = await Promise.all([...]);

    // Validate responses (NEW)
    if (visitorData.error) throw new Error(`Visitor API: ${visitorData.error}`);
    if (statsData.error) throw new Error(`Stats API: ${statsData.error}`);
    // ... etc for all responses

    // Update state
    setVisitorCount(visitorData.count);
    // ... etc
  } catch (error) {
    console.error('Failed to load store data:', error);
    // TODO: Show toast/alert to user
  }
  ```
- [ ] 3. Also wrap the sale status polling interval (line 499):
  ```typescript
  const saleStatusInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/sale-status');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSaleStatus(data);
    } catch (error) {
      console.error('Failed to fetch sale status:', error);
    }
  }, 60000);
  ```
- [ ] 4. Test with backend stopped:
  - [ ] Start app with backend running ✓
  - [ ] Stop backend (kill Next.js server)
  - [ ] Refresh frontend page
  - [ ] Check console for error messages
  - [ ] Verify UI doesn't crash (shows something)

**Test Steps:**
1. Kill backend server
2. Refresh frontend
3. Open console (F12)
4. Should see error like "Failed to load store data: TypeError: fetch failed"
5. Restart backend
6. Refresh frontend
7. Should load successfully

**Verification:**
- [ ] Error messages appear in console when API fails
- [ ] Page doesn't crash on API failure
- [ ] Fallback values display if API fails
- [ ] Success messages show in console on success
- [ ] All 5 API responses are validated before use

---

### Issue 4: Product Catalog Hardcoded (Multiple Sources)

**Status:** ⏳ PENDING
**Severity:** CRITICAL - Maintainability nightmare
**Time Estimate:** 30 minutes (band-aid) or 2 hours (proper fix)
**Difficulty:** Medium

**Description:**
Products hardcoded in 3 places:
1. Frontend component (`app/page.tsx` lines 518-550) - 30 products
2. Backend inventory defaults (`app/api/inventory/route.ts` lines 40-70) - 26 products
3. (Missing) Single source of truth

Adding a product requires changes in 2 places and products must be manually synced.

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 518-550)
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/inventory/route.ts` (lines 40-70)

**Band-Aid Fix (30 min):**
Just sync the hardcoded lists:
- [ ] 1. Copy all 30 products from frontend to backend
- [ ] 2. Use consistent naming in both places
- [ ] 3. Generate product keys in both using same formula
- [ ] 4. Document where products are defined
- [ ] ⚠️ Still requires manual sync on updates!

**Proper Fix (2 hours):**
- [ ] 1. Create `public/products.json`:
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
- [ ] 2. Update backend (`app/api/inventory/route.ts`):
  ```typescript
  import fs from 'fs';
  import path from 'path';

  const PRODUCTS_FILE = path.join(process.cwd(), 'public', 'products.json');

  function getDefaultInventory() {
    const productsFile = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    return {
      products: productsFile.products.reduce((acc, p) => {
        acc[p.id] = {
          name: p.name,
          stock: 1,
          sold: false,
          soldPrice: p.price
        };
        return acc;
      }, {}),
      lastUpdated: new Date().toISOString()
    };
  }
  ```
- [ ] 3. Create `app/api/catalog/route.ts`:
  ```typescript
  import { NextResponse } from 'next/server';
  import fs from 'fs';
  import path from 'path';

  export async function GET() {
    const productsFile = path.join(process.cwd(), 'public', 'products.json');
    const data = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
    return NextResponse.json(data);
  }
  ```
- [ ] 4. Update frontend (`app/page.tsx`):
  ```typescript
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/catalog')
      .then(r => r.json())
      .then(data => setProducts(data.products))
      .catch(error => {
        console.error('Failed to load catalog:', error);
        // Use hardcoded fallback
        setProducts(allProducts);
      });
  }, []);

  // Replace all{Products} in render with {products}
  ```
- [ ] 5. Remove hardcoded `allProducts` from page.tsx (lines 518-550)

**Test Steps:**

Band-aid:
1. Verify both frontend and backend have same 30 products
2. Verify product keys match in both places
3. Refresh page → should work

Proper:
1. `curl http://localhost:3000/api/catalog` → Should return 30 products
2. Refresh page → Should load catalog from API
3. Verify all products display
4. Test with missing `products.json` → Should fall back to hardcoded list

**Verification:**
- [ ] Band-aid: Frontend and backend have identical 30 products
- [ ] Proper: /api/catalog returns 30 products
- [ ] Proper: Frontend loads catalog from API
- [ ] Proper: Removing products.json falls back gracefully
- [ ] All product keys are consistent across codebase

---

## HIGH PRIORITY ISSUES (Do Second)

### Issue 5: Inventory Not Synced After Purchase

**Status:** ⏳ PENDING
**Severity:** HIGH - Purchase flow incomplete
**Time Estimate:** 20 minutes
**Difficulty:** Medium

**Description:**
When user clicks "Quick Buy", event is tracked but product is never marked as sold.
- Current: Only calls `/api/telemetry` to track event
- Missing: No call to `/api/inventory` to mark product sold
- Result: Product can be "bought" multiple times

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 306-329, ProductCard.handleAddToCart)
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/components/ui/product-detail-modal.tsx` (lines 110-132, handleAddToCart)

**Fix Steps:**
- [ ] 1. Update ProductCard.handleAddToCart (app/page.tsx:306):
  ```typescript
  const handleAddToCart = async () => {
    if (isAddedToCart || isSold) return;  // Already bought or sold out
    setIsAddingToCart(true);

    try {
      // 1. Mark product as sold in inventory
      const inventoryResp = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          collectorNickname: 'Anonymous Collector',
          price: price
        })
      });

      if (!inventoryResp.ok) {
        const error = await inventoryResp.json();
        throw new Error(error.error || 'Failed to complete purchase');
      }

      // 2. Track the event
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'add_to_cart',
          eventData: { productName: name }
        })
      });

      // 3. Update UI
      setTimeout(() => {
        setIsAddingToCart(false);
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 2000);
      }, 800);
    } catch (error) {
      console.error('Add to cart error:', error);
      setIsAddingToCart(false);
      // TODO: Show error toast
    }
  };
  ```
- [ ] 2. Same fix for product-detail-modal.tsx:110

**Test Steps:**
1. Click "Quick Buy" on a product
2. Watch Network tab → Should see POST /api/inventory call
3. Refresh page
4. Product should now show "SOLD OUT"
5. Try clicking again → Should be disabled

**Verification:**
- [ ] POST /api/inventory called with correct product ID
- [ ] After purchase, product marked as sold in backend
- [ ] After page refresh, product shows "SOLD OUT"
- [ ] Can't buy same product twice
- [ ] Telemetry event still tracked on success

---

### Issue 6: Add Response Validation

**Status:** ⏳ PENDING
**Severity:** HIGH - Prevents bad data from breaking app
**Time Estimate:** 20 minutes
**Difficulty:** Easy

**Description:**
Frontend doesn't validate API responses before assigning to state.
If API returns malformed data, frontend crashes or behaves unexpectedly.

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 456-461)

**Fix Steps:**
- [ ] 1. Create validation functions:
  ```typescript
  // app/page.tsx (near top of LLMClothingWebsite component)

  function validateVisitorData(data: any): boolean {
    return typeof data.count === 'number';
  }

  function validateStatsData(data: any): boolean {
    return (
      typeof data.totalPageViews === 'number' &&
      typeof data.addToCartEvents === 'number' &&
      Array.isArray(data.topProducts)
    );
  }

  function validateSaleStatus(data: any): boolean {
    return (
      typeof data.isActive === 'boolean' &&
      ['before', 'during', 'after'].includes(data.status)
    );
  }

  function validateInventory(data: any): boolean {
    return (
      typeof data.products === 'object' &&
      typeof data.stats === 'object'
    );
  }

  function validateMarketPrices(data: any): boolean {
    return typeof data.marketPrices === 'object';
  }
  ```
- [ ] 2. Use validations in trackAndFetchData:
  ```typescript
  const [visitorData, statsData, saleData, inventoryData, marketData] = await Promise.all([...]);

  // Validate all responses (NEW)
  if (!validateVisitorData(visitorData)) {
    throw new Error('Invalid visitor data from API');
  }
  if (!validateStatsData(statsData)) {
    throw new Error('Invalid stats data from API');
  }
  if (!validateSaleStatus(saleData)) {
    throw new Error('Invalid sale status from API');
  }
  if (!validateInventory(inventoryData)) {
    throw new Error('Invalid inventory data from API');
  }
  if (!validateMarketPrices(marketData)) {
    throw new Error('Invalid market prices from API');
  }

  // Now safe to assign to state
  setVisitorCount(visitorData.count);
  // ... etc
  ```

**Verification:**
- [ ] Validation functions exist for all 5 API responses
- [ ] Each response validated before assigning to state
- [ ] Invalid responses throw clear error messages
- [ ] Errors caught and logged properly

---

## MEDIUM PRIORITY ISSUES (Do Third)

### Issue 7: Market Prices Response Structure

**Status:** ⏳ PENDING
**Severity:** MEDIUM - Potential component mismatch
**Time Estimate:** 15 minutes
**Difficulty:** Easy

**Description:**
Market prices API returns nested response. Component may be accessing wrong path.

**Current response (market-prices.ts:77-82):**
```json
{
  "marketPrices": { /* actual data */ },
  "trending": [...],
  "topGainers": [...],
  "basePrice": 149
}
```

**Frontend usage (page.tsx:927):**
```typescript
<Scoreboard inventory={inventory} marketPrices={marketPrices} />
```

**Unknown:** Does Scoreboard expect:
- `marketPrices.marketPrices` (nested)?
- `marketPrices` directly (flat)?

**Fix Steps:**
- [ ] 1. Open `components/ui/scoreboard.tsx`
- [ ] 2. Check component props definition
- [ ] 3. Check how it accesses marketPrices data
- [ ] 4. If accesses `marketPrices.marketPrices`, either:
  - [ ] Option A: Update component to expect flat structure
  - [ ] Option B: Update API response to not nest
  - [ ] Option C: Transform in frontend before passing
  ```typescript
  setMarketPrices(marketData.marketPrices);  // Extract nested data
  ```
- [ ] 5. Test Scoreboard section displays correctly

**Test Steps:**
1. Check console for errors about marketPrices
2. Verify Scoreboard section renders without errors
3. Check data displayed is correct

**Verification:**
- [ ] Scoreboard component receives correct data shape
- [ ] No console errors about undefined properties
- [ ] Scoreboard displays market price data correctly

---

### Issue 8: Cascading Optional Chains Hide Errors

**Status:** ⏳ PENDING
**Severity:** MEDIUM - Masks bugs, complicates debugging
**Time Estimate:** 20 minutes
**Difficulty:** Medium

**Description:**
Multiple optional chains used without validation:
- `inventory?.products?.[productKey]?.sold`
- `stats?.topProducts?.map(...)`
- These return undefined on any missing level, unclear which failed

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 796, 895, 907)

**Fix Steps:**
- [ ] 1. Add explicit null checks:
  ```typescript
  // BEFORE (line 796):
  const isSold = inventory?.products?.[productKey]?.sold || false;

  // AFTER:
  if (!inventory) {
    console.warn('Inventory not loaded yet');
    isSold = false;
  } else if (!inventory.products) {
    console.warn('Inventory missing products object');
    isSold = false;
  } else if (!inventory.products[productKey]) {
    console.warn(`Product ${productKey} not found in inventory`);
    isSold = false;
  } else {
    isSold = inventory.products[productKey].sold || false;
  }
  ```
- [ ] 2. Create helper functions:
  ```typescript
  function getProductSoldStatus(inventory: any, productKey: string): boolean {
    if (!inventory?.products?.[productKey]) {
      console.warn(`Product ${productKey} not found in inventory`);
      return false;
    }
    return inventory.products[productKey].sold || false;
  }
  ```
- [ ] 3. Use helper in ProductCard rendering:
  ```typescript
  const isSold = getProductSoldStatus(inventory, productKey);
  ```

**Verification:**
- [ ] Console logs show when inventory data is missing
- [ ] Clear error messages indicate which data is missing
- [ ] Debugging easier when things go wrong
- [ ] No silent failures from undefined access

---

## LOW PRIORITY ISSUES (Nice to Have)

### Issue 9: Sale Status Polling Inefficient

**Status:** ⏳ PENDING
**Severity:** LOW - Works but wasteful
**Time Estimate:** 10 minutes
**Difficulty:** Easy

**Description:**
Frontend polls `/api/sale-status` every 60 seconds, but backend computes same value every time.
The computed sale time is static (57h 25m from server start), so polling same value repeatedly.

**Files Affected:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/page.tsx` (lines 497-505)
- `/Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store/app/api/sale-status/route.ts` (lines 14-18)

**Observation:**
```typescript
// Backend: Computed EVERY request (wasteful)
const startTime = new Date(now.getTime() + (57 * 60 * 60 * 1000) + (25 * 60 * 1000));

// If this time is fixed, it will never change:
// NOW = 2025-10-31 16:00:00
// SALE_START = 2025-11-02 09:25:00 (always)
// Every time you request at ANY time, same delta is computed
```

**Fix Options:**
- [ ] Option 1 (Simplest): Stop polling, compute locally:
  ```typescript
  // Frontend: Compute once on load
  useEffect(() => {
    fetch('/api/sale-status')
      .then(r => r.json())
      .then(data => {
        setSaleStatus(data);
        // Don't poll - use timer client-side
      });
  }, []);
  ```

- [ ] Option 2: Only poll when approaching sale time:
  ```typescript
  const saleStatusInterval = setInterval(async () => {
    if (saleStatus?.status === 'before' && saleStatus.timeUntilStart < 5 * 60 * 1000) {
      // Within 5 min of sale, start polling
      const response = await fetch('/api/sale-status');
      setSaleStatus(await response.json());
    }
  }, 30000);  // Every 30s instead of 60s (only when close)
  ```

- [ ] Option 3: Use local countdown timer:
  ```typescript
  useEffect(() => {
    if (saleStatus?.status === 'before') {
      const interval = setInterval(() => {
        // Decrement timeUntilStart by 1 second locally
        setSaleStatus(prev => ({
          ...prev,
          timeUntilStart: prev.timeUntilStart - 1000
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [saleStatus?.status]);
  ```

**Test Steps:**
1. Load page, note sale time
2. Wait 1 minute
3. Check Network tab - should not see new /api/sale-status request
4. Wait until 5 min before sale
5. Should see polling increase

**Verification:**
- [ ] Sale status still updates correctly
- [ ] No unnecessary API calls
- [ ] Countdown timer works smoothly
- [ ] Efficient bandwidth usage

---

### Issue 10: API Versioning

**Status:** ⏳ PENDING
**Severity:** LOW - Future-proofing
**Time Estimate:** 30 minutes
**Difficulty:** Medium

**Description:**
No API versioning. Hard to evolve schema without breaking old clients.

**Recommendation:**
Add optional `?v=1` query parameter:
```typescript
// Example new endpoint structure
GET /api/v1/stats
GET /api/v1/inventory
POST /api/v1/telemetry

// With backwards compat:
GET /api/stats (redirects to v1)
```

---

### Issue 11: API Request Logging

**Status:** ⏳ PENDING
**Severity:** LOW - Debugging aid
**Time Estimate:** 20 minutes
**Difficulty:** Easy

**Description:**
No request/response logging makes debugging hard.

**Recommendation:**
Add middleware to log all API calls:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const startTime = Date.now();

  return NextResponse.next().then(response => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${duration}ms - ${response.status}`);
    return response;
  });
}
```

---

## TESTING CHECKLIST

After fixing all issues:

### Inventory System
- [ ] Load page → All products visible
- [ ] Check browser console → No inventory key warnings
- [ ] Click "Quick Buy" → Product shows loading state
- [ ] Network tab → See POST /api/inventory call
- [ ] After purchase → Product shows "SOLD OUT"
- [ ] Refresh page → Product still shows "SOLD OUT"
- [ ] Can't click sold product → Button disabled

### Stats Display
- [ ] Page load → totalProducts shows 26 (not 0)
- [ ] Stats match `/api/stats` response
- [ ] addToCartEvents shows real number (not frozen)
- [ ] totalLikes shows real number (not 0)

### Error Handling
- [ ] Backend stopped → See error in console
- [ ] Network throttled → Error message clear
- [ ] Bad response → Error shows specific failure
- [ ] Multiple errors → First error prevents state update

### Product Catalog
- [ ] Band-aid: Both frontend & backend have 30 products
- [ ] Proper: `/api/catalog` returns 30 products
- [ ] All products load on page
- [ ] Can scroll through all 30

### Sale Status
- [ ] Load page → sale-status displays correctly
- [ ] Wait 1 min → No new API calls in Network tab
- [ ] Countdown timer updates smoothly
- [ ] Approaching sale time → Updates correctly

### API Validation
- [ ] Response mismatch → Clear error message
- [ ] Missing required fields → Error before state update
- [ ] Invalid data type → Error before rendering

---

## SIGN-OFF

When all critical issues fixed and tested:

- [ ] Issue 1: Product keys aligned ✓
- [ ] Issue 2: Stats updating ✓
- [ ] Issue 3: Error handling implemented ✓
- [ ] Issue 4: Product catalog decision made ✓
- [ ] Issue 5: Purchase flow complete ✓
- [ ] Testing checklist passed ✓

**Fixed by:** _________________ **Date:** _________

**Verified by:** _________________ **Date:** _________

---

## NOTES

_Use this space to document decisions, blockers, or questions:_

---

**Last Updated:** 2025-10-31
**Reference Documents:**
- `INTEGRATION_ANALYSIS.md` - Full technical details
- `INTEGRATION_QUICK_FIX.md` - Code examples
- `INTEGRATION_GAPS.txt` - Visual diagrams

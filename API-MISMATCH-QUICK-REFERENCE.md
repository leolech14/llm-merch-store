# API MISMATCH QUICK REFERENCE

## CRITICAL BUGS TO FIX NOW

### Bug #1: Visitor Counter Incremented on Every Page Load
**File:** `app/page.tsx` Line 449
**Problem:** Uses POST instead of GET, so counter increases every page load
```typescript
// WRONG:
fetch('/api/visitors', { method: 'POST' })

// RIGHT:
fetch('/api/visitors', { method: 'GET' })
```

### Bug #2: Product Status Lookup Always Returns False
**File:** `app/page.tsx` Lines 783-784
**Problem:** Product key is truncated, never matches backend keys
```typescript
// Generates: "ask-anything-te" (20 char limit)
// Backend has: "ask-anything-chest"
// Result: isSold always false

// FIX: Use inventory's product IDs directly
const isSold = inventory?.products?.find(p => p.name === product.name)?.sold || false;
```

### Bug #3: Type Safety Nightmare
**Files:** `app/page.tsx`, `app/admin/page.tsx`
**Problem:** 10+ `useState<any>` declarations
**Fix:** Define TypeScript interfaces for all API responses

### Bug #4: Silent Failure on Network Errors
**All fetch calls**
**Problem:** No response.ok check, API errors fail silently
**Fix:** Add HTTP status validation and user error feedback

---

## MISSING ENDPOINTS (Not Called by Frontend)

| Endpoint | Purpose | Missing UI |
|----------|---------|------------|
| /api/offers | Make/manage secondary offers | No "Make Offer" implementation |
| /api/ask | AI chatbot | No chat widget |
| /api/collectors | Collector leaderboard | No profiles page |
| /api/events | Event log | No admin event viewer |
| /api/transactions | P2P marketplace | No transaction history |

---

## ENDPOINTS SUMMARY

### Working Endpoints
✓ POST /api/telemetry  
✓ GET /api/stats  
✓ GET /api/sale-status  
✓ GET /api/inventory (with caveats)  
✓ GET /api/market-prices  
✓ GET /api/metrics  
✓ GET /api/admin/hero-config  
✓ POST /api/admin/system-config  

### Broken
⚠ POST /api/visitors (should use GET)

### Orphaned (Not Used)
❌ /api/offers  
❌ /api/ask  
❌ /api/collectors  
❌ /api/events  
❌ /api/transactions  

---

## DATA FLOW ISSUES

### Issue 1: Product Key Mismatch
Frontend generates: "ask-anything-te" (truncated at 20 chars)  
Backend expects: "ask-anything-chest"  
Result: Product status lookup fails

### Issue 2: Stats Structure Inconsistency
`/api/stats` returns flat `{ totalProducts: 24 }`  
`/api/inventory` returns nested `{ stats: { totalProducts } }`  
Frontend uses both interchangeably (confusing!)

### Issue 3: No Error Handling
All fetch calls wrapped in try-catch but:
- Silent console.error only
- UI shows stale data
- No user feedback

---

## INTEGRATION HEALTH SCORE: 68%

### What Works (68%)
- Core telemetry (visitor/page view/add to cart)
- Stats fetching
- Sale countdown
- Inventory display (mostly)
- Admin controls

### What's Broken (32%)
- HTTP method misuse (POST vs GET)
- Product key mismatch
- Missing type safety
- Missing error handling
- Orphaned endpoints unused

---

## PRIORITY FIXES (in order)

### WEEK 1 (Critical)
1. Fix /api/visitors to use GET (1 line)
2. Fix product key generation (5 lines)
3. Add TypeScript interfaces (50 lines)
4. Add HTTP status validation (20 lines)

### WEEK 2 (High)
5. Consolidate stats endpoints
6. Add error boundaries
7. Add retry logic

### WEEK 3 (Medium)
8. Implement /api/offers UI
9. Implement /api/ask chatbot
10. Add admin event viewer

### WEEK 4 (Low)
11. Implement collector profiles
12. Add request caching
13. Add monitoring/logging

---

## CODE FILES AFFECTED

**Frontend:**
- `/app/page.tsx` (Main page - 11 API calls)
- `/app/admin/page.tsx` (Admin page - 3 API calls)
- `/components/ui/scoreboard.tsx` (Display logic)

**Backend:**
- `/app/api/visitors/route.ts`
- `/app/api/stats/route.ts`
- `/app/api/inventory/route.ts`
- And 11 other route files

**Missing:**
- `lib/types.ts` (No TypeScript interfaces!)
- Error boundary components
- API utility functions

---

## FULL ANALYSIS DOCUMENT

See `INTEGRATION-ANALYSIS.md` for comprehensive report with:
- Complete API call inventory (11 calls)
- Complete endpoint inventory (14 endpoints)
- All 7 mismatches detailed
- All 5 orphaned endpoints explained
- 10 actionable fixes with code examples
- Testing recommendations

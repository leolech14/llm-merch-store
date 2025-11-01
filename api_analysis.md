# API SPRAWL ANALYSIS - LLMMERCH.SPACE

## EXECUTIVE SUMMARY
15 API routes found with significant duplication, unused endpoints, and scattered file I/O patterns.
Multiple "metering" and "stats" endpoints doing overlapping work.

---

## COMPLETE API INVENTORY

### 1. Traffic & Telemetry (3 overlapping endpoints)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/visitors` | GET | Get visitor count | YES | ACTIVE |
| `/api/visitors` | POST | Increment count | YES | ACTIVE |
| `/api/telemetry` | GET | Fetch all telemetry | YES | ACTIVE |
| `/api/telemetry` | POST | Track events (page_view, product_click, etc) | YES | ACTIVE |

**ISSUE**: `/api/visitors` and `/api/telemetry` both track visitor metrics.
- `visitors` is simple counter increment
- `telemetry` has event tracking system
Visitor counter is REDUNDANT with telemetry's visitor tracking.

---

### 2. Analytics & Stats (3 overlapping endpoints)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/stats` | GET | High-level stats (visitors, views, products, likes, engagement rate) | YES | ACTIVE |
| `/api/metrics` | GET | Advanced metrics from event-store (with dynamic inventory) | YES | ACTIVE |
| `/api/events` | GET | Raw event records with filtering (type, productId, nickname, date) | YES | ACTIVE |
| `/api/events` | POST | Record new event manually | NO | UNUSED |

**DUPLICATE LOGIC**:
- `stats` reads `telemetry.json` 
- `metrics` reads from event-store computed metrics
- Both calculate same data (totalVisitors, totalPageViews, totalSales, etc.)
- `metrics` is newer/better (uses event-store), `stats` is legacy

**ISSUE**: `/api/events POST` never called from frontend - DEPRECATED.

---

### 3. Inventory Management (2 endpoints)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/inventory` | GET | Get inventory status, calculate sold/available | YES | ACTIVE |
| `/api/inventory` | POST | Mark product as sold | YES (backend script) | ACTIVE |

**OK**: No duplication here, but hardcoded base price (R$149) in default inventory.

---

### 4. Marketplace & Offers (4 endpoints)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/offers` | GET | Fetch offers (filter by productId/userEmail) | NO | UNUSED |
| `/api/offers` | POST | Create new offer | NO | UNUSED |
| `/api/offers` | PUT | Accept/reject offer | NO | UNUSED |
| `/api/market-prices` | GET | Calculate market prices from offers & inventory | YES | ACTIVE |

**LEGACY**: Offers endpoints not used from frontend. Replaced by `/api/transactions` (newer event-store model).

**ISSUE**: `/api/offers` reads same files as `/api/market-prices` (offers.json, inventory.json) but `/api/offers` doesn't integrate with event-store.

---

### 5. Transactions & Collectors (2 endpoints)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/transactions` | GET | Get transaction history (filter by productId) | NO | UNUSED |
| `/api/transactions` | POST | Record purchase or offer (uses event-store) | NO | UNUSED |
| `/api/collectors` | GET | Get collector profile or leaderboard (from event-store) | NO | UNUSED |

**NEW/EXPERIMENTAL**: These use the newer event-store pattern but not called from frontend.
Likely prepared for future features.

---

### 6. Sale Status (1 endpoint)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/sale-status` | GET | Calc if sale is before/during/after (hardcoded dates) | YES | ACTIVE |

**ISSUE**: Hardcoded sale dates (57 hours 25 minutes from now). Needs to be configurable.

---

### 7. AI/Content (1 endpoint)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/ask` | POST | Q&A with LLM (OpenAI/Claude) or static fallback | YES | ACTIVE |
| `/api/ask` | GET | Health check | NO | UNUSED |

**OK**: No duplication. Well-designed with OpenAI/Claude/fallback options.

---

### 8. Admin Configuration (2 endpoints)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/admin/system-config` | GET | Get system features (progressiveHero, abTesting, analytics) | NO | UNUSED |
| `/api/admin/system-config` | POST | Update system features (protected: admin only) | YES | ACTIVE |
| `/api/admin/hero-config` | GET | Get A/B test results for hero variants | YES | ACTIVE |
| `/api/admin/hero-config` | POST | Update hero variant stats (protected: admin only) | YES | ACTIVE |

**OK**: Protected by auth, used in admin panel.

---

### 9. Authentication (1 endpoint)
| Endpoint | Method | Purpose | Used | Status |
|----------|--------|---------|------|--------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth Google login | YES | ACTIVE |

**OK**: Standard NextAuth setup.

---

## API SPRAWL FINDINGS

### 1. DUPLICATE ENDPOINTS (CONSOLIDATION OPPORTUNITIES)

#### A. Visitor Tracking Duplication
**Problem**: 
- `/api/visitors` (simple counter)
- `/api/telemetry` (event-based tracking, includes visitor event)

**Solution**: DELETE `/api/visitors`. Use `/api/telemetry` with `eventType: 'visitor'`.

**Impact**: Small (only used once in app/page.tsx:449)

---

#### B. Stats/Metrics Duplication  
**Problem**:
- `/api/stats` reads telemetry.json (legacy)
- `/api/metrics` reads event-store (modern)
- Both return overlapping data

**Solution**: DEPRECATE `/api/stats`. Use `/api/metrics` everywhere.
Move any missing fields from stats to metrics if needed.

**Impact**: Medium (used in page.tsx:450, admin/page.tsx:55)

---

#### C. Offers vs Transactions Conflict
**Problem**:
- `/api/offers` - independent offers management
- `/api/transactions` - event-store based (newer)
Both track same thing but different patterns

**Solution**: REMOVE `/api/offers`. Migrate all offer logic to `/api/transactions`.
(Currently `/api/offers` is unused anyway)

**Impact**: Low (offers endpoint not called)

---

### 2. UNUSED ENDPOINTS (CAN REMOVE)

1. **`/api/offers` (GET, POST, PUT)** - Legacy offer system, replaced by transactions
2. **`/api/events` (POST)** - Manual event recording, never called
3. **`/api/transactions` (GET, POST)** - Not called from frontend (prepared but unused)
4. **`/api/collectors` (GET)** - Not called from frontend (prepared but unused)
5. **`/api/system-config` (GET)** - GET not used, only admin POST is used
6. **`/api/ask` (GET)** - Health check, not needed

---

### 3. LEGACY PATTERNS (SHOULD DEPRECATE)

#### A. Hardcoded Base Price
**Files**: `inventory/route.ts:39`, `market-prices/route.ts:24`
**Code**: `const basePrice = 149;`
**Issue**: Magic number, not configurable
**Solution**: Move to config file or environment variable

#### B. Hardcoded Sale Dates  
**File**: `sale-status/route.ts:17`
**Code**: `const startTime = new Date(now.getTime() + (57 * 60 * 60 * 1000) + (25 * 60 * 1000));`
**Issue**: Cannot be changed without redeploy
**Solution**: Move to system-config endpoint

#### C. Duplicate ensureDataDir Pattern
**Files**: visitors, offers, inventory, telemetry, admin/system-config, admin/hero-config
**Code**: Same `ensureDataDir()` implementation repeated 6 times
**Solution**: Move to shared utility (`lib/data-utils.ts`)

#### D. Repeated fs.readFileSync Pattern
**Examples**:
- market-prices/route.ts:30 - reads offers.json
- market-prices/route.ts:36 - reads inventory.json  
- stats/route.ts:13 - reads inventory.json
- stats/route.ts:18 - reads telemetry.json
- metrics/route.ts:24 - reads inventory.json
- hero-config/route.ts:42 - reads hero-config.json

**Solution**: Create data access layer (`lib/data-access.ts`)

---

### 4. MISSING ERROR HANDLING

#### A. No Validation on API Routes
**Routes with issues**:
- `/api/telemetry` POST - accepts any `eventType` string (should validate against EventType enum)
- `/api/ask` POST - validates length but no sanitization
- `/api/events` GET - no limit enforcement (requests could ask for 1M events)
- `/api/transactions` POST - doesn't validate if product exists

**Examples**:
```typescript
// telemetry/route.ts:71 - accepts any string
switch (eventType) {
  case 'page_view': // etc
  // Missing default case or validation
}

// events/route.ts:27 - no upper bound
const limit = limitParam ? parseInt(limitParam, 10) : 100;
// Should be: Math.min(parseInt(limitParam, 10), 1000)
```

#### B. Inconsistent Error Responses
- Some return `{ error: '...' }`
- Some return `{ success: false, error: '...' }`
- Some return both `{ error: '...' }` and `{ success: false, ... }`

**Solution**: Standardize response format

#### C. No Input Sanitization
- `/api/ask` accepts question but doesn't sanitize (XSS risk if used in HTML)
- `/api/telemetry` accepts arbitrary event data

---

### 5. MISSING AUTHENTICATION

#### A. Public Endpoints (should be protected)
- `/api/market-prices` - Exposes pricing data (fine for marketplace)
- `/api/collectors` - Exposes leaderboard (fine)
- `/api/telemetry` POST - Tracks events without auth (spam risk)
- `/api/telemetry` GET - Exposes metrics (fine for public dashboard)

**Issue**: `/api/telemetry` can be spammed by bots:
```typescript
// Anyone can spam this
await fetch('/api/telemetry', {
  method: 'POST',
  body: JSON.stringify({ eventType: 'visitor' })
});
```

**Solution**: Add rate limiting or device fingerprinting to telemetry POST

---

### 6. FILE I/O PATTERNS & ISSUES

#### A. No Atomic Writes
**Problem**: `fs.writeFileSync` is not atomic. Concurrent writes corrupt JSON.
**Files affected**: All data files (visitors.json, offers.json, inventory.json, telemetry.json, event-store.json)

**Example race condition**:
```
Thread 1: readFileSync() -> [A]
Thread 2: readFileSync() -> [A]
Thread 1: writeFileSync([A+B])
Thread 2: writeFileSync([A+C])  // Loses B!
```

**Solution**: Use file locking library or database

#### B. No File Size Limits
**Problem**: Event store can grow indefinitely
**Code**: `if (store.events.length > 10000) { store.events = store.events.slice(-10000); }`
Keeps last 10k events, but file grows to ~5MB+ (10k events × 500 bytes)

**Solution**: Implement rolling archives or database

#### C. Sync I/O in Async Routes
**Issue**: Using `fs.readFileSync` in async route handlers blocks the thread
```typescript
export async function GET() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf-8')); // BLOCKS!
}
```

**Better**:
```typescript
export async function GET() {
  const data = JSON.parse(await fs.promises.readFile(FILE, 'utf-8'));
}
```

---

### 7. SECURITY ISSUES

#### A. Admin Email Whitelist Hardcoded
**File**: `auth/[...nextauth]/route.ts:12-15`
**Issue**: 
```typescript
const ADMIN_EMAILS = [
  "your.email@gmail.com",  // ← HARDCODED
];
```

**Solution**: Move to environment variable `ADMIN_EMAILS="email1@gmail.com,email2@gmail.com"`

#### B. NextAuth Secret Required but Not Validated
**File**: `auth/[...nextauth]/route.ts:61`
**Code**: `secret: process.env.NEXTAUTH_SECRET,`

**Issue**: If env var missing, auth silently fails. Should error early.

#### C. No CSRF Protection on State-Changing Endpoints
Admin endpoints (system-config, hero-config) POST endpoints don't validate CSRF tokens.
NextAuth provides `csrfToken` but not used here.

#### D. No Rate Limiting
Any public endpoint can be hammered:
```bash
for i in {1..10000}; do curl /api/telemetry -X POST; done
```

---

### 8. MISSING TYPES / ANY TYPES

#### A. Implicit Any Types
**Files affected**:
- `stats/route.ts:22` - `.sort(([, a], [, b]) => ...)`
- `stats/route.ts:27` - `reduce((sum: number, likes) => ...)`
- `metrics/route.ts:28` - `filter((p: any) => p.sold)`
- `market-prices/route.ts:40` - `forEach(([productId, product]: [string, any])`
- `market-prices/route.ts:42` - `filter((o: any) =>`
- `hero-config/route.ts:112` - `config: HeroConfig;` but reading creates untyped

#### B. Type Inconsistency
```typescript
// offers/route.ts uses Offer interface
// transactions/route.ts uses different structure
// No shared type definition
```

---

## CONSOLIDATION ROADMAP

### Phase 1: Remove Unused (No breaking changes)
- Delete `/api/events POST` (never called)
- Delete `/api/offers/*` (legacy, unused)
- Delete `/api/transactions GET/POST` (not called, keep for future)
- Delete `/api/collectors GET` (not called, keep for future)
- Delete `/api/ask GET` (health check unnecessary)
- Delete `/api/system-config GET` (never called)

### Phase 2: Consolidate Duplicate Data APIs
- DELETE `/api/visitors` 
- REDIRECT `/api/stats` → `/api/metrics`
- UPDATE admin/page.tsx to use `/api/metrics`

### Phase 3: Add Missing Infrastructure
- Create `lib/data-utils.ts` (shared file I/O)
- Create `lib/api-types.ts` (shared types)
- Add rate limiting middleware
- Add request validation middleware
- Switch to async file I/O

### Phase 4: Move Configuration
- Move base price (149) to config
- Move sale dates to `/api/admin/system-config`
- Move admin emails to environment variables

### Phase 5: Security Hardening
- Add device fingerprinting to telemetry POST
- Add CSRF token validation to admin endpoints
- Add API key to protected endpoints
- Implement proper error handling with request IDs

---

## USAGE ANALYSIS

### Called from Frontend (8 APIs):
1. **page.tsx** (home page):
   - `POST /api/telemetry` (3 times: page_view, product_click, etc)
   - `POST /api/visitors` (1 time)
   - `GET /api/stats` (1 time)
   - `GET /api/sale-status` (2 times)
   - `GET /api/inventory` (1 time)
   - `GET /api/market-prices` (1 time)

2. **product-detail-modal.tsx**:
   - `POST /api/telemetry` (2 times)

3. **admin/page.tsx**:
   - `GET /api/metrics` (1 time)
   - `GET /api/admin/hero-config` (1 time)
   - `POST /api/admin/system-config` (1 time)

4. **progressive-hero-messages.ts**:
   - `GET /api/admin/hero-config` (1 time)

5. **hero-wtf-dynamic.tsx**:
   - `POST /api/ask` (1 time)

### Never Called from Frontend:
- `GET /api/offers`
- `POST /api/offers`
- `PUT /api/offers`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/collectors`
- `POST /api/events`
- `GET /api/ask` (health check)
- `GET /api/system-config`

---

## RECOMMENDATIONS

### HIGH PRIORITY (Security/Performance)
1. Remove `/api/visitors` - redundant with telemetry
2. Add rate limiting to POST `/api/telemetry`
3. Fix sync I/O (use async fs)
4. Implement proper file locking or switch to database
5. Move hardcoded config to environment variables

### MEDIUM PRIORITY (Code Quality)
1. Remove unused legacy endpoints
2. Consolidate `/api/stats` into `/api/metrics`
3. Create shared data access layer
4. Add input validation to all endpoints
5. Standardize error response format
6. Add missing types

### LOW PRIORITY (Future)
1. Keep `/api/transactions` and `/api/collectors` (prepared for features)
2. Consider WebSocket for real-time metrics instead of polling
3. Implement proper database for event store
4. Add caching headers to GET endpoints

---

## FILE STRUCTURE BEFORE/AFTER

### BEFORE:
```
app/api/
├── visitors/route.ts (8 lines helper duplicated)
├── telemetry/route.ts (24 lines helper duplicated)
├── offers/route.ts (UNUSED)
├── inventory/route.ts (23 lines helper duplicated)
├── stats/route.ts (reads telemetry)
├── metrics/route.ts (reads event-store)
├── events/route.ts (unused POST)
├── transactions/route.ts (unused)
├── collectors/route.ts (unused)
├── market-prices/route.ts (duplicates file I/O)
├── sale-status/route.ts (hardcoded dates)
├── ask/route.ts (OK)
├── auth/[...nextauth]/route.ts (OK)
└── admin/
    ├── system-config/route.ts (duplicated helpers)
    └── hero-config/route.ts (duplicated helpers)
```

### AFTER:
```
lib/
├── data-access.ts (shared file I/O, with locks)
├── api-types.ts (shared types)
├── validation.ts (request validation)
└── rate-limiter.ts (simple in-memory rate limiter)

app/api/
├── telemetry/route.ts (single source for events)
├── metrics/route.ts (single source for computed stats)
├── inventory/route.ts (keep as-is)
├── market-prices/route.ts (uses data-access layer)
├── sale-status/route.ts (reads config from system-config)
├── ask/route.ts (keep as-is)
├── auth/[...nextauth]/route.ts (improved)
└── admin/
    ├── system-config/route.ts (includes sale dates, base price)
    └── hero-config/route.ts (uses data-access layer)

[DELETED]
├── visitors/ (redundant)
├── offers/ (legacy)
├── stats/ (replaced by metrics)
├── events/POST (unused)
├── transactions/ (prepared future)
├── collectors/ (prepared future)
└── ask/GET (unnecessary)
```


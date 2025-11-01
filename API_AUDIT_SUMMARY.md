# API AUDIT - QUICK REFERENCE SUMMARY

## Status Overview
- **Total Routes Audited:** 18
- **Complete (✅):** 5 routes
- **Needs Work (⚠️):** 13 routes
- **Critical Issues:** 8
- **High Priority:** 14
- **Medium Priority:** 40

---

## Best Implemented Routes (Copy These Patterns)

### ✅ `/api/cart/route.ts`
- Comprehensive validation
- Proper HTTP status codes
- Type-safe with interfaces
- CORS headers included
- TTL implementation
- **Copy pattern for:** Form validation, CRUD operations

### ✅ `/api/webhook/pix-payment/route.ts`
- Atomic file operations with locking
- Idempotent webhook handling
- Structured request ID logging
- Detailed error handling
- **Copy pattern for:** All file I/O operations

### ✅ `/api/ask/route.ts`
- Multiple provider fallback (OpenAI/Anthropic)
- Static fallback mode
- Input length validation
- **Enhance with:** Rate limiting, timeout handling

---

## Critical Issues to Fix (Do First)

### 1. File I/O Race Conditions
**Routes affected:** 6 routes
**Routes NOT affected:** /api/webhook/pix-payment (already uses locking)

```typescript
// Copy withFileLock pattern from /api/webhook/pix-payment/route.ts
// Apply to:
- /api/telemetry
- /api/inventory
- /api/visitors
- /api/offers
- /api/admin/hero-config
- /api/admin/system-config
```

### 2. Hardcoded Admin Emails
**Location:** `/api/auth/[...nextauth]/route.ts` lines 12-15

```typescript
// BEFORE
const ADMIN_EMAILS = [
  "leonardo.lech@gmail.com",
  "leo@lbldomain.com",
];

// AFTER
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
);
```

### 3. Missing Payment Amount Validation
**Location:** `/api/pix-payment/route.ts` line 28

```typescript
// ADD THIS
if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 100000) {
  return NextResponse.json(
    { success: false, error: 'Amount must be 0.01 to 100,000 BRL' },
    { status: 400 }
  );
}
```

### 4. Missing Offer Authorization
**Location:** `/api/offers/route.ts` line 152 (PUT handler)

```typescript
// ADD THIS TO PUT
const session = await getServerSession(authOptions);
if (session?.user?.email !== ownerEmail) {
  return NextResponse.json(
    { success: false, error: 'Not authorized' },
    { status: 403 }
  );
}
```

### 5. Hardcoded Sandbox API Endpoint
**Location:** `/api/pix-payment/route.ts` line 71

```typescript
// BEFORE
const ebanxResponse = await fetch('https://sandbox.ebanx.com/ws/direct', {

// AFTER
const EBANX_URL = process.env.EBANX_API_URL || 'https://sandbox.ebanx.com/ws/direct';
const ebanxResponse = await fetch(EBANX_URL, {
```

---

## Missing Validations (Add These)

| Route | Issue | Add Validation |
|-------|-------|-----------------|
| `/api/pix-payment` | No amount validation | `amount > 0 && amount < 100,000` |
| `/api/pix-payment-status` | No hash format check | UUID or hex pattern |
| `/api/cart` | No userId length limits | `3-100 chars` |
| `/api/telemetry` | No event type validation | Whitelist enum |
| `/api/inventory` | No nickname length limit | `max 100 chars` |
| `/api/offers` | Email validation weak | Use regex not just '@' |
| `/api/transactions` | No price validation | `0.01 - 100,000` |
| `/api/events` | No limit bounds | `max 500` |

---

## Missing Rate Limiting

**All POST endpoints need rate limiting to prevent:**
- Spam/DOS
- Cost explosion (LLM calls)
- Data corruption (visitor counts)

**Recommended:** Use Upstash Redis

```typescript
// npm install @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';

export const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});

// In route:
const result = await limiter.limit(ip || 'anonymous');
if (!result.success) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
}
```

---

## Quick Fixes (< 30 mins each)

1. **Add event type validation to telemetry** - 20 mins
   ```typescript
   const VALID_TYPES = ['page_view', 'visitor', 'product_click', 'product_like', 'add_to_cart', 'sale'];
   if (!VALID_TYPES.includes(eventType)) return error;
   ```

2. **Add limit bounds to events API** - 15 mins
   ```typescript
   const limit = Math.min(parseInt(limitParam || '100', 10), 500);
   ```

3. **Move admin emails to env** - 10 mins
   - Add to .env.example: `ADMIN_EMAILS=email1@example.com,email2@example.com`
   - Parse in auth/route.ts

4. **Add timeout to LLM calls** - 20 mins
   ```typescript
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 30000);
   const response = await fetch(url, { signal: controller.signal });
   ```

5. **Add email validation helper** - 15 mins
   ```typescript
   const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   const isValidEmail = (email: string) => EMAIL_REGEX.test(email);
   ```

---

## Medium-Term Improvements

1. **Database Migration** - Current file system won't scale
   - Inventory → PostgreSQL
   - Events → TimescaleDB or similar
   - Offers → PostgreSQL with indexing

2. **Caching Layer** - Add Redis for frequently accessed data
   - `/api/inventory` responses
   - `/api/stats` calculations
   - `/api/market-prices` computations

3. **API Documentation** - Generate OpenAPI/Swagger
   - Most routes have JSDoc comments
   - Use swagger-jsdoc to auto-generate

4. **Monitoring & Logging** - Structured logging
   - Axiom (included in dependencies)
   - Sentry for error tracking
   - OpenTelemetry for traces

5. **Testing** - Add integration tests
   - Test payment flow end-to-end
   - Test race conditions with concurrent requests
   - Test rate limiting

---

## File Structure Recommendation

Create these files to fix issues:

```
/lib/
  ├── file-lock.ts          (Copy from webhook)
  ├── validation.ts          (Create: email, amount, string validators)
  ├── rate-limit.ts          (Create: rate limiting helper)
  ├── api-response.ts        (Create: standardized responses)
  ├── logger.ts              (Create: structured logging)
  └── env-validation.ts      (Create: startup env checks)

/app/api/
  └── (all routes updated to use above libs)
```

---

## Before Deploying to Production

- [ ] Fix all CRITICAL issues (8 total)
- [ ] Add rate limiting to all POST endpoints
- [ ] Test concurrent requests (race condition check)
- [ ] Verify file locking works under load
- [ ] Test all payment flows end-to-end
- [ ] Security audit of admin routes
- [ ] Load test with 1000 concurrent users
- [ ] Review CORS settings (currently `*`)
- [ ] Set up error tracking
- [ ] Document all environment variables needed
- [ ] Create API runbook for incidents

---

## Estimated Effort

| Task | Effort | Priority |
|------|--------|----------|
| Fix race conditions (file locking) | 6-8 hrs | CRITICAL |
| Add rate limiting | 3-4 hrs | CRITICAL |
| Input validation framework | 4-5 hrs | HIGH |
| Move hardcoded config to env | 2 hrs | CRITICAL |
| Add authorization checks | 3-4 hrs | HIGH |
| Add request logging | 3 hrs | MEDIUM |
| Database migration planning | 20 hrs | MEDIUM |
| API documentation | 4 hrs | MEDIUM |

**Total for Production Ready: ~25-30 hours**

---

## Testing Strategy

### Unit Tests
- Validation functions
- Rate limiting logic
- File locking mechanism

### Integration Tests
- Full payment flow
- Concurrent inventory updates
- Cart operations

### Load Tests
- 100 concurrent payment requests
- 1000 concurrent telemetry posts
- Race condition detection

### Security Tests
- Admin authorization
- Input injection attempts
- Rate limit evasion

---

## Questions for Product Owner

1. Should `/api/admin/system-config` GET be public? (Currently unprotected)
2. What's the expected concurrent user load?
3. Do we need email receipts after payment?
4. Should refunds be supported via API?
5. Should offers be time-limited?
6. Should visitor counter be public? (Can be abused)

---

**Next Steps:**
1. Read full report: `API_AUDIT_REPORT.md`
2. Start with critical fixes (file locking, rate limiting)
3. Create helper libraries in `/lib/`
4. Update routes one by one
5. Load test before deployment

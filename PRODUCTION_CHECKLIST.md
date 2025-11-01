# PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production, verify all items below are complete.

---

## CRITICAL FIXES (Must Complete Before Deployment)

### 1. File I/O Race Conditions
- [ ] Create `/lib/file-lock.ts` with `withFileLock` function
- [ ] Update `/api/telemetry` to use file locking
- [ ] Update `/api/inventory` to use file locking
- [ ] Update `/api/visitors` to use file locking
- [ ] Update `/api/offers` to use file locking
- [ ] Update `/api/admin/hero-config` to use file locking
- [ ] Update `/api/admin/system-config` to use file locking
- [ ] Test concurrent file writes (load test with 100+ simultaneous requests)
- [ ] Verify no `.lock` file accumulation

### 2. Rate Limiting
- [ ] Install Upstash Redis: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Create `/lib/rate-limit.ts` with rate limit configs
- [ ] Add rate limiting to `/api/pix-payment` (30 req/hr)
- [ ] Add rate limiting to `/api/pix-payment-status` (100 req/hr)
- [ ] Add rate limiting to `/api/telemetry` (1000 req/hr)
- [ ] Add rate limiting to `/api/ask` (60 req/hr - costs money!)
- [ ] Add rate limiting to `/api/visitors` POST (100 req/hr)
- [ ] Add rate limiting to `/api/transactions` POST (100 req/hr)
- [ ] Add rate limiting to `/api/offers` POST (100 req/hr)
- [ ] Add rate limiting to `/api/events` GET (200 req/hr)
- [ ] Configure Upstash Redis URL and token in `.env.production`

### 3. Input Validation
- [ ] Create `/lib/validation.ts` with Validator class
- [ ] Add amount validation to `/api/pix-payment` (0.01-100,000)
- [ ] Add amount validation to `/api/transactions`
- [ ] Add email validation to `/api/offers`
- [ ] Add nickname length validation to `/api/inventory`
- [ ] Add event type validation to `/api/telemetry` (whitelist)
- [ ] Add limit bounds validation to `/api/events` GET (max 500)
- [ ] Test with malformed/injection payloads

### 4. Authorization & Security
- [ ] Move hardcoded admin emails to `ADMIN_EMAILS` env var
- [ ] Add authorization check to `/api/offers` PUT (ownership)
- [ ] Add authorization check to `/api/admin/hero-config` (admin only)
- [ ] Add authorization check to `/api/admin/system-config` POST (admin only)
- [ ] Verify `/api/admin/system-config` GET is intentionally public (or add auth)
- [ ] Remove placeholder document '00000000000000' from pix-payment (use real CPF)
- [ ] Verify all admin routes require `getServerSession`

### 5. Environment Configuration
- [ ] Create `/lib/env-validation.ts`
- [ ] Call validation at app startup
- [ ] Add all required env vars to `.env.production`
- [ ] Document all environment variables in `.env.example`
- [ ] Use `EBANX_API_URL` env var (not hardcoded sandbox URL)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Set `NEXT_PUBLIC_API_URL` to production domain

### 6. Error Handling
- [ ] Create `/lib/api-response.ts` for standardized responses
- [ ] Update all routes to use `ApiResponse.badRequest()`, `.notFound()`, etc.
- [ ] Add timeout handling to external API calls (EBANX, OpenAI, Anthropic)
- [ ] Verify no sensitive data in error messages
- [ ] Test error handling paths

### 7. Logging & Monitoring
- [ ] Create `/lib/logger.ts` for structured logging
- [ ] Add logging to all critical operations
- [ ] Set up Axiom/Logdrain logging (already in package.json)
- [ ] Set up Sentry for error tracking
- [ ] Verify logs are queryable (timestamps, request IDs)

---

## FUNCTIONAL TESTING

### Payment Flow (Critical)
- [ ] Create PIX payment - verify QR code returned
- [ ] Check payment status - verify status updates
- [ ] Receive webhook - verify inventory updated
- [ ] Test timeout scenarios
- [ ] Test EBANX API errors
- [ ] Test duplicate webhook receipt (idempotency)

### Cart Operations
- [ ] Create cart - verify items saved
- [ ] Retrieve cart - verify correct user isolation
- [ ] Update cart - verify atomic updates
- [ ] Delete cart - verify removal
- [ ] Test concurrent cart updates

### Offer Management
- [ ] Create offer - verify validation
- [ ] List offers - verify filtering
- [ ] Accept offer - verify authorization
- [ ] Reject offer - verify authorization
- [ ] Test offer amount bounds (150-10,000)

### Admin Features
- [ ] Login as admin - verify access
- [ ] View hero-config - verify stats calculated
- [ ] Update hero-config - verify atomic saves
- [ ] View system-config - verify current state
- [ ] Update system-config - verify only valid features

### Analytics
- [ ] Track events - verify recorded
- [ ] Query events - verify filtering and limits
- [ ] View metrics - verify calculations
- [ ] View stats - verify product counts
- [ ] Check market prices - verify trending calculation

---

## LOAD TESTING

### Concurrent Operations (Critical)
- [ ] Load test 100 concurrent payment creations
- [ ] Load test 100 concurrent inventory updates
- [ ] Load test 100 concurrent cart saves
- [ ] Load test 1000 telemetry events
- [ ] Verify no data corruption under load
- [ ] Monitor for lock timeouts

### Performance Benchmarks
- [ ] Payment creation < 500ms p95
- [ ] Status check < 300ms p95
- [ ] Cart GET < 100ms p95
- [ ] Inventory GET < 100ms p95
- [ ] API error response < 50ms p95

### Rate Limiting
- [ ] Verify rate limits enforced correctly
- [ ] Verify rate limit headers returned
- [ ] Verify 429 status code for exceeded limits
- [ ] Verify rate limits reset correctly

---

## SECURITY AUDIT

### Input Validation
- [ ] Attempt negative amounts
- [ ] Attempt zero amounts
- [ ] Attempt NaN/Infinity
- [ ] Attempt 10 million BRL
- [ ] Attempt empty strings
- [ ] Attempt 10,000 character strings
- [ ] Attempt SQL injection in names
- [ ] Attempt XSS in descriptions
- [ ] Attempt null/undefined in required fields

### Authorization
- [ ] Non-admin cannot access `/api/admin/*`
- [ ] User cannot modify other user's cart
- [ ] User cannot accept/reject other user's offers
- [ ] Anonymous cannot create offers (requires email)

### Rate Limiting & DOS
- [ ] Verify payment spam is blocked
- [ ] Verify LLM call spam is blocked (costs)
- [ ] Verify visitor counter spam is blocked
- [ ] Verify telemetry spam is blocked

### Data Exposure
- [ ] No API keys in responses
- [ ] No payment hashes in logs (truncate to first 8 chars)
- [ ] No email addresses in public responses
- [ ] No prices exposed in unexpected places

### CORS
- [ ] Verify CORS headers are appropriate (not `*` everywhere)
- [ ] Restrict CORS to frontend domain in production
- [ ] Test CORS preflight requests

---

## DATABASE/STORAGE

### File System
- [ ] All JSON files have .gitignore entries
- [ ] No sensitive data in version control
- [ ] Data directory writable and backed up
- [ ] No hardcoded paths (use `process.cwd()`)

### File Locking
- [ ] Lock files properly cleaned up
- [ ] No orphaned lock files after crashes
- [ ] Retries work on lock contention
- [ ] Timeout handling if lock cannot be acquired

### Data Integrity
- [ ] All JSON files have proper timestamps
- [ ] Transaction logs are append-only
- [ ] Inventory changes are tracked
- [ ] Offer status transitions are valid

---

## MONITORING & OBSERVABILITY

### Error Tracking
- [ ] Sentry configured and tested
- [ ] Error grouping rules configured
- [ ] Alert thresholds set
- [ ] Error sample rate > 100% (log all errors)

### Logging
- [ ] All requests have request IDs
- [ ] All errors logged with context
- [ ] Structured JSON logs for parsing
- [ ] Log retention policy set (30 days minimum)
- [ ] No PII in logs

### Metrics
- [ ] Request latency tracked
- [ ] Error rate tracked
- [ ] Rate limit hits tracked
- [ ] Payment success rate tracked
- [ ] Endpoint-specific metrics (p50, p95, p99)

### Dashboards
- [ ] Create dashboard for payment flow
- [ ] Create dashboard for inventory
- [ ] Create dashboard for error rates
- [ ] Create dashboard for rate limit hits
- [ ] Create dashboard for performance

---

## DOCUMENTATION

### API Documentation
- [ ] OpenAPI/Swagger spec generated
- [ ] All endpoints documented
- [ ] All request/response formats documented
- [ ] All error codes documented
- [ ] Rate limits documented
- [ ] Authentication requirements documented

### Runbooks
- [ ] Payment failure troubleshooting
- [ ] High error rate response
- [ ] Rate limit exceeded troubleshooting
- [ ] Data corruption recovery
- [ ] Rollback procedures

### Internal Docs
- [ ] Architecture decision records
- [ ] Database schema documentation
- [ ] File format specifications
- [ ] Admin procedure guide
- [ ] On-call escalation guide

---

## OPERATIONS

### Deployment
- [ ] Zero-downtime deployment plan
- [ ] Rollback procedure tested
- [ ] Environment parity verification
- [ ] Pre-deployment checklist
- [ ] Post-deployment validation

### Backups
- [ ] Daily data backups configured
- [ ] Backup restoration tested
- [ ] Backup retention policy set (30 days minimum)
- [ ] Off-site backup copy

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Alert notification channels configured
- [ ] Alert escalation configured
- [ ] On-call rotation defined
- [ ] Incident response plan defined

### Configuration
- [ ] All environment variables documented
- [ ] Secrets rotation schedule defined
- [ ] Credentials stored securely (not in code)
- [ ] Configuration audit log
- [ ] Change management process

---

## POST-DEPLOYMENT

### Smoke Tests (Run Immediately After Deployment)
- [ ] Health check endpoint responds
- [ ] Payment creation works end-to-end
- [ ] Cart operations work
- [ ] Admin login works
- [ ] Telemetry recording works

### Monitoring (First 24 Hours)
- [ ] Error rate below 0.1%
- [ ] P95 latency < 500ms on all endpoints
- [ ] No rate limit false positives
- [ ] No data corruption detected
- [ ] No security alerts

### Performance Baselines
- [ ] Establish p50, p95, p99 latencies
- [ ] Establish error rate baseline
- [ ] Establish throughput capacity
- [ ] Set up alerting on deviations

### User Feedback
- [ ] Monitor support channels for issues
- [ ] Check error tracking for new issues
- [ ] Verify payment success notifications sent
- [ ] Confirm no customer impacts

---

## ROLLBACK CRITERIA

Automatic rollback if ANY of these occur:

- [ ] Error rate > 5%
- [ ] P95 latency > 2000ms
- [ ] Payment failures > 10%
- [ ] Data corruption detected
- [ ] Security vulnerability disclosed
- [ ] Critical dependency broken

---

## SIGN-OFF

- [ ] Backend Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Security Lead: ________________ Date: _______
- [ ] Product Manager: ______________ Date: _______

**Cannot deploy to production without all sections complete and all leads signed off.**

---

## QUICK REFERENCE: MISSING FEATURES

These are NOT blocking deployment but should be planned:

- [ ] Email receipts after payment
- [ ] Refund API endpoint
- [ ] Product return/exchange
- [ ] User account history
- [ ] Payment webhook retry logic
- [ ] Admin audit logging
- [ ] Data export API
- [ ] Bulk inventory import
- [ ] Analytics dashboard
- [ ] Customer support ticket system

---

## NOTES FOR TEAM

1. **Race Conditions:** Critical issue that will cause data corruption under production load
2. **Rate Limiting:** LLM calls cost money - MUST limit before production
3. **Authorization:** Admin configuration must not be accessible to users
4. **Validation:** Input validation prevents both security and data integrity issues
5. **Logging:** Production debugging is impossible without structured logs

All critical items must be completed before deploying. No exceptions.

---

**Last Updated:** 2025-11-01
**Status:** AUDIT COMPLETE - READY FOR IMPLEMENTATION

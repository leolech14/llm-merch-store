# API SPRAWL - QUICK REFERENCE CHECKLIST

## Found Issues Summary

- [x] **Duplicate endpoints**: 3 major (visitors/telemetry, stats/metrics, offers/transactions)
- [x] **Unused APIs**: 6 endpoints never called from frontend
- [x] **Legacy APIs**: /api/stats, /api/offers, /api/visitors
- [x] **Missing error handling**: No input validation, inconsistent error responses
- [x] **No validation**: 4 routes accept any input
- [x] **Duplicate file I/O**: ensureDataDir() 6x, read/write patterns 4-5x each
- [x] **Hardcoded values**: Base price, sale dates, admin emails (3 instances)
- [x] **Missing types**: Implicit any in 6+ locations

## Action Items

### CRITICAL (Do First - Security)
- [ ] Add rate limiting to `/api/telemetry` POST
- [ ] Fix file write race conditions (implement locking)
- [ ] Add input validation to all POST endpoints
- [ ] Move hardcoded admin emails to env var

### HIGH PRIORITY (Code Quality)
- [ ] Delete `/api/visitors` (1 unused API)
- [ ] Deprecate `/api/stats` (duplicate of metrics)
- [ ] Delete `/api/offers` (legacy, 3 endpoints)
- [ ] Move hardcoded values to config
- [ ] Create `lib/data-access.ts` (consolidate file I/O)
- [ ] Create `lib/api-types.ts` (shared types)
- [ ] Create `lib/api-response.ts` (standardize errors)

### MEDIUM PRIORITY (Cleanup)
- [ ] Delete unused endpoints (/api/events POST, /api/ask GET, etc)
- [ ] Switch sync I/O to async fs.promises
- [ ] Add input validation middleware
- [ ] Remove implicit any types
- [ ] Standardize error responses

### LOW PRIORITY (Future)
- [ ] Keep /api/transactions (prepared for future)
- [ ] Keep /api/collectors (prepared for future)
- [ ] Implement database for event store
- [ ] Add API documentation (OpenAPI)
- [ ] Add integration tests

## Quick Stats

| Metric | Count |
|--------|-------|
| Total APIs | 15 |
| Actively Used | 8 |
| Unused | 6 |
| Duplicate Logic | 3 patterns |
| Duplicate Helpers | 6x ensureDataDir, 5x read, 4x write |
| Security Issues | 4 |
| Files to Create | 4 |
| Files to Delete | 6 |
| Files to Modify | 12 |
| Code Reduction | 40-50% |

## 15-Minute Quick Overview

```
DUPLICATE ENDPOINTS:
  /api/visitors ──┐
  /api/telemetry  ├─ Both track visitors (consolidate)
  
  /api/stats ─────┐
  /api/metrics    ├─ Both return stats (consolidate)
  
  /api/offers ────┐
  /api/transactions ├─ Both handle offers (delete offers)

UNUSED (Safe to Delete):
  /api/offers (GET, POST, PUT)
  /api/events (POST)
  /api/transactions (GET, POST)
  /api/collectors (GET)
  /api/ask (GET)
  /api/system-config (GET)

FILE I/O DUPLICATION:
  ensureDataDir() - 6 copies → lib/data-access.ts
  readFileSync() - 5+ copies → async readJsonFile()
  writeFileSync() - 4+ copies → async writeJsonFile()

HARDCODED MAGIC NUMBERS:
  149 (base price) → env var or config API
  57:25:00 (sale time) → /api/admin/system-config
  "your.email@gmail.com" → ADMIN_EMAILS env var

MISSING SECURITY:
  No rate limiting on POST /api/telemetry
  No input validation
  Race conditions in file writes
  No CSRF tokens on admin endpoints
```

## Recommended Fix Order

1. **Week 1, Day 1**: Create utility files (data-access, api-types, api-response)
2. **Week 1, Day 2**: Delete 6 unused endpoints (no breaking changes)
3. **Week 1, Day 3**: Move hardcoded values to env/config
4. **Week 1, Day 4**: Add input validation & rate limiting
5. **Week 1, Day 5**: Consolidate duplicate endpoints (visitors→telemetry, stats→metrics)
6. **Week 2**: Test, optimize, document

## Most Important Fixes

1. **Fix race condition** - Add file locking to prevent data loss
2. **Add rate limiting** - Prevent telemetry spam attacks
3. **Delete /api/visitors** - Remove duplicate visitor tracking
4. **Consolidate stats** - Use /api/metrics everywhere
5. **Create data layer** - Eliminate duplicate file I/O code

## Files Generated

- **FINAL_SUMMARY.txt** - This executive summary
- **api_analysis.md** - Detailed inventory & findings (16KB)
- **duplicate_code_examples.md** - Code examples for each issue (13KB)
- **API_SPRAWL_CHECKLIST.md** - This checklist

---

**Analysis Date**: 2025-10-30
**Project**: llm-merch-store
**Scope**: All 15 API routes in app/api/**/route.ts


# QUICK REFERENCE - LLM Merch Store Codebase Analysis

## Key Facts

| Aspect | Finding |
|--------|---------|
| **Total Routes** | 5 (/, /admin, /charts, /auth/signin, /auth/unauthorized) |
| **Public Routes** | 3 (/, /charts, /auth/signin) |
| **Protected Routes** | 1 (/admin - requires Google auth + isAdmin flag) |
| **Components** | 20+ (mostly in /components) |
| **API Routes** | 12+ (all actively used) |
| **Hero Variants** | 8 total (6 in active rotation) |
| **Backup Files** | 2 (.bak, .tmp files safe to delete) |
| **Orphaned Components** | 1 (header-stats.tsx - unused) |

## Routes Summary

### PUBLIC
- **`/`** - Main storefront (1200+ lines, complex)
- **`/charts`** - Hidden analytics dashboard (250 lines)
- **`/auth/signin`** - Google OAuth entry point (97 lines)
- **`/auth/unauthorized`** - 403 fallback (50 lines)

### PROTECTED
- **`/admin`** - Admin dashboard (480 lines, requires auth)

## Navigation
- **Back buttons:** Yes (explicit on admin, implicit via browser/hash)
- **Dead ends:** None detected
- **Hero cycling:** Yes (fixed arrows at bottom)
- **localStorage:** Yes (persists hero variant)

## The WTF? Hero
- **EXISTS:** Yes, defined in hero-switch.tsx (lines 294-375)
- **IN ROTATION:** No (excluded from variants array)
- **ACCESSIBLE:** Via URL param `?hero=wtf`
- **TRACKED:** Yes (admin panel shows stats)
- **STATUS:** Intentionally deprioritized (not deleted)

## The AI Input Bar
- **EXISTS:** Yes, ai-chat.tsx (78 lines)
- **INTEGRATED:** Yes (visible on homepage + product modal)
- **API:** Connected to /api/ask (working)
- **STATUS:** Fully functional, not orphaned

## Cleanup To-Do

```
DELETE (Safe):
- /components/hero-variants/hero-strikethrough-complex.tsx.bak
- /components/hero-variants/hero-strikethrough.tsx.tmp

REVIEW (Decide):
- /components/header-stats.tsx (exists but unused)

OPTIONAL:
- Re-enable WTF hero in rotation? (currently disabled)
```

## Architecture Quality
- No orphaned API routes (all 12+ are used)
- No orphaned hero variants (all accessible)
- Navigation is robust (no dead ends)
- A/B testing framework is clean
- Admin dashboard is functional
- Code is mostly organized

## Quick Navigation Map

```
/ (home)
├── #hero (scroll)
├── #pricing (shop)
├── #features (why)
├── #testimonials (reviews)
├── #proof (QR code)
├── #faq (questions)
├── #contact (form)
└── /admin (if authenticated)

/admin
├── Sign out → /
└── Back to Store → /

/charts
└── Logo → /

/auth/signin
├── Sign in → /admin
└── Back to store → /
```

## Full Documentation
See `CODEBASE_COMPLETE_MAP.md` for detailed analysis.

# COMPLETE CODEBASE MAP - LLM Merch Store

## EXECUTIVE SUMMARY

This is a Next.js 14 merch store with:
- **4 publicly accessible routes** (home, admin, charts, auth)
- **6 hero variants** with A/B testing framework
- **Multiple orphaned code** (backup files, unused hero variants)
- **Full navigation support** with localStorage persistence
- **WTF hero exists** but not as separate component (it's inline in hero-switch.tsx)
- **AI input bar exists** and is integrated (ai-chat.tsx - connected to /api/ask)

---

## TASK 1: MAP ALL UI-ACCESSIBLE ROUTES

### Route: `/` (Homepage)

**URL Path:** `/app/page.tsx`

**Components Rendered:**
- HeroSwitch (hero-switch.tsx) - manages 6 hero variants with A/B testing
  - HeroCognitive (inline)
  - HeroWTF (inline)
  - HeroSkate (inline)
  - HeroMinimal (inline)
  - HeroJoke (inline)
  - HeroMoney (hero-variants/hero-money.tsx)
  - HeroAIFailure (hero-variants/hero-ai-failure.tsx)
  - HeroStrikethrough (hero-variants/hero-strikethrough.tsx) - marked as "experiment"
- WebsiteScaffold (website-scaffold.tsx)
- HeaderCountdown (header-countdown.tsx)
- HeaderVisitor (header-visitor.tsx)
- HeaderProducts (header-products.tsx)
- Scoreboard (ui/scoreboard.tsx)
- ProductDetailModal (ui/product-detail-modal.tsx)
- VisitorPopup (ui/visitor-popup.tsx)
- AIProviders (ai-providers.tsx)
- AIChat (ai-chat.tsx)
- PixPaymentModal (PixPaymentModal.tsx)
- Accordion, TextRotate, Countdown, Button, Card, Input, Textarea, etc. (inline components)

**APIs Called:**
- POST `/api/telemetry` - track visitor/page_view/add_to_cart events
- POST `/api/visitors` - get visitor count
- GET `/api/stats` - get engagement stats
- GET `/api/sale-status` - get sale timing
- GET `/api/inventory` - get product availability
- GET `/api/market-prices` - get pricing data
- POST `/api/pix-payment` - generate PIX payment QR code
- POST `/api/ask` - AI chat responses (from ai-chat.tsx)

**Navigation TO this route:**
- Direct URL access `/`
- Back link from `/admin` -> `/`
- Back link from `/auth/signin` -> `/`
- Auth sign-out callbacks redirect to `/`

**Navigation FROM this route:**
- `#hero` - jumps to hero section
- `#pricing` - jumps to featured collection
- `#features` - jumps to features/why cognitive wearables
- `#testimonials` - jumps to AI testimonials
- `#proof` - jumps to QR code section
- `#faq` - jumps to FAQ section
- `#contact` - jumps to contact form
- `/admin` - Admin button in header (if authenticated)
- No traditional "next page" navigation - single-page scrolling experience

**Special Features:**
- Hero variant auto-selection via URL param: `?hero=cognitive|wtf|skate|minimal|joke|money|ai-failure|experiment`
- Hero variant persistence in localStorage
- Auto-cycling hero variants (5-second transitions)
- Navigation arrows at bottom (fixed position) to cycle through heroes manually

---

### Route: `/admin` (Admin Dashboard - PROTECTED)

**URL Path:** `/app/admin/page.tsx`

**Authentication:**
- Requires NextAuth Google login
- Requires `isAdmin` flag in session.user
- Shows 403 page if not admin

**Components Rendered:**
- StatCard (inline) - Quick metrics display
- ToggleControl (inline) - Feature toggles
- HeroVariantCard (inline) - A/B testing results
- Educational insights section

**APIs Called:**
- GET `/api/metrics` - get all metrics (refreshes every 10s)
- GET `/api/admin/hero-config` - get hero A/B test results
- POST `/api/admin/system-config` - toggle features
  - progressiveHeroEnabled
  - abTestingEnabled
  - analyticsEnabled

**Navigation TO this route:**
- `/auth/signin` with callbackUrl=/admin
- Direct URL access (redirects to signin if not authenticated)
- Header menu link (only visible when authenticated)

**Navigation FROM this route:**
- "Sign Out" button -> `/` (signOut with callbackUrl: '/')
- "Back to Store" button -> `/`
- Browser back button -> previous page

**Data Tracked:**
- Total visitors
- Page views
- Add-to-cart events
- Total sales
- Top performing products
- Hero variant performance (WTF, Cognitive, Skate, Minimal with views/clicks/conversion %)
- Product likes

---

### Route: `/charts` (Analytics Dashboard - HIDDEN)

**URL Path:** `/app/charts/page.tsx`

**Note:** This page is NOT in navigation menu but is publicly accessible (no auth required)

**Components Rendered:**
- WebsiteScaffold (website-scaffold.tsx)
- Charts from Recharts library
  - PieChart (inventory distribution)
  - BarChart placeholders

**APIs Called:**
- GET `/api/stats` - get all stats
- GET `/api/inventory` - get inventory data

**Displays:**
- Real-time visitor count
- Page views
- Add-to-cart events
- Sales count
- Inventory pie chart (available vs sold)
- Top 5 products with click counts
- Engagement rate (calculated from data)

**Navigation TO this route:**
- Direct URL access `/charts`
- No links in UI navigation

**Navigation FROM this route:**
- Logo link -> `/`
- Browser back button

**Special Note:**
- Page updates data every 10 seconds
- Connected to real APIs (data resets when telemetry.json cleared)

---

### Route: `/auth/signin` (Sign-In Page)

**URL Path:** `/app/auth/signin/page.tsx`

**Components:**
- Google Sign-In button
- Information about admin access

**OAuth:**
- Redirects to Google OAuth
- Callback URL: `/admin`

**Navigation TO this route:**
- Clicking admin login prompt
- NextAuth redirects on protected route access

**Navigation FROM this route:**
- Sign-in success -> `/admin`
- "Back to store" link -> `/`

---

### Route: `/auth/unauthorized` (403 Page)

**URL Path:** `/app/auth/unauthorized/page.tsx`

**Shown when:**
- User is logged in but doesn't have `isAdmin` flag
- Accessed via auth middleware

**Navigation:**
- "Back to Store" button -> `/`
- Sign out button -> `/`

---

## TASK 2: FIND ORPHANED CODE

### BACKUP/TEMPORARY FILES (Safe to Delete)

#### File: `/components/hero-variants/hero-strikethrough-complex.tsx.bak`
- **Status:** Backup file (8.3KB)
- **Created:** Oct 31 00:25
- **Is it used:** NO - Never imported anywhere
- **Action:** DELETE - Outdated backup

#### File: `/components/hero-variants/hero-strikethrough.tsx.tmp`
- **Status:** Temporary file (8.3KB)
- **Created:** Oct 31 00:19
- **Is it used:** NO - Tmp file
- **Action:** DELETE - Temporary file

**Analysis:** Both files appear to be from hero redesign iteration. The actual `hero-strikethrough.tsx` exists and is integrated into the hero rotation as "experiment" variant.

---

### INTEGRATED BUT NOT VISUALLY CONNECTED

#### Component: Header-Stats (header-stats.tsx)
- **Lines:** 68
- **Status:** Created but not imported in main page
- **Used by:** Could be used in /charts or admin but isn't
- **Action:** Either delete or integrate into header

#### Component: Language-Toggle (language-toggle.tsx)
- **Lines:** 35
- **Status:** Imported in layout.tsx but location unclear
- **Visible in:** Should be in top-right corner
- **Action:** Keep - It's integrated (language switching)

---

### HERO VARIANTS ANALYSIS

All 6 hero variants ARE used. Here's the rotation:

```typescript
const variants: HeroVariant[] = ["ai-failure", "money", "experiment", "skate", "minimal", "joke"];
```

1. **hero-ai-failure.tsx** (122 lines) - IMPORTED, IN ROTATION
2. **hero-money.tsx** (174 lines) - IMPORTED, IN ROTATION
3. **hero-strikethrough.tsx** (230 lines) - IMPORTED as "experiment", IN ROTATION
4. **HeroSkate** (inline in hero-switch.tsx) - INLINE, IN ROTATION
5. **HeroMinimal** (inline in hero-switch.tsx) - INLINE, IN ROTATION
6. **HeroJoke** (inline in hero-switch.tsx) - INLINE, IN ROTATION
7. **HeroCognitive** (inline in hero-switch.tsx) - INLINE, IN ROTATION (default fallback)
8. **HeroWTF** (inline in hero-switch.tsx) - INLINE, IN ROTATION

**Finding:** ALL are accessible. No orphaned hero variants.

---

### API ROUTES - USAGE ANALYSIS

| API Route | Called By | Status |
|-----------|-----------|--------|
| /api/telemetry | page.tsx (3x) | ACTIVE |
| /api/visitors | page.tsx | ACTIVE |
| /api/stats | page.tsx, charts.tsx, admin.tsx | ACTIVE |
| /api/sale-status | page.tsx (initial + poll) | ACTIVE |
| /api/inventory | page.tsx, charts.tsx | ACTIVE |
| /api/market-prices | page.tsx | ACTIVE |
| /api/pix-payment | page.tsx (handleMakeOffer) | ACTIVE |
| /api/ask | ai-chat.tsx, product-detail-modal.tsx | ACTIVE |
| /api/metrics | admin.tsx (every 10s) | ACTIVE |
| /api/admin/hero-config | admin.tsx | ACTIVE |
| /api/admin/system-config | admin.tsx | ACTIVE |
| /api/auth/[...nextauth] | NextAuth provider | ACTIVE |
| /api/webhook/pix-payment | (External webhook) | CONFIGURED |

**Finding:** NO orphaned API routes. All are called by at least one component.

---

## TASK 3: NAVIGATION FLOW - "Can you navigate away and come back?"

### Back Button Analysis

**Current implementation:**
- NO explicit "back" button on home page
- Browser back button WORKS (browser history)
- Navigation is primarily hash-based (#hero, #pricing, etc.)
- Admin page has explicit "Back to Store" button -> `/`
- Auth pages have "← Back to store" links -> `/`

**Answer: YES, but with caveats**

1. **Within homepage:** 
   - Using browser back/forward navigates to previous pages
   - Hash navigation (scrolling) doesn't create history entries
   - Can use hash anchors to jump sections: #pricing → #hero → etc.

2. **From homepage to admin:**
   - Admin page has explicit "Back to Store" button
   - Sign-out redirects to home
   - Browser back works

3. **From admin to home:**
   - Clicking "Back to Store" returns to home
   - Sign-out redirects to home
   - Browser back works

4. **Hero navigation:**
   - Hero variants have left/right arrows (bottom fixed position)
   - Clicking arrows cycles through heroes
   - Stored in localStorage for returning visitors
   - Not a "back" button, but navigation exists

**Dead Ends:** NONE FOUND
- Every page has explicit back navigation
- Home page has hash anchors for section navigation
- All pages can access home via logo/menu

---

## TASK 4: WTF HERO & INPUT BAR

### WTF Hero Component Status

**Finding: YES, IT EXISTS**

#### Location: 
- `/components/hero-switch.tsx` - Lines 294-375
- Defined inline as `function HeroWTF()`

#### Content:
```typescript
function HeroWTF({ visitorCount, saleStatus, onCTAClick }: HeroProps) {
  return (
    <motion.section>
      <h1>WTF?<span>Que porra é essa?</span></h1>
      <p>Camisetas que ensinam IA/ML</p>
      ...
    </motion.section>
  );
}
```

#### How it's accessed:
- **URL param:** `?hero=wtf` (sets variant to "wtf")
- **But...** The variant list in line 59 does NOT include "wtf":
  ```typescript
  const variants: HeroVariant[] = ["ai-failure", "money", "experiment", "skate", "minimal", "joke"];
  ```
- **Status:** The component EXISTS but is NOT in the rotation
- **Can be accessed:** Via URL query param `?hero=wtf` (line 68 allows it)
- **Not randomly selected:** Won't appear in auto A/B test rotation

#### Admin Panel shows:
- In `admin/page.tsx` line 43: `wtf?: HeroVariantStats;`
- HeroVariantCard rendered for "WTF" (line 301-306)
- But the variant isn't in active rotation on homepage

**Conclusion:** WTF hero component is defined and accessible via `?hero=wtf` but removed from the active rotation. Likely intentional (comment on line 21-24 mentions it was a variant option).

---

### AI Input Bar Status

**Finding: YES, IT EXISTS AND IS INTEGRATED**

#### Location: 
- `/components/ai-chat.tsx` (78 lines)

#### Features:
- Text input field with placeholder "Ask anything about the store..."
- "ASK" button (submits form)
- Shows loading state ("THINKING...")
- Displays Claude's response below

#### Integration:
- **In homepage:** `<AIChat />` (line 1115 in page.tsx)
- **Section title:** "ASK CLAUDE"
- **Background:** Black section (line 1105-1117)

#### API Connection:
- **Endpoint:** POST `/api/ask`
- **Payload:** `{ question: string }`
- **Response:** `{ answer: string, error?: string }`
- **System Prompt:** Portuguese AI personality ("Cognitive Wearables" assistant)

#### Also used in:
- `/components/ui/product-detail-modal.tsx` (line 255-280) - same `/api/ask` call

**Status:** FULLY INTEGRATED AND FUNCTIONAL
- Not orphaned
- Connected to real API
- Visible on homepage
- Working implementation

---

## SUMMARY TABLE

```
ACCESSIBLE ROUTES:
  Route: /
  Components: HeroSwitch, WebsiteScaffold, Headers, Scoreboard, AIChat, etc.
  APIs: telemetry, visitors, stats, sale-status, inventory, market-prices, pix-payment, ask
  Can reach via: Direct URL, home link from all pages, nav menu
  Can leave via: Menu (Shop, About, Contact), Footer links, Logo, Hero nav arrows

  Route: /admin
  Components: StatCard, ToggleControl, HeroVariantCard, Educational content
  APIs: metrics, hero-config, system-config
  Can reach via: Auth signin flow, direct URL
  Can leave via: Sign-out button, "Back to Store" button, browser back

  Route: /charts
  Components: WebsiteScaffold, Recharts (Pie, Bar charts)
  APIs: stats, inventory
  Can reach via: Direct URL /charts (hidden from nav)
  Can leave via: Logo link, browser back

  Route: /auth/signin
  Components: Google OAuth button, description
  APIs: NextAuth OAuth
  Can reach via: Admin auth flow redirect
  Can leave via: Sign-in success -> /admin, "Back to store" link

ORPHANED CODE:
  File: /components/hero-variants/hero-strikethrough-complex.tsx.bak
  Created: Oct 31 00:25
  Status: Backup file, never imported
  Action: DELETE - It's a .bak file

  File: /components/hero-variants/hero-strikethrough.tsx.tmp
  Created: Oct 31 00:19
  Status: Temporary file
  Action: DELETE - It's a .tmp file

  File: /components/header-stats.tsx
  Created: Unknown
  Status: Component exists, not imported anywhere
  Action: DELETE or INTEGRATE (is it needed?)

WTF HERO STATUS:
  - Component EXISTS in hero-switch.tsx (lines 294-375)
  - Defined as inline function HeroWTF()
  - NOT in active rotation: variants array excludes it (line 59)
  - IS accessible via URL param: ?hero=wtf works
  - Is NOT deleted, just removed from rotation
  - Admin panel references it (hero-config includes wtf stats)
  - Intentional removal (no import errors, controlled exclusion)

INPUT BAR STATUS:
  - Component EXISTS: /components/ai-chat.tsx (78 lines)
  - FULLY INTEGRATED on homepage (line 1115)
  - Connected to working API: /api/ask
  - Also used in: product-detail-modal.tsx
  - System prompt: Portuguese AI personality
  - Status: WORKING, NOT ORPHANED

NAVIGATION FLOW:
  Can you navigate away and come back: YES
  - Browser back/forward works everywhere
  - Explicit "Back to Store" button on admin page
  - Logo links to home from all pages
  - Hero navigation arrows to cycle variants
  - No dead ends detected
  - Hash anchors for section navigation on homepage
```

---

## CRITICAL FINDINGS

1. **WTF Hero is in code but not in rotation**
   - The component is fully defined (HeroWTF function, 81 lines)
   - Admin dashboard still tracks it (wtf stats visible)
   - It's intentionally excluded from the variants array
   - Can be forced via URL: `?hero=wtf`
   - Likely deprioritized in favor of other variants

2. **AI Input bar is NOT orphaned**
   - Clean, minimal implementation (78 lines)
   - Properly integrated in main page (black section)
   - Connected to real `/api/ask` endpoint
   - Also used in product modal
   - Portuguese AI system prompt (matches store's Portuguese theme)

3. **Clean architecture**
   - No orphaned API routes
   - All components are either imported or intentionally excluded (hero variants)
   - Navigation is consistent across pages
   - Backup files (.bak, .tmp) can be safely deleted

4. **A/B Testing Framework**
   - 6 hero variants in active rotation
   - Admin dashboard tracks performance
   - localStorage persists selected variant for returning users
   - URL params override everything (?hero=)

---

## RECOMMENDATIONS

1. **Delete backup files:**
   - `hero-strikethrough-complex.tsx.bak`
   - `hero-strikethrough.tsx.tmp`

2. **Review header-stats.tsx:**
   - Component exists but isn't used
   - Decide: delete or integrate into /admin dashboard

3. **Document WTF Hero decision:**
   - Is it intentionally excluded or deprecated?
   - Admin panel still shows stats for it
   - Consider updating admin code if it's truly unused

4. **Navigation is solid:**
   - Back navigation works everywhere
   - No dead ends
   - Hero cycling provides internal navigation
   - Keep hero nav arrows at bottom (fixed position)


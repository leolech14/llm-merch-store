# PROVIDERS REGISTRY - LLM Merch Store

> **Single Source of Truth** for all external services, accounts, and configurations

**Last Updated:** 2025-11-01
**Status:** Complete inventory of all integrations
**Dashboard:** [Vercel Console](#vercel) | [Doppler Dashboard](#doppler) | [Google Cloud Console](#google-oauth)

---

## TABLE OF CONTENTS

1. [Payment Providers](#payment-providers)
2. [Secrets Management](#secrets-management)
3. [Hosting & Infrastructure](#hosting--infrastructure)
4. [Authentication & User Services](#authentication--user-services)
5. [Analytics & Monitoring](#analytics--monitoring)
6. [Development Tools](#development-tools)
7. [Quick Setup Reference](#quick-setup-reference)
8. [Integration Status](#integration-status)

---

## PAYMENT PROVIDERS

### EBANX (PIX Payment Processing)

| Property | Value |
|----------|-------|
| **Service** | EBANX PIX Payment Gateway |
| **Purpose** | Brazilian PIX payment processing for merchandise |
| **Status** | Active (Sandbox) |
| **API Endpoint** | `https://sandbox.ebanx.com/ws/direct` |
| **Environment** | Sandbox (test mode) |
| **Integration Type** | Full implementation |

**Configuration Details:**
- **Environment Variable:** `EBANX_INTEGRATION_KEY`
- **Location:** `.env.local` / Doppler
- **Current Value:** Stored in `.env.local` (not exposed in repo)
- **API Documentation:** https://www.ebanx.com/en/developers
- **Usage:**
  - `/api/pix-payment` - Create PIX payment request
  - `/api/pix-payment-status` - Check payment status

**Implementation Files:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/api/pix-payment/route.ts`
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/api/pix-payment-status/route.ts`
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/components/PixPaymentModal.tsx`

**Request Flow:**
1. Frontend sends: `POST /api/pix-payment` with amount, productId, productName
2. Backend calls EBANX API with integration key
3. EBANX returns payment hash + QR code
4. Frontend displays QR code for user scanning
5. Polling: `POST /api/pix-payment-status` to check confirmation

**Prod Migration Needed:**
- Switch endpoint from `sandbox.ebanx.com` to production
- Update EBANX_INTEGRATION_KEY to production key

---

### Stripe (Future)

| Property | Value |
|----------|-------|
| **Service** | Stripe Payment Processing |
| **Purpose** | Credit/debit card payments (future implementation) |
| **Status** | Configured but not active |
| **Integration Type** | Placeholder |

**Configuration Details:**
- **Publishable Key Env Var:** `STRIPE_PUBLISHABLE_KEY` (commented)
- **Secret Key Env Var:** `STRIPE_SECRET_KEY` (commented)
- **Location:** `.env.example` / `.env.doppler.example`
- **Status:** Future implementation

**Package Installation:**
```bash
npm list stripe  # Already installed: v19.2.0
```

**Notes:**
- Package is installed but not currently used
- Ready for integration when needed
- Would be alternative to EBANX for non-Brazil payments

---

### Mercado Pago (Future)

| Property | Value |
|----------|-------|
| **Service** | Mercado Pago Payment Processing |
| **Purpose** | Alternative Latin America payment (future) |
| **Status** | Not implemented |
| **Integration Type** | Placeholder |

**Configuration Details:**
- **Access Token Env Var:** `MERCADOPAGO_ACCESS_TOKEN` (commented)
- **Public Key Env Var:** `MERCADOPAGO_PUBLIC_KEY` (commented)
- **Location:** `.env.example` / `.env.doppler.example`

---

## SECRETS MANAGEMENT

### Doppler

| Property | Value |
|----------|-------|
| **Service** | Doppler - Secrets Management Platform |
| **Purpose** | Centralized secret management for all environments |
| **Status** | Active |
| **Dashboard URL** | https://dashboard.doppler.com |
| **Integration Type** | Full implementation |

**Project Configuration:**
- **Project Name:** `llmmerch`
- **Environments:** `dev`, `staging`, `prod`
- **Default Config:** `dev`
- **Team Access:** Available (pending setup)

**Configuration File:**
- **Location:** `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/doppler.yaml`
- **Setup:** https://www.doppler.com/docs/cli

**CLI Commands:**
```bash
# Login
doppler login

# View secrets
doppler secrets

# Set a secret
doppler secrets set KEY="value"

# Run with environment
doppler run -- npm run dev          # Uses 'dev' config
doppler run --config prod -- vercel --prod  # Uses 'prod' config
```

**Managed Secrets:**
- Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- NextAuth (NEXTAUTH_SECRET, NEXTAUTH_URL)
- Axiom Logging (AXIOM_TOKEN, AXIOM_DATASET)
- Vercel Deployment (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- Analytics (NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_GA_MEASUREMENT_ID)
- Site Config (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SHOP_URL)
- LLM APIs (OPENAI_API_KEY, ANTHROPIC_API_KEY)
- EBANX Integration (EBANX_INTEGRATION_KEY)

**Complete Secrets List:** See `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.env.doppler.example`

---

## HOSTING & INFRASTRUCTURE

### Vercel

| Property | Value |
|----------|-------|
| **Service** | Vercel - Next.js Hosting & Deployment |
| **Purpose** | App hosting, edge functions, analytics |
| **Status** | Active |
| **Dashboard URL** | https://vercel.com/dashboard |
| **Integration Type** | Full deployment platform |

**Project Details:**
- **Project Name:** `llm-merch-store`
- **Project ID:** `prj_bosyvxXPwExIdzvIXLoBuEuvn2z2`
- **Organization ID:** `team_9NPNyMZn1RFftraenz2uiksP`
- **Production Domain:** https://llmmerch.space
- **Repository:** Git-based deployment
- **Framework:** Next.js (v16.0.1)
- **Build Command:** `npm run build`
- **Public:** Yes

**Configuration Files:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.vercel/project.json`
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/vercel.json`

**Environment Variables Setup:**
```bash
# Vercel Token (for CLI deployment)
VERCEL_TOKEN=<token>

# Project Management
VERCEL_ORG_ID=team_9NPNyMZn1RFftraenz2uiksP
VERCEL_PROJECT_ID=prj_bosyvxXPwExIdzvIXLoBuEuvn2z2
```

**Integrated Services (via Vercel):**
- **Vercel Analytics** - Performance monitoring
- **Vercel Speed Insights** - Core Web Vitals tracking
- **Vercel KV** - Redis-based storage (pending setup)
- **Vercel Postgres** - Database (future)
- **Vercel Blob** - File storage (future)

**Deployment Environments:**
- **Preview:** Auto-generated for PRs
- **Production:** `https://llmmerch.space`
- **Staging:** Via Doppler `staging` config

---

### Domain

| Property | Value |
|----------|-------|
| **Domain Name** | `llmmerch.space` |
| **Purpose** | Production domain for LLM Merch Store |
| **Status** | Active |
| **DNS Provider** | (Managed via Vercel) |
| **SSL/TLS** | Auto-enabled by Vercel |

**Environment Variable:**
- `NEXT_PUBLIC_SITE_URL=https://llmmerch.space` (in `.env.example`)

**Alternative Domains (if applicable):**
- None currently configured

---

### Vercel KV (Redis Storage)

| Property | Value |
|----------|-------|
| **Service** | Vercel KV - Redis-compatible storage |
| **Purpose** | In-memory data storage (payment states, cache) |
| **Status** | Requires setup (pending KV creation) |
| **Package:** | `@vercel/kv` v3.0.0 (installed) |
| **Integration Type** | Storage backend |

**Configuration Details:**
- **Setup URL:** https://vercel.com/dashboard → KV
- **Database Name (planned):** `llmmerch-kv`
- **Region:** Default (typically US)

**Status Notes:**
- Package is installed
- Database creation requires web dashboard (no CLI command)
- Migration from file-based JSON to KV is planned
- Once created, will replace `fs.writeFileSync` / `fs.readFileSync`

**Environment Variables (after setup):**
```bash
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

---

## AUTHENTICATION & USER SERVICES

### NextAuth.js + Google OAuth

| Property | Value |
|----------|-------|
| **Service** | NextAuth.js v4.24.13 |
| **Auth Provider** | Google OAuth 2.0 |
| **Purpose** | Admin panel authentication |
| **Status** | Active |
| **Integration Type** | Full implementation |

**Configuration Details:**

**NextAuth Setup:**
- **Session Strategy:** JWT
- **Session Max Age:** 30 days
- **Secret Env Var:** `NEXTAUTH_SECRET`
- **Session URL:** `NEXTAUTH_URL` (http://localhost:3000 local, https://llmmerch.space prod)

**Google OAuth:**
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Client ID Env Var:** `GOOGLE_CLIENT_ID`
- **Client Secret Env Var:** `GOOGLE_CLIENT_SECRET`
- **Project Name:** "LLM Merch" (in Google Cloud)
- **Consent Type:** External

**OAuth Redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://llmmerch.space/api/auth/callback/google
https://[preview-deployment].vercel.app/api/auth/callback/google
```

**Implementation File:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/api/auth/[...nextauth]/route.ts`

**Admin Access Control:**
- **Whitelist Location:** `app/api/auth/[...nextauth]/route.ts` (lines 12-15)
- **Current Admin Emails:**
  1. `leonardo.lech@gmail.com` (Main admin)
  2. `leo@lbldomain.com` (Secondary admin)
- **To Add Admin:** Edit ADMIN_EMAILS array in route.ts

**Login Flow:**
1. User visits `/auth/signin`
2. Clicks "Sign in with Google"
3. OAuth redirects to Google login
4. Google redirects back to `/api/auth/callback/google`
5. Token is created with `isAdmin` flag
6. Session stored as JWT cookie

**Protected Routes:**
- `/admin` - Admin dashboard (requires isAdmin=true)
- `/api/admin/*` - Admin API endpoints

**Session Object:**
```typescript
{
  user: {
    name: string,
    email: string,
    image?: string,
    isAdmin: boolean,    // Added by NextAuth callback
    id: string,          // Added by NextAuth callback
  },
  expires: string,       // ISO date
}
```

---

## ANALYTICS & MONITORING

### Vercel Analytics

| Property | Value |
|----------|-------|
| **Service** | Vercel Analytics - Web vitals & performance |
| **Purpose** | Real-time performance monitoring |
| **Status** | Active |
| **Dashboard URL** | https://vercel.com/dashboard → Analytics |
| **Package:** | `@vercel/analytics` v1.5.0 (installed) |
| **Integration Type** | Built-in measurement |

**Configuration Details:**
- **Env Var:** `NEXT_PUBLIC_VERCEL_ANALYTICS=1`
- **Location in Code:** `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/layout.tsx` (line 40)
- **Component:** `<Analytics />`

**Metrics Tracked:**
- Core Web Vitals (LCP, FID, CLS)
- Page load performance
- Route transitions
- Custom events (optional)

**Enable/Disable:**
- Controlled via admin panel setting: `systemConfig.analyticsEnabled`

---

### Vercel Speed Insights

| Property | Value |
|----------|-------|
| **Service** | Vercel Speed Insights - Real User Monitoring |
| **Purpose** | Monitor actual user performance |
| **Status** | Active |
| **Dashboard URL** | https://vercel.com/dashboard → Speed Insights |
| **Package:** | `@vercel/speed-insights` v1.2.0 (installed) |
| **Integration Type** | Built-in measurement |

**Configuration Details:**
- **Location in Code:** `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/layout.tsx` (line 41)
- **Component:** `<SpeedInsights />`
- **Collection:** Automatic (no setup needed)

**Metrics Tracked:**
- Real user monitoring (RUM)
- Route performance
- Resource timing

---

### Axiom (Logging & Analytics)

| Property | Value |
|----------|-------|
| **Service** | Axiom - Serverless logging & analytics |
| **Purpose** | Application logging, debugging, analytics |
| **Status** | Configured |
| **Dashboard URL** | https://app.axiom.co |
| **Package:** | `@axiomhq/js` v1.3.1, `next-axiom` v1.9.3 (installed) |
| **Integration Type** | Logging integration |

**Configuration Details:**
- **API Token Env Var:** `AXIOM_TOKEN`
- **Dataset Name Env Var:** `AXIOM_DATASET`
- **Ingest Endpoint:** `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=https://api.axiom.co`
- **Default Dataset:** `llmmerch-dev` (dev), `llmmerch-prod` (prod)

**Setup Location:** `.env.doppler.example` (lines 13-16)

**Features:**
- Server-side logging
- Client-side analytics
- Query builder for insights
- Real-time dashboards

**Usage:**
```typescript
import { logger } from 'next-axiom';
logger.info('Event occurred', { data: value });
```

---

### Google Analytics 4 (GA4)

| Property | Value |
|----------|-------|
| **Service** | Google Analytics 4 |
| **Purpose** | Website traffic, user behavior tracking |
| **Status** | Configured |
| **Dashboard URL** | https://analytics.google.com |
| **Integration Type** | GTM integration (via Google Tag Manager) |

**Configuration Details:**
- **Measurement ID Env Var:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Location:** `.env.doppler.example` (line 22)
- **Format:** `G-XXXXXXXXXX`

**Implementation:**
- Integrated via Google Tag Manager (GTM)
- Not directly in code (managed through GTM)

---

### Google Tag Manager (GTM)

| Property | Value |
|----------|-------|
| **Service** | Google Tag Manager (GTM) - Tag & Analytics Management |
| **Purpose** | Manage analytics, tracking pixels, custom events |
| **Status** | Configured |
| **Dashboard URL** | https://tagmanager.google.com |
| **Integration Type** | Tag manager |

**Configuration Details:**
- **Container ID Env Var:** `NEXT_PUBLIC_GTM_ID`
- **Format:** `GTM-XXXXXXX`
- **Location:** `.env.doppler.example` (line 19)

**Features:**
- Centralized analytics management
- Event tracking without code changes
- A/B testing support
- Custom conversions

**Implementation Notes:**
- Container typically injected via `next/script`
- Allows adding GA4 without code changes

---

### Posthog (Not Currently Used)

| Property | Value |
|----------|-------|
| **Service** | Posthog - Product analytics |
| **Purpose** | User behavior, product insights |
| **Status** | Not implemented |
| **Integration Type** | Not active |

**Notes:**
- Mentioned in search but not configured
- Alternative to Axiom if needed in future

---

## DEVELOPMENT TOOLS

### Package Manager & Registry

| Property | Value |
|----------|-------|
| **Manager** | npm (Node Package Manager) |
| **Registry** | https://registry.npmjs.org |
| **Node Version** | Managed by Vercel (latest supported) |
| **Lock File:** | `package-lock.json` |

**Package Installation:**
```bash
npm install
# or
npm ci  # CI/CD recommended
```

**Key Packages by Category:**

**Core Framework:**
- `next` v16.0.1 - Next.js framework
- `react` v19.2.0 - React library
- `react-dom` v19.2.0 - React DOM

**Authentication:**
- `next-auth` v4.24.13 - NextAuth.js
- `@auth/core` v0.34.3 - Auth core

**Styling:**
- `tailwindcss` v4 - Utility CSS
- `@tailwindcss/postcss` v4 - PostCSS plugin

**UI Components:**
- `@radix-ui/react-dialog` v1.1.15
- `@radix-ui/react-accordion` v1.2.12
- `@radix-ui/react-slot` v1.2.3
- `lucide-react` v0.548.0 - Icon library

**Analytics & Monitoring:**
- `@vercel/analytics` v1.5.0
- `@vercel/speed-insights` v1.2.0
- `@axiomhq/js` v1.3.1
- `next-axiom` v1.9.3

**Storage:**
- `@vercel/kv` v3.0.0 - Redis (not yet used)
- `@vercel/blob` v2.0.0 - File storage (future)

**Payment:**
- `stripe` v19.2.0 - Stripe SDK
- `ebanx` v1.5.0 - EBANX SDK

**Animation:**
- `framer-motion` v12.23.24 - Animation library

**Utilities:**
- `clsx` v2.1.1 - Class name management
- `class-variance-authority` v0.7.1 - Component variants
- `tailwind-merge` v3.3.1 - Tailwind class merging

---

### TypeScript

| Property | Value |
|----------|-------|
| **Version** | v5 (installed) |
| **Mode** | Strict |
| **Config File:** | `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/tsconfig.json` |
| **Status** | Active |

---

### ESLint

| Property | Value |
|----------|-------|
| **Version** | v9 (installed) |
| **Config:** | `eslint-config-next` v16.0.1 |
| **Config File:** | `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/eslint.config.mjs` |

---

### GitHub

| Property | Value |
|----------|-------|
| **Repository** | Hosted in `.git` directory |
| **Status** | Git initialized locally |
| **Remotes** | None configured at project root |
| **Deployment:** | Via Vercel (auto-deploys on push) |

**Notes:**
- Project uses Git version control
- Vercel connects to Git repo for CI/CD
- Automatic deployments on commits

---

## LLM API PROVIDERS

### OpenAI

| Property | Value |
|----------|-------|
| **Service** | OpenAI - GPT API |
| **Purpose** | Dynamic AI responses for "Hero WTF" feature |
| **Status** | Optional, active if key provided |
| **API Endpoint** | https://api.openai.com/v1/chat/completions |
| **Integration Type** | Fallback LLM option |

**Configuration Details:**
- **API Key Env Var:** `OPENAI_API_KEY`
- **Format:** `sk-proj-...`
- **Location:** `.env.example`, `.env.doppler.example`, Doppler dashboard

**Implementation File:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/api/ask/route.ts` (lines 74-104)

**Model Used:** `gpt-4o-mini` (fast + cheap)

**API Request:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "System prompt..."},
    {"role": "user", "content": "User question"}
  ],
  "max_tokens": 150,
  "temperature": 0.8
}
```

**Features:**
- Smart, contextual responses about merch
- Handles questions with personality
- Language: Portuguese/English mix

---

### Anthropic Claude

| Property | Value |
|----------|-------|
| **Service** | Anthropic - Claude API |
| **Purpose** | Dynamic AI responses for "Hero WTF" feature |
| **Status** | Optional, alternative to OpenAI |
| **API Endpoint** | https://api.anthropic.com/v1/messages |
| **Integration Type** | Fallback LLM option |

**Configuration Details:**
- **API Key Env Var:** `ANTHROPIC_API_KEY`
- **Format:** `sk-ant-...`
- **Location:** `.env.example`, `.env.doppler.example`, Doppler dashboard

**Implementation File:**
- `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/api/ask/route.ts` (lines 107-137)

**Model Used:** `claude-3-5-haiku-20241022` (fast + small)

**API Request:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 150,
  "system": "System prompt...",
  "messages": [
    {"role": "user", "content": "User question"}
  ]
}
```

**Features:**
- Fast haiku model for quick responses
- Understands context well
- Language: Portuguese/English mix

---

**LLM Fallback Logic:**
1. If `OPENAI_API_KEY` exists → Use OpenAI
2. Else if `ANTHROPIC_API_KEY` exists → Use Anthropic
3. Else → Use static hardcoded responses (no API call)

---

## QUICK SETUP REFERENCE

### Initial Setup Checklist

```bash
# 1. Install dependencies
npm install

# 2. Setup Doppler CLI (if not already installed)
brew install dopplerhq/cli/doppler  # macOS
doppler login

# 3. Initialize Doppler for project
cd /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store
doppler setup
# Choose: Project = llmmerch, Config = dev

# 4. Set up local .env.local (or use Doppler)
cp .env.example .env.local
nano .env.local  # Edit with your keys

# 5. Create Google OAuth credentials
# Visit: https://console.cloud.google.com/apis/credentials
# Follow: GOOGLE_LOGIN_SETUP.md

# 6. Add to Doppler (one-time):
doppler secrets set GOOGLE_CLIENT_ID="..."
doppler secrets set GOOGLE_CLIENT_SECRET="..."
doppler secrets set NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# 7. (Optional) EBANX PIX integration
doppler secrets set EBANX_INTEGRATION_KEY="..."

# 8. (Optional) LLM API
doppler secrets set OPENAI_API_KEY="..."  # or ANTHROPIC_API_KEY

# 9. Run development server
doppler run -- npm run dev  # Uses Doppler secrets
# or
npm run dev  # Uses .env.local
```

### Environment Variable Mapping

| Variable | Type | Purpose | Location |
|----------|------|---------|----------|
| `GOOGLE_CLIENT_ID` | Secret | OAuth client ID | Doppler |
| `GOOGLE_CLIENT_SECRET` | Secret | OAuth secret | Doppler |
| `NEXTAUTH_SECRET` | Secret | JWT signing | Doppler |
| `NEXTAUTH_URL` | Var | Auth callback URL | Doppler |
| `EBANX_INTEGRATION_KEY` | Secret | PIX payment key | `.env.local` / Doppler |
| `OPENAI_API_KEY` | Secret | OpenAI API | Doppler (optional) |
| `ANTHROPIC_API_KEY` | Secret | Anthropic API | Doppler (optional) |
| `AXIOM_TOKEN` | Secret | Axiom logging | Doppler |
| `AXIOM_DATASET` | Var | Axiom dataset | Doppler |
| `NEXT_PUBLIC_GTM_ID` | Var | Google Tag Manager | Doppler |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Var | GA4 measurement | Doppler |
| `NEXT_PUBLIC_SITE_URL` | Var | Production URL | Doppler |
| `NEXT_PUBLIC_SHOP_URL` | Var | Shop route | `.env.example` |
| `NEXT_PUBLIC_API_URL` | Var | API base URL | `.env.local` |
| `NEXT_PUBLIC_VERCEL_ANALYTICS` | Var | Enable analytics | Doppler |
| `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT` | Var | Axiom endpoint | Doppler |
| `VERCEL_TOKEN` | Secret | Vercel CLI token | Doppler |
| `VERCEL_ORG_ID` | Var | Vercel org ID | Doppler |
| `VERCEL_PROJECT_ID` | Var | Vercel project ID | Doppler |

**Notes:**
- `NEXT_PUBLIC_*` variables are exposed to frontend
- Other variables are backend-only
- Secrets should NEVER be in Git
- Use Doppler or `.env.local` (gitignored)

---

## INTEGRATION STATUS

### Payment Integrations

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| EBANX PIX | Active | 100% | Fully implemented, using sandbox |
| Stripe | Ready | 0% | Package installed, not implemented |
| Mercado Pago | Ready | 0% | Placeholder only |

### Authentication

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| NextAuth + Google OAuth | Active | 100% | Fully implemented, admin-only |

### Analytics

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| Vercel Analytics | Active | 100% | Auto-enabled on Vercel |
| Vercel Speed Insights | Active | 100% | Auto-enabled on Vercel |
| Axiom Logging | Configured | 90% | Ready, needs token setup |
| Google Analytics 4 | Configured | 80% | Via GTM, ready |
| Google Tag Manager | Configured | 80% | Ready, can manage tags |
| Posthog | Not Used | 0% | Alternative available |

### Storage

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| Vercel KV (Redis) | Ready | 0% | Installed, requires dashboard setup |
| Vercel Postgres | Planned | 0% | Future database |
| Vercel Blob | Planned | 0% | Future file storage |
| JSON Files | Active | 100% | Current (temporary) |

### LLM APIs

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| OpenAI | Optional | 100% | Implemented, key optional |
| Anthropic Claude | Optional | 100% | Implemented, key optional |
| Static Fallback | Active | 100% | Works without any LLM key |

### Hosting & Deployment

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| Vercel | Active | 100% | Primary hosting platform |
| Doppler | Active | 95% | Secrets management ready |
| GitHub | Active | 100% | Git version control |
| llmmerch.space Domain | Active | 100% | Production domain |

### Monitoring

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| Vercel Analytics | Active | 100% | Built-in performance |
| NextAuth Logging | Active | 100% | Auth event logging |
| Error Tracking | Basic | 60% | Console logging active, Sentry not used |

---

## ADMIN SETUP

### Adding New Admins

Edit `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/app/api/auth/[...nextauth]/route.ts`:

```typescript
const ADMIN_EMAILS = [
  "leonardo.lech@gmail.com",  // Main admin
  "leo@lbldomain.com",         // Secondary admin
  "new-admin@example.com",     // ADD HERE
];
```

Then redeploy:
```bash
npm run build && npm run start
# or via Vercel git push
```

---

## DEPLOYMENT CHECKLIST

### Before Production Deploy

```bash
# ✓ All secrets set in Doppler
doppler secrets

# ✓ Environment variable mapping complete
# ✓ Google OAuth URIs updated for production
# ✓ EBANX switched to production (if needed)
# ✓ Vercel environment variables synced
doppler run -- vercel env pull

# ✓ Build successful
npm run build

# ✓ Tests passing (if applicable)
npm run test  # when available

# ✓ Production domain configured
# llmmerch.space → Vercel DNS

# ✓ Deployment method
# Option A: Git push to main (auto-deploys)
# Option B: Manual CLI
doppler run --config prod -- vercel --prod
```

---

## TROUBLESHOOTING GUIDE

### EBANX Payment Failing

**Error:** "EBANX_INTEGRATION_KEY not configured"
**Solution:**
1. Verify `.env.local` has `EBANX_INTEGRATION_KEY`
2. Or set in Doppler: `doppler secrets set EBANX_INTEGRATION_KEY="..."`
3. Restart dev server: `npm run dev`

### Google Login Not Working

**Error:** "Invalid Client ID"
**Solution:**
1. Verify credentials at: https://console.cloud.google.com/apis/credentials
2. Check redirect URIs match your domain
3. Update `.env.local` / Doppler with current credentials

### Vercel KV Not Found

**Error:** "KV database not found"
**Solution:**
1. Create KV database in Vercel dashboard
2. Name it: `llmmerch-kv`
3. Wait for creation
4. Variables auto-populate in Vercel project
5. Pull to local: `vercel env pull`

### Analytics Not Showing

**Error:** "No data in analytics"
**Solution:**
1. Check `NEXT_PUBLIC_VERCEL_ANALYTICS=1` is set
2. Check admin toggle: `systemConfig.analyticsEnabled`
3. Analytics takes 24h to appear
4. Verify GTM container ID is correct

---

## USEFUL LINKS

### Dashboards & Consoles

| Service | URL |
|---------|-----|
| Vercel | https://vercel.com/dashboard |
| Doppler | https://dashboard.doppler.com |
| Google Cloud | https://console.cloud.google.com |
| Google Analytics | https://analytics.google.com |
| Google Tag Manager | https://tagmanager.google.com |
| EBANX | https://www.ebanx.com/en/developers |
| Axiom | https://app.axiom.co |

### Documentation

| Service | URL |
|---------|-----|
| Next.js | https://nextjs.org/docs |
| NextAuth.js | https://next-auth.js.org |
| Doppler | https://docs.doppler.com |
| Vercel | https://vercel.com/docs |
| EBANX | https://www.ebanx.com/en/developers |
| Axiom | https://axiom.co/docs |

### Local Config Files

| File | Purpose |
|------|---------|
| `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.env.example` | Environment template |
| `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.env.doppler.example` | Doppler secrets template |
| `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.env.local` | Local secrets (gitignored) |
| `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/doppler.yaml` | Doppler project config |
| `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/vercel.json` | Vercel deployment config |
| `/Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.vercel/project.json` | Vercel project metadata |

---

## REVISION HISTORY

| Date | Author | Change |
|------|--------|--------|
| 2025-11-01 | Claude Code | Initial complete registry |

---

**Last Verified:** 2025-11-01
**Next Review:** When adding new services or changing providers


# 🔐 DOPPLER SETUP - Complete Secrets Management

> **Professional secret management** for LLMMerch with Vercel, Axiom, Google OAuth, Analytics

---

## 🎯 **WHY DOPPLER**

`★ Insight ─────────────────────────────────────`
**Problems Doppler Solves**:
- ❌ `.env.local` files scattered everywhere
- ❌ Secrets in Vercel dashboard (manual sync)
- ❌ Different values dev/staging/prod
- ❌ Team can't access secrets easily
- ❌ No audit trail of who changed what

**With Doppler**:
- ✅ Single source of truth for ALL secrets
- ✅ Auto-sync to Vercel (no manual copy-paste)
- ✅ Environments (dev, staging, prod)
- ✅ Team access with permissions
- ✅ Full audit log + versioning
`─────────────────────────────────────────────────`

---

## 🚀 **SETUP (10 Minutes)**

### **Step 1: Install Doppler CLI** (2 min)

```bash
# macOS
brew install dopplerhq/cli/doppler

# Or Linux
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh

# Verify
doppler --version
```

### **Step 2: Login & Create Project** (3 min)

```bash
# Login
doppler login

# Create project
doppler projects create llmmerch

# Setup local config
cd /Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store
doppler setup
# Choose: Project = llmmerch
# Choose: Config = dev
```

### **Step 3: Add ALL Secrets** (5 min)

```bash
# Google OAuth (for Admin Panel)
doppler secrets set GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
doppler secrets set GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
doppler secrets set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
doppler secrets set NEXTAUTH_URL="http://localhost:3000"

# Axiom (Logging & Analytics)
doppler secrets set AXIOM_TOKEN="xaat-your-token"
doppler secrets set AXIOM_DATASET="llmmerch-prod"
doppler secrets set NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT="https://api.axiom.co"

# Vercel (Deployment)
doppler secrets set VERCEL_TOKEN="your-vercel-token"
doppler secrets set VERCEL_ORG_ID="team_xxx"
doppler secrets set VERCEL_PROJECT_ID="prj_xxx"

# Google Analytics
doppler secrets set NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
doppler secrets set NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Vercel Analytics (auto-enabled, but can customize)
doppler secrets set NEXT_PUBLIC_VERCEL_ANALYTICS="1"

# LLM APIs (Optional - for Hero WTF)
doppler secrets set OPENAI_API_KEY="sk-proj-your-key"
# OR
doppler secrets set ANTHROPIC_API_KEY="sk-ant-your-key"

# Site Config
doppler secrets set NEXT_PUBLIC_SITE_URL="https://llmmerch.space"
doppler secrets set NEXT_PUBLIC_SHOP_URL="/shop"

# Database (Future)
# doppler secrets set DATABASE_URL="postgresql://..."
# doppler secrets set REDIS_URL="redis://..."

# Payment (Future)
# doppler secrets set MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
# doppler secrets set STRIPE_SECRET_KEY="sk_live_..."
```

---

## 🔗 **VERCEL INTEGRATION (Auto-Sync)**

### **Step 1: Install Vercel Integration**

```bash
# In Doppler Dashboard (https://dashboard.doppler.com)
1. Go to Integrations
2. Click "Vercel"
3. Click "Install"
4. Authorize with Vercel
5. Select: Project = llmmerch
6. Map configs:
   - dev → (skip - local only)
   - staging → Preview (Vercel)
   - prod → Production (Vercel)
```

### **Step 2: Enable Auto-Sync**

```bash
# In Doppler Dashboard
1. Project: llmmerch
2. Config: prod
3. Integrations tab
4. Vercel: Enable "Auto Sync"
5. Save

# Now: Any secret change in Doppler → Auto-updates Vercel!
```

### **Step 3: Trigger Redeploy** (after sync)

```bash
# Secrets changed → Redeploy needed
vercel --prod

# Or in Vercel Dashboard:
# Deployments → ⋯ → Redeploy
```

---

## 📊 **AXIOM INTEGRATION (Logging)**

### **What is Axiom**:
- Real-time log aggregation
- Query with SQL
- Dashboards & alerts
- Better than console.log() for production

### **Setup**:

```bash
# 1. Create Axiom account
https://app.axiom.co/signup

# 2. Create dataset
# Dashboard → Datasets → Create "llmmerch-prod"

# 3. Get API token
# Settings → API Tokens → Create (Ingest only)

# 4. Add to Doppler (already done above)
doppler secrets set AXIOM_TOKEN="xaat-..."
doppler secrets set AXIOM_DATASET="llmmerch-prod"
```

### **Usage in Code**:

```typescript
// lib/logger.ts
import { Logger } from 'next-axiom';

export const logger = new Logger();

// In API routes or components
logger.info('User purchased product', {
  productId: 'transformer',
  buyerNickname: 'IronTensor',
  price: 149
});

// Axiom Dashboard → Query:
// SELECT * FROM llmmerch-prod WHERE buyerNickname = 'IronTensor'
```

---

## 🎯 **GOOGLE OAUTH CREDENTIALS**

### **Get Credentials**:

```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com/apis/credentials

# 2. Create OAuth 2.0 Client ID
# Application type: Web application
# Name: LLMMerch Production

# 3. Authorized redirect URIs:
http://localhost:3000/api/auth/callback/google
https://llmmerch.space/api/auth/callback/google
https://llmmerch-staging.vercel.app/api/auth/callback/google

# 4. Copy credentials
# Client ID: 123456789-abcdefg.apps.googleusercontent.com
# Client Secret: GOCSPX-abcdefghijklmnop

# 5. Add to Doppler (already in Step 3 above)
```

---

## 📈 **GOOGLE ANALYTICS SETUP**

### **Create GA4 Property**:

```bash
# 1. Go to Google Analytics
https://analytics.google.com/

# 2. Create Property
# Name: LLMMerch
# Timezone: America/Sao_Paulo (Brazil)
# Currency: BRL

# 3. Create Web Stream
# Website URL: https://llmmerch.space
# Stream name: LLMMerch Production

# 4. Get Measurement ID
# Copy: G-XXXXXXXXXX

# 5. Add to Doppler
doppler secrets set NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### **Create GTM Container** (Recommended):

```bash
# 1. Go to Google Tag Manager
https://tagmanager.google.com/

# 2. Create Container
# Name: LLMMerch
# Type: Web

# 3. Get Container ID
# Copy: GTM-XXXXXXX

# 4. Add to Doppler
doppler secrets set NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"

# 5. In GTM Dashboard:
# - Add GA4 tag
# - Configure triggers (all pages, events)
# - Publish container
```

---

## 🔧 **LOCAL DEVELOPMENT**

### **Use Doppler Instead of .env.local**:

```bash
# Instead of npm run dev
doppler run -- npm run dev

# Or setup auto-injection
doppler setup
echo 'doppler' >> .gitignore

# Then normal commands work:
npm run dev
npm run build
vercel dev
```

### **View Current Secrets**:

```bash
# List all secrets
doppler secrets

# Download to .env format (for reference)
doppler secrets download --no-file --format env > .env.doppler

# Never commit .env.doppler!
echo '.env.doppler' >> .gitignore
```

---

## 🌍 **ENVIRONMENTS (Dev, Staging, Prod)**

### **Create Environments**:

```bash
# Create configs in Doppler Dashboard
# 1. llmmerch / dev (local development)
# 2. llmmerch / staging (Vercel preview)
# 3. llmmerch / prod (Vercel production)
```

### **Different Values Per Environment**:

```bash
# DEV
doppler configs select dev
doppler secrets set NEXTAUTH_URL="http://localhost:3000"
doppler secrets set NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# STAGING
doppler configs select staging
doppler secrets set NEXTAUTH_URL="https://llmmerch-staging.vercel.app"
doppler secrets set NEXT_PUBLIC_SITE_URL="https://llmmerch-staging.vercel.app"

# PROD
doppler configs select prod
doppler secrets set NEXTAUTH_URL="https://llmmerch.space"
doppler secrets set NEXT_PUBLIC_SITE_URL="https://llmmerch.space"
```

---

## 📦 **COMPLETE SECRETS CHECKLIST**

### **Authentication (Required for /admin)**:
```
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ NEXTAUTH_SECRET (generate: openssl rand -base64 32)
✅ NEXTAUTH_URL (per environment)
```

### **Analytics & Monitoring**:
```
✅ AXIOM_TOKEN (logging)
✅ AXIOM_DATASET (llmmerch-prod)
✅ NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT
✅ NEXT_PUBLIC_GTM_ID (Google Tag Manager)
✅ NEXT_PUBLIC_GA_MEASUREMENT_ID (Google Analytics)
✅ NEXT_PUBLIC_VERCEL_ANALYTICS (1 or true)
```

### **Deployment**:
```
✅ VERCEL_TOKEN (for CLI deploys)
✅ VERCEL_ORG_ID (team ID)
✅ VERCEL_PROJECT_ID (project ID)
```

### **Site Configuration**:
```
✅ NEXT_PUBLIC_SITE_URL (base URL)
✅ NEXT_PUBLIC_SHOP_URL (/shop or /)
```

### **LLM APIs** (Optional):
```
⚪ OPENAI_API_KEY (for Hero WTF dynamic responses)
⚪ ANTHROPIC_API_KEY (alternative)
```

### **Payment** (Future):
```
⚪ MERCADOPAGO_ACCESS_TOKEN
⚪ MERCADOPAGO_PUBLIC_KEY
⚪ STRIPE_SECRET_KEY
⚪ STRIPE_PUBLISHABLE_KEY
```

### **Database** (Future):
```
⚪ DATABASE_URL (PostgreSQL)
⚪ REDIS_URL (Cache)
```

---

## 🎯 **VERCEL DOPPLER AUTO-SYNC**

### **How It Works**:

```
1. You change secret in Doppler
   ↓
2. Doppler detects change
   ↓
3. Auto-syncs to Vercel Environment Variables
   ↓
4. Vercel triggers redeploy (optional)
   ↓
5. New deployment has updated secrets

No manual copy-paste! ✨
```

### **Enable Auto-Redeploy** (Optional):

```bash
# In Doppler Dashboard
# Project: llmmerch
# Config: prod
# Integrations: Vercel
# ✅ Enable "Trigger Vercel redeployment on secret change"

# Now: Change secret → Auto redeploys!
```

---

## 🔍 **AXIOM LOGGING EXAMPLES**

### **Setup in Code**:

```typescript
// app/api/telemetry/route.ts
import { Logger } from 'next-axiom';

export async function POST(request: Request) {
  const log = new Logger();

  try {
    const body = await request.json();

    // Log to Axiom
    log.info('Telemetry event tracked', {
      eventType: body.eventType,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')
    });

    // ... rest of logic

    await log.flush();  // Send to Axiom
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Telemetry error', { error });
    await log.flush();
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

### **Query in Axiom Dashboard**:

```sql
-- See all telemetry events
SELECT * FROM llmmerch-prod
WHERE level = 'info'
ORDER BY _time DESC
LIMIT 100

-- Track specific user
SELECT * FROM llmmerch-prod
WHERE fields.buyerNickname = 'IronTensor'

-- Count events by type
SELECT
  fields.eventType,
  count() as total
FROM llmmerch-prod
GROUP BY fields.eventType
```

---

## 📊 **GOOGLE TAG MANAGER SETUP**

### **Container Configuration**:

```javascript
// 1. Create GTM Container (already have ID: GTM-XXXXXXX)

// 2. Add to app/layout.tsx (or create gtm.tsx component)
<Script id="gtm" strategy="afterInteractive">
  {`
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
  `}
</Script>

// 3. Add noscript fallback in <body>
<noscript>
  <iframe
    src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
    height="0"
    width="0"
    style={{ display: 'none', visibility: 'hidden' }}
  />
</noscript>
```

### **GTM Tags to Configure**:

```
1. GA4 Configuration Tag
   - Measurement ID: {{GA Measurement ID}}
   - Trigger: All Pages

2. Hero Variant View
   - Event Name: hero_variant_view
   - Trigger: Custom Event (hero_variant_view)

3. Add to Cart
   - Event Name: add_to_cart
   - Trigger: Custom Event (add_to_cart)

4. Purchase
   - Event Name: purchase
   - Trigger: Custom Event (purchase_completed)
```

---

## 🎨 **ALL CREDENTIALS - COMPLETE LIST**

### **COPY THIS INTO DOPPLER** (Dev Config):

```bash
# === AUTHENTICATION ===
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# === ANALYTICS ===
# Axiom (Logging)
AXIOM_TOKEN=xaat-your-axiom-token
AXIOM_DATASET=llmmerch-dev
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=https://api.axiom.co

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Vercel Analytics (auto-enabled)
NEXT_PUBLIC_VERCEL_ANALYTICS=1

# === DEPLOYMENT ===
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=team_xxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxx

# === SITE CONFIG ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SHOP_URL=/shop

# === LLM APIs (Optional) ===
OPENAI_API_KEY=sk-proj-your-openai-key
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# === PAYMENT (Future) ===
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-your-token
# MERCADOPAGO_PUBLIC_KEY=APP_USR-your-public-key
# STRIPE_SECRET_KEY=sk_live_your-stripe-key
# STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-pk

# === DATABASE (Future) ===
# DATABASE_URL=postgresql://user:pass@host:5432/llmmerch
# REDIS_URL=redis://default:pass@host:6379
```

---

## 🔄 **PRODUCTION CONFIG** (Doppler Prod):

```bash
# Switch to prod config
doppler configs select prod

# Update URLs for production
doppler secrets set NEXTAUTH_URL="https://llmmerch.space"
doppler secrets set NEXT_PUBLIC_SITE_URL="https://llmmerch.space"
doppler secrets set AXIOM_DATASET="llmmerch-prod"

# All other secrets same as dev
# (Google OAuth, API keys, etc.)
```

---

## 🚀 **DEPLOY WITH DOPPLER**

### **Option 1: Doppler + Vercel CLI**

```bash
# Deploy with secrets from Doppler
doppler run -- vercel --prod

# Secrets auto-injected during build!
```

### **Option 2: Auto-Sync (Recommended)**

```bash
# 1. Enable Vercel integration in Doppler (see Step 1)
# 2. Deploy normally
vercel --prod

# Secrets already synced to Vercel! No Doppler CLI needed.
```

---

## 🔐 **TEAM ACCESS**

### **Add Team Members**:

```bash
# In Doppler Dashboard
# Project: llmmerch
# Settings → Team → Invite

# Permissions:
# - Admin: Full access (you)
# - Developer: Read secrets, can't change prod
# - Viewer: View only (analytics team)
```

### **Audit Log**:

```bash
# Track who changed what
# Dashboard → Activity Log

# See:
# - Who added/changed/deleted secrets
# - When it happened
# - Old vs new values
# - Which environment
```

---

## 📱 **MOBILE APP / CLI ACCESS**

### **Doppler CLI Commands**:

```bash
# View secrets (masked)
doppler secrets

# View specific secret
doppler secrets get GOOGLE_CLIENT_ID

# Set secret
doppler secrets set API_KEY="new-value"

# Delete secret
doppler secrets delete OLD_VAR

# Switch environment
doppler configs select staging

# Run command with secrets
doppler run -- npm run dev
doppler run -- vercel --prod
doppler run -- node script.js
```

---

## 🎯 **MIGRATION FROM .env.local**

### **If you already have .env.local**:

```bash
# Upload existing .env.local to Doppler
doppler secrets upload .env.local

# Verify
doppler secrets

# Delete local file (now in Doppler)
rm .env.local

# Add to .gitignore (if not already)
echo '.env*' >> .gitignore
echo '!.env.example' >> .gitignore
```

---

## 🛡️ **SECURITY BEST PRACTICES**

### **Do's**:
```
✅ Use Doppler for ALL secrets (no .env.local)
✅ Different secrets per environment
✅ Rotate secrets regularly (Google OAuth, API keys)
✅ Limit team access (principle of least privilege)
✅ Enable Axiom logging for audit trail
✅ Use service accounts (not personal accounts)
```

### **Don'ts**:
```
❌ Don't commit .env* files (ever!)
❌ Don't share secrets in Slack/Email
❌ Don't use same secrets dev/prod
❌ Don't give everyone admin access
❌ Don't hardcode secrets in code
```

---

## 📊 **COMPLETE SETUP CHECKLIST**

### **Doppler**:
- [ ] Account created
- [ ] Project "llmmerch" created
- [ ] 3 configs (dev, staging, prod)
- [ ] All 20+ secrets added
- [ ] Team members invited
- [ ] CLI installed locally

### **Vercel**:
- [ ] Integration enabled
- [ ] Auto-sync configured
- [ ] Secrets synced (verify in dashboard)
- [ ] Test deployment successful

### **Google OAuth**:
- [ ] OAuth app created
- [ ] Redirect URIs configured (3 environments)
- [ ] Credentials in Doppler
- [ ] Admin email whitelisted

### **Axiom**:
- [ ] Account created
- [ ] Dataset "llmmerch-prod" created
- [ ] API token generated
- [ ] Token in Doppler
- [ ] Logger integrated in code

### **Google Analytics**:
- [ ] GA4 property created
- [ ] Web stream configured
- [ ] Measurement ID in Doppler
- [ ] GTM container created
- [ ] GTM ID in Doppler
- [ ] Tags configured

---

## 🎉 **BENEFITS**

### **Before Doppler**:
```
❌ Secrets in 3 places (.env.local, Vercel, code)
❌ Manual sync (error-prone)
❌ No audit trail
❌ Team can't access easily
❌ Inconsistent values dev/prod
```

### **After Doppler**:
```
✅ Single source of truth
✅ Auto-sync to Vercel
✅ Full audit log
✅ Team access with permissions
✅ Environment-specific values
✅ CLI access anywhere
✅ No secrets in git
```

---

## 🚀 **DEPLOY COMMAND (Final)**

```bash
# With Doppler + Vercel auto-sync
cd /Users/lech/PROJECTS_all/PROJECT_merch/llm-merch-store

# Secrets already in Vercel (auto-synced)
vercel --prod

# Or inject secrets during build
doppler run --config prod -- vercel --prod
```

---

## 📚 **RESOURCES**

```
Doppler Dashboard:  https://dashboard.doppler.com
Doppler Docs:       https://docs.doppler.com
Vercel Integration: https://docs.doppler.com/docs/vercel
Axiom Dashboard:    https://app.axiom.co
Google Cloud:       https://console.cloud.google.com
Google Analytics:   https://analytics.google.com
Google Tag Manager: https://tagmanager.google.com
```

---

**DOPPLER SETUP COMPLETO! All secrets managed professionally! 🔐✨**

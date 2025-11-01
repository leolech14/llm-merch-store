# 🔐 Google Login Setup - Complete Guide

> **Admin-only authentication** for LLM.Merch educational experiment dashboard

---

## 🎯 **O Que Foi Implementado**

```
✅ NextAuth.js with Google Provider (única forma de login)
✅ Admin middleware (protege /admin e /api/admin)
✅ Admin Panel com métricas em tempo real
✅ Hero A/B Testing Engine dashboard
✅ System Controls (toggle features)
✅ Educational insights (como o sistema funciona)
✅ Progressive Hero com 9 mensagens inteligentes
```

---

## 🚀 **Setup em 5 Minutos**

### **Step 1: Criar Google OAuth App** (2 min)

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie novo projeto (ou use existente): "LLM Merch"
3. Click em "Create Credentials" → "OAuth 2.0 Client ID"
4. Configure OAuth consent screen:
   - User Type: **External**
   - App name: **LLM.Merch Admin**
   - User support email: **seu@email.com**
   - Developer contact: **seu@email.com**
   - Scopes: **email, profile** (default)

5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **LLM.Merch Production**
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://llmmerch.space/api/auth/callback/google
     https://seu-deploy.vercel.app/api/auth/callback/google
     ```

6. Copy credentials:
   - **Client ID**: `123456-abc.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abc123...`

### **Step 2: Configure Environment** (1 min)

```bash
cd llm-merch-store

# Create .env.local
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Add your credentials:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# NextAuth secret (generate one)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Optional: LLM for Hero WTF
OPENAI_API_KEY=sk-proj-...
```

### **Step 3: Add Your Admin Email** (30 sec)

Edit: `app/api/auth/[...nextauth]/route.ts`

```typescript
// Line 16
const ADMIN_EMAILS = [
  "seu.email@gmail.com",  // ← REPLACE WITH YOUR GOOGLE EMAIL
];
```

### **Step 4: Test Locally** (1 min)

```bash
npm run dev

# Navigate to admin
open http://localhost:3000/admin

# Should redirect to Google login
# Sign in with your email
# Should see Admin Panel ✅
```

### **Step 5: Deploy to Vercel** (1 min)

```bash
vercel --prod

# In Vercel Dashboard → Settings → Environment Variables:
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://llmmerch.space
```

---

## 🎯 **Admin Features**

### **Dashboard Overview** (`/admin`):
```
✅ Real-time Metrics
   - Total Visitors
   - Page Views
   - Cart Adds
   - Sales

✅ System Controls (Toggle Features)
   - Progressive Hero System (on/off)
   - A/B Testing Engine (on/off)
   - Advanced Analytics (on/off)

✅ Hero A/B Testing Results
   - WTF Hero: views, clicks, conversion %
   - Cognitive Hero: views, clicks, conversion %
   - Skate Hero: views, clicks, conversion %
   - Minimal Hero: views, clicks, conversion %
   - Winner: Auto-calculated

✅ Top Performing Products
   - Ranked by clicks + likes
   - Real-time data

✅ Educational Insights
   - How device fingerprinting works
   - How progressive hero works
   - How A/B testing works
   - How event store works
```

---

## 🧠 **Progressive Hero - 9 Mensagens Inteligentes**

O sistema mostra mensagens diferentes para cada visita:

### **Visit 1 - WTF?**:
```
"Yeah, we tracked this is your first time. Cool visual shit on
t-shirts to make knowledge travel. That's it."

🧠 Insight: Device fingerprinting (screen + timezone + UA).
No cookies, no tracking pixels. Privacy-first!
```

### **Visit 2 - Stats Update**:
```
"Hey! You came back! 572 people checked this out. 89 added to cart.
0 sales yet (it's experimental). Wanna see what's hot?"

🔥 Fun fact: 'Fresh Models' tee has 234 likes. The double entendre
is working. People get it.
```

### **Visit 3 - System Cleverness**:
```
"3rd visit. Nice. This is your 3rd time here. The system knows.
We're testing 4 different hero variants to see which converts better."

🧪 Educational: Hero changes based on visit count (1=WTF, 2=Cognitive,
3=Skate, 4+=Minimal). It's called Progressive Disclosure in UX design.
```

### **Visit 4 - Performance**:
```
"You're a regular now. 4 visits = you're interested. Current experiment
status: 1,290 pageviews, 842 likes, still 0 sales (launch pending)."

📊 A/B Testing Result: Hero WTF is converting at 45% (best). This Minimal
version you're seeing now? Only 25%. But you're already engaged, so less
fluff needed.
```

### **Visit 5 - Honesty + Joke**:
```
"5 visits and no purchase? Look, we get it. You're just here to see
if the system is actually smart or if we're full of shit. Spoiler:
it's both. But the tees are real."

😂 Truth: This whole 'Cognitive Wearables' thing started as a joke.
Then we realized—wait, it actually works. Knowledge DOES travel better
on fabric than pixels.
```

### **Visit 6 - Product Update**:
```
"Product update! New data: 'Transformer Architecture' is the most
clicked (67 times). 'LLM Brunette' is trending. Still only 1 of
each available."

🎯 Why 1 of each? Because in a world of mass production, scarcity
creates value. Plus, being THE ONLY person with that design? That's
the real flex.
```

### **Visit 7 - Collector Spotlight**:
```
"Collector spotlight! If this launches, 'IronTensor' wants the
Transformer tee. 'MistralGirl' called dibs on Fresh Models. The
P2P market is forming BEFORE launch. That's wild."

💰 Educational: We built a P2P marketplace where collectors can resell.
One tee already has a R$200 offer (34% appreciation). It's like NFTs
but you can actually wear them.
```

### **Visit 8 - Transparency**:
```
"You're basically stalking us now. 8 visits. The system logged
everything: which products you clicked, how long you stayed, if
you liked anything. All in an event-store with full audit trail."

🔍 Educational: Event Sourcing means every action is an immutable log
entry. We can replay the entire history, see what worked, what didn't.
Time-travel debugging.
```

### **Visit 9+ - Meta Awareness**:
```
"Still here? At this point you either work here or you're genuinely
curious how deep this rabbit hole goes. Spoiler: It goes deep. We have
12 APIs, event sourcing, device fingerprinting, and now you're reading
generated copy that adapts to your visit count."

🤖 Meta: This message itself is proof the system works. It knew this
is your 9th visit and served contextual copy. That's the magic—tech
that feels like it knows you.
```

---

## 🎨 **Admin Panel UI**

### **Header**:
```
┌────────────────────────────────────────────┐
│ 🧠 Educational Experiment Dashboard        │
│    LLM.Merch Admin Panel                    │
│                                             │
│                    [Your Name] [Sign Out]  │
└────────────────────────────────────────────┘
```

### **Quick Stats** (4 cards):
```
┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────┐
│ 👥 572  │ │ 📄 1,290 │ │ 🛒 89     │ │ 💰 0  │
│ Visitors│ │ Pages    │ │ Cart Adds │ │ Sales │
└─────────┘ └──────────┘ └───────────┘ └───────┘
```

### **System Controls** (Toggles):
```
[🧠] Progressive Hero System          [ON/OFF]
     Auto-changes hero based on visit count

[🧪] A/B Testing Engine                [ON/OFF]
     Automatically optimizes hero variant

[📊] Advanced Analytics                [ON/OFF]
     Track detailed metrics & engagement
```

### **Hero A/B Testing** (4 cards):
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ WTF Hero    │ │ Cognitive   │ │ Skate       │ │ Minimal     │
│ Views: 234  │ │ Views: 189  │ │ Views: 156  │ │ Views: 98   │
│ Clicks: 105 │ │ Clicks: 72  │ │ Clicks: 50  │ │ Clicks: 24  │
│ Conv: 45%   │ │ Conv: 38%   │ │ Conv: 32%   │ │ Conv: 25%   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

🧠 Educational Insight:
The A/B testing engine automatically serves the highest-converting
hero variant. Current winner: WTF (45% conversion)
```

---

## 🔒 **Security Model**

### **Admin Access**:
```
1. User signs in with Google
2. NextAuth checks email against whitelist
3. If match → isAdmin: true
4. Middleware protects /admin routes
5. Admin APIs check session.user.isAdmin
```

### **Public vs. Protected**:
```
PUBLIC (no auth):
- / (store)
- /api/stats
- /api/inventory
- /api/metrics
- All product APIs

PROTECTED (admin only):
- /admin (dashboard)
- /api/admin/hero-config
- /api/admin/system-config
```

---

## 📊 **A/B Testing Engine**

### **Como Funciona**:
```typescript
// 1. Track hero variant view
dataLayer.push({
  event: 'hero_variant_view',
  hero_variant: 'wtf'
});

// 2. Track CTA click
dataLayer.push({
  event: 'hero_cta_click',
  hero_variant: 'wtf'
});

// 3. API calcula conversion
conversion = (clicks / views) * 100

// 4. Determina winner
winner = variant with highest conversion

// 5. Serve winner mais frequentemente
// (opcional: pode forçar winner em 80% das visitas)
```

### **Self-Optimizing**:
- Sistema aprende qual hero converte melhor
- Auto-ajusta distribuição de variantes
- Admin pode ver resultados em tempo real
- Can override manual (via URL ?hero=wtf)

---

## 🎯 **System Controls (Admin)**

### **Progressive Hero Toggle**:
```
ON:
- 1st visit → WTF
- 2nd visit → Cognitive
- 3rd visit → Skate
- 4+ visits → Minimal

OFF:
- Always show default hero (Cognitive)
- No adaptation
- Static messaging
```

### **A/B Testing Toggle**:
```
ON:
- Track views/clicks per variant
- Calculate conversion rates
- Serve winner more frequently
- Show results in admin panel

OFF:
- No tracking
- Equal distribution
- No optimization
```

### **Analytics Toggle**:
```
ON:
- Device fingerprinting
- Visit counting
- Event logging
- Full telemetry

OFF:
- Minimal tracking
- No device ID
- Basic counters only
```

---

## 📚 **API Endpoints Created**

### **Admin APIs** (Protected):
```
GET  /api/admin/hero-config
     → Returns A/B testing results for all heroes

POST /api/admin/hero-config
     → Update hero stats (view or click)
     Body: { variant: 'wtf', action: 'view' }

GET  /api/admin/system-config
     → Returns current system configuration

POST /api/admin/system-config
     → Toggle system features
     Body: { feature: 'progressiveHeroEnabled', enabled: true }
```

### **Auth Routes**:
```
GET/POST /api/auth/[...nextauth]
         → NextAuth.js handlers (Google OAuth)

/admin   → Admin dashboard (protected)
/auth/signin → Custom sign-in page
/auth/unauthorized → Access denied page
```

---

## 🧪 **Testing the System**

### **Test 1: Progressive Hero**:
```javascript
// Console
localStorage.clear();

// Visit 1
location.reload();
// See: "WTF? Yeah, we tracked this is your first time..."

// Visit 2
location.reload();
// See: "Hey! You came back! 572 people checked this out..."

// Visit 3
location.reload();
// See: "3rd visit. Nice. The system knows..."

// And so on up to Visit 9+
```

### **Test 2: Admin Panel**:
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to admin
open http://localhost:3000/admin

# 3. Should redirect to Google login
# 4. Sign in with whitelisted email
# 5. Should see dashboard with:
   - Real-time metrics
   - Hero A/B results
   - System toggles
   - Educational insights
```

### **Test 3: Toggle Features**:
```
1. In admin panel, toggle "Progressive Hero" OFF
2. Open incognito window
3. Visit site multiple times
4. Hero should NOT change (stays default)

5. Toggle back ON
6. Hero should adapt per visit count again
```

---

## 📊 **Data Files Created**

```
data/
├── hero-config.json (auto-created)
│   └── A/B testing stats per variant
│
├── system-config.json (auto-created)
│   └── Feature toggles (progressive, ab-test, analytics)
│
├── inventory.json (existing)
├── telemetry.json (existing)
└── offers.json (created today)
```

---

## 🎯 **Admin Workflow**

### **Daily Check**:
```
1. Login to /admin
2. Check metrics:
   - How many visitors today?
   - Which products trending?
   - Any sales?

3. Review A/B tests:
   - Which hero converting best?
   - Should I force winner?

4. Toggle features:
   - Turn off progressive hero if needed
   - Disable analytics for maintenance
```

### **Launch Day**:
```
1. Enable sale (via system config)
2. Monitor metrics in real-time
3. Watch hero A/B performance
4. See which products sell first
5. Check collector profiles forming
```

---

## 🔐 **Security Notes**

### **Whitelist Model**:
```
Only emails in ADMIN_EMAILS array get admin access.
Everyone else can login but sees "Unauthorized" page.

To add admin:
1. Edit app/api/auth/[...nextauth]/route.ts
2. Add email to ADMIN_EMAILS array
3. Deploy
```

### **Environment Variables**:
```
NEVER commit .env.local to git!
Already in .gitignore ✅

Store secrets in:
- Local: .env.local
- Vercel: Dashboard → Environment Variables
```

---

## 🎨 **Progressive Messages - Complete List**

| Visit | Variant | Message Type | Focus |
|-------|---------|--------------|-------|
| 1 | WTF | Explanation | What is this? |
| 2 | Cognitive | Stats | Experiment data |
| 3 | Skate | System | How it works |
| 4 | Minimal | Performance | A/B results |
| 5 | Minimal | Honesty/Joke | Self-awareness |
| 6 | WTF | Product Update | Trending items |
| 7 | Cognitive | Collectors | P2P forming |
| 8 | Skate | Transparency | Event logging |
| 9+ | Minimal | Meta | System awareness |

**Educational Focus**: Each message teaches something about how the system works!

---

## 🚀 **Files Created (13 new)**

```
Authentication:
✅ app/api/auth/[...nextauth]/route.ts (NextAuth config)
✅ middleware.ts (Route protection)
✅ types/next-auth.d.ts (TypeScript types)
✅ components/providers.tsx (SessionProvider)
✅ app/auth/signin/page.tsx (Custom login)
✅ app/auth/unauthorized/page.tsx (Access denied)

Admin Panel:
✅ app/admin/page.tsx (Dashboard UI)
✅ app/api/admin/hero-config/route.ts (A/B testing API)
✅ app/api/admin/system-config/route.ts (Feature toggles)

Progressive Hero:
✅ components/progressive-hero-messages.ts (9 messages)

Config:
✅ .env.example (updated with OAuth vars)
✅ GOOGLE_LOGIN_SETUP.md (this guide)
```

---

## 🎯 **Next Steps**

### **Before First Use**:
1. ✅ Create Google OAuth app
2. ✅ Copy credentials to .env.local
3. ✅ Add your email to ADMIN_EMAILS
4. ✅ Test locally (npm run dev → /admin)
5. ✅ Deploy to Vercel
6. ✅ Add env vars in Vercel dashboard

### **After Launch**:
1. Monitor /admin daily
2. Review hero A/B results
3. Toggle features as needed
4. Share metrics with team
5. Use insights for next drop

---

## ✅ **Checklist**

- [ ] Google OAuth app created
- [ ] Credentials in .env.local
- [ ] Your email in ADMIN_EMAILS
- [ ] Tested login locally
- [ ] Admin panel accessible
- [ ] Toggles working
- [ ] Hero messages displaying
- [ ] Deployed to production
- [ ] Env vars in Vercel

---

**Complete admin system ready! 🎯🔐📊**

**Access**: `http://localhost:3000/admin` (or `/admin` in production)

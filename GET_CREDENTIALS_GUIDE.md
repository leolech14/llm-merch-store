# 🔑 GET CREDENTIALS FOR TERMINAL AUTOMATION

**Goal:** Get credentials so I can execute everything from terminal
**What I need:** Vercel KV connection strings
**Time:** 10 minutes

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Create Vercel KV Database (3 min)**

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/lbl14/llm-merch-store/stores
   ```

2. **Click "Create Database"**

3. **Select "KV" (Redis icon)**

4. **Fill in details:**
   ```
   Database Name: llmmerch-kv
   Region: (Select closest to you - probably US East)
   ```

5. **Click "Create"**

6. **Wait 30 seconds** for database to provision

---

### **STEP 2: Connect to Project (1 min)**

1. **After database created, you'll see:**
   ```
   "Connect to Project"
   ```

2. **Select project:**
   ```
   llm-merch-store
   ```

3. **Click "Connect"**

4. **Vercel automatically adds environment variables!**

---

### **STEP 3: Get Connection Strings (2 min)**

1. **Go to database settings:**
   ```
   https://vercel.com/lbl14/stores/llmmerch-kv
   ```

2. **Click ".env.local" tab**

3. **You'll see something like:**
   ```bash
   KV_REST_API_URL="https://xxxx-xxxx.kv.vercel-storage.com"
   KV_REST_API_TOKEN="AbCdEfGh123456..."
   KV_URL="redis://default:AbCdEfGh123456...@xxxx.kv.vercel-storage.com"
   KV_REST_API_READ_ONLY_TOKEN="XyZ789..."
   ```

4. **Copy ALL of these values**

---

### **STEP 4: Give Me the Credentials (1 min)**

**Paste here in chat (or tell me to get from .env.local):**

```
I need:
- KV_REST_API_URL=...
- KV_REST_API_TOKEN=...
- KV_URL=...
```

**Or just say:** "Check .env.local - I added them"

And I'll read them from:
```bash
~/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/.env.local
```

---

### **STEP 5: I Execute Everything (10 min)**

**Once I have credentials, I will:**

```
✅ Install @vercel/kv package
✅ Migrate all 6 API routes:
   - offers → KV
   - inventory → KV
   - visitors → KV
   - telemetry → KV
   - hero-config → KV
   - system-config → KV
✅ Seed initial data from JSON files
✅ Test all endpoints
✅ Deploy to production
✅ Verify data persists
```

**Fully automated - you just watch!**

---

## 🎯 ALTERNATIVE: VERCEL CLI METHOD

**Even faster (if you have Vercel CLI):**

```bash
# 1. Create KV database via CLI:
vercel env pull
vercel integration add kv

# 2. Copy the .env.local values
cat .env.local | grep KV_

# 3. Paste them here or say "check .env.local"

# Done! I'll do the rest
```

---

## ⚡ SUPER QUICK METHOD

**If you're already logged into Vercel CLI:**

```bash
cd ~/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store

# Create KV database:
vercel integration add kv

# Pull environment variables:
vercel env pull .env.local

# Show me the KV credentials:
cat .env.local | grep KV_
```

**Then paste the KV_ values here, and I execute everything!**

---

## 📊 WHAT I'LL AUTOMATE

**Code Migration (6 routes):**
```typescript
// I'll change all routes from:
fs.writeFileSync() → kv.set()
fs.readFileSync() → kv.get()

// Routes to migrate:
1. app/api/offers/route.ts
2. app/api/inventory/route.ts
3. app/api/visitors/route.ts
4. app/api/telemetry/route.ts
5. app/api/admin/hero-config/route.ts
6. app/api/admin/system-config/route.ts
```

**Testing:**
```bash
# I'll test each endpoint:
curl POST /api/offers → verify saves to KV
curl GET /api/offers → verify reads from KV
curl POST /api/visitors → verify increments
etc.
```

**Deployment:**
```bash
# I'll deploy and verify:
vercel --prod
# Test production endpoints
# Confirm data persists across deployments
```

---

## ✅ WHAT YOU NEED TO DO

**ONLY 3 ACTIONS:**

1. **Create KV database** (click button in Vercel)
2. **Connect to project** (click connect)
3. **Give me credentials** (paste KV_ values OR say "check .env.local")

**That's it! I do everything else automatically.** 🚀

---

## 🎯 FASTEST PATH (2 min)

```bash
# Run this in YOUR terminal:
cd ~/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store
vercel integration add kv
vercel env pull .env.local
cat .env.local | grep KV_

# Copy the output and paste here
# OR just say "I added KV, check .env.local"
```

**Then I execute the full migration!**

---

## ⏰ TOTAL TIME

```
You: 2-3 minutes (create DB, give credentials)
Me: 10-15 minutes (automated migration)
Total: 12-18 minutes to production persistence
```

---

**Ready? Let me know when you have the KV credentials!** 🔑🚀

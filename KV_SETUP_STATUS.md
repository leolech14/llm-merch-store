# ⚠️ KV DATABASE SETUP - REQUIRES WEB DASHBOARD

**Issue:** Vercel KV creation requires web dashboard (no CLI command)
**Solution:** Quick 2-minute dashboard action, then I automate everything

---

## 🎯 WHAT I NEED FROM YOU (2 minutes)

**Open this link:**
```
https://vercel.com/lbl14/llm-merch-store/stores
```

**Do this:**
1. Click "Create Database"
2. Click "KV" (Redis icon)
3. Name: "llmmerch-kv"
4. Click "Create"
5. Click "Connect to llm-merch-store"
6. **Done!** (Vercel auto-adds env vars)

**That's it - 2 minutes, 5 clicks**

---

## ✅ WHAT I'LL DO AUTOMATICALLY (After you create KV)

```bash
# 1. Pull new KV credentials (already installed @vercel/kv)
vercel env pull .env.local

# 2. Migrate all 6 API routes:
- app/api/offers/route.ts
- app/api/inventory/route.ts
- app/api/visitors/route.ts
- app/api/telemetry/route.ts
- app/api/admin/hero-config/route.ts
- app/api/admin/system-config/route.ts

# 3. Replace all fs.writeFileSync → kv.set
# 4. Replace all fs.readFileSync → kv.get
# 5. Seed initial data from JSON files
# 6. Test endpoints locally
# 7. Deploy to production
# 8. Verify data persists

Time: 10-15 minutes FULLY AUTOMATED
```

---

## 📊 CURRENT STATUS

```
✅ @vercel/kv package: Installed
⏳ KV database: Needs creation (web dashboard)
⏳ Migration: Ready to execute (waiting for KV)
```

---

## 🚀 AFTER YOU CREATE KV

**Just say:** "KV CREATED"

**And I will:**
- Pull credentials automatically
- Migrate all code
- Deploy
- Test
- Done!

**No more manual steps for you after the initial creation!**

---

**2-minute action needed, then I take over completely.** 🎯

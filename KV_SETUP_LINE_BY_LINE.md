# 🔑 VERCEL KV SETUP - LINE BY LINE

**Total Time:** 2 minutes for you
**Then:** I automate everything else (15 min)

---

## 📍 STEP 1: OPEN VERCEL DASHBOARD

**Action:** Open this exact link in your browser:
```
https://vercel.com/lbl14/llm-merch-store/stores
```

**What you'll see:**
- Vercel dashboard
- "Storage" tab (or "Stores")
- Empty (no databases yet)

**Screenshot checkpoint:** Page says "Create your first database"

---

## 📍 STEP 2: CLICK "CREATE DATABASE"

**Action:** Click the button that says:
```
"Create Database" or "+ Create"
```

**What appears:**
- Modal/popup with database type options
- Icons for: KV, Postgres, Blob

**Screenshot checkpoint:** Popup showing database options

---

## 📍 STEP 3: SELECT "KV"

**Action:** Click the **"KV"** option

**Look for:**
- Icon: Redis logo (red/white square)
- Text: "KV" or "Redis"
- Description: "Key-Value storage"

**NOT:**
- ❌ Postgres (different icon)
- ❌ Blob (file storage)

**Screenshot checkpoint:** KV option highlighted/selected

---

## 📍 STEP 4: NAME THE DATABASE

**Action:** Enter this EXACT name:
```
llmmerch-kv
```

**Field:** "Database Name" or "Store Name"

**Region:** Select closest region (usually auto-selected)
- US East (recommended)
- Or whatever is default

**Screenshot checkpoint:** Name field shows "llmmerch-kv"

---

## 📍 STEP 5: CLICK "CREATE"

**Action:** Click the **"Create"** button

**What happens:**
- Vercel provisions database (~30 seconds)
- Progress bar or spinner
- Then shows "Database created!"

**Screenshot checkpoint:** Success message

---

## 📍 STEP 6: CONNECT TO PROJECT

**Action:** Click **"Connect to Project"**

**Then select:**
```
llm-merch-store
```

**From the dropdown/list**

**What happens:**
- Vercel auto-adds environment variables
- Shows: "Connected to llm-merch-store"

**Screenshot checkpoint:** Green checkmark, "Connected"

---

## 📍 STEP 7: VIEW CREDENTIALS (OPTIONAL)

**Action:** Click **".env.local"** tab

**What you'll see:**
```bash
KV_REST_API_URL="https://xxx-xxx.kv.vercel-storage.com"
KV_REST_API_TOKEN="Abc123..."
KV_URL="redis://default:..."
KV_REST_API_READ_ONLY_TOKEN="Xyz789..."
```

**You DON'T need to copy these!**
Vercel already added them to your project.

---

## ✅ STEP 8: TELL ME "KV CREATED"

**Action:** Come back to this chat and type:
```
KV CREATED
```

**Then I will:**
1. Pull credentials automatically (`vercel env pull`)
2. Install packages
3. Migrate all 6 API routes
4. Seed initial data
5. Test endpoints
6. Deploy to production
7. Verify persistence

**All automated - you just watch!**

---

## 🎯 QUICK RECAP

```
Step 1: Open https://vercel.com/lbl14/llm-merch-store/stores
Step 2: Click "Create Database"
Step 3: Select "KV"
Step 4: Name: "llmmerch-kv"
Step 5: Click "Create"
Step 6: Click "Connect to Project" → Select "llm-merch-store"
Step 7: (Optional) View credentials
Step 8: Tell me "KV CREATED"
```

**Total clicks:** ~5
**Total time:** ~2 minutes
**Then:** I automate everything else

---

## ⏰ TIMELINE

```
00:00 - You start Step 1
00:30 - You finish Step 6
02:00 - You say "KV CREATED"
02:01 - I start automated migration
17:00 - Production deployed with persistent storage
```

**Your effort:** 2 minutes
**My effort:** 15 minutes (automated)
**Result:** Production-ready data persistence

---

## 🚀 START NOW

**Open:** https://vercel.com/lbl14/llm-merch-store/stores

**Follow steps 1-8 above**

**Then say:** "KV CREATED"

**I'll take over from there!** ✅

# 🔐 Google OAuth Setup - AUTOMATED

**Project:** astute-buttress-340100 (My First Project)
**Date:** 2025-11-01

---

## ⚡ QUICK SETUP (5 MINUTES)

### Step 1: Open Google Cloud Console

**Direct link to credentials page:**
👉 https://console.cloud.google.com/apis/credentials?project=astute-buttress-340100

---

### Step 2: Enable APIs (if needed)

If prompted, enable these APIs:
- Google+ API
- Google Identity Services

---

### Step 3: Configure OAuth Consent Screen (FIRST TIME ONLY)

If you see "Configure Consent Screen", click it and:

1. **User Type:** External
2. **App Information:**
   - App name: `LLM Merch Store`
   - User support email: `leonardo.lech@gmail.com`
   - Developer contact: `leonardo.lech@gmail.com`
3. **Scopes:** Skip (click "Save and Continue")
4. **Test users:** Add both emails:
   - `leonardo.lech@gmail.com`
   - `leo@lbldomain.com`
5. Click "Save and Continue" → "Back to Dashboard"

---

### Step 4: Create OAuth 2.0 Client ID

Back at the Credentials page:

1. **Click "CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**

2. **Application type:** Web application

3. **Name:** `LLM Merch Store - Production`

4. **Authorized JavaScript origins** (click "+ ADD URI" for each):
   ```
   http://localhost:3000
   https://llmmerch.space
   https://llm-merch-store-7vekg7ulz-lbl14.vercel.app
   ```

5. **Authorized redirect URIs** (click "+ ADD URI" for each):
   ```
   http://localhost:3000/api/auth/callback/google
   https://llmmerch.space/api/auth/callback/google
   https://llm-merch-store-7vekg7ulz-lbl14.vercel.app/api/auth/callback/google
   ```

6. **Click "CREATE"**

---

### Step 5: Copy Credentials

A modal will appear with:
- **Your Client ID** (long string ending in .apps.googleusercontent.com)
- **Your Client Secret** (starts with GOCSPX-)

**COPY BOTH!**

---

### Step 6: Run Automated Setup Script

In your terminal:

```bash
cd /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store

./setup-oauth.sh "YOUR_CLIENT_ID" "YOUR_CLIENT_SECRET"
```

**Example:**
```bash
./setup-oauth.sh "123456-abc.apps.googleusercontent.com" "GOCSPX-xyz123"
```

---

## ✅ WHAT THE SCRIPT DOES

1. Creates `.env.local` with credentials
2. Generates secure `NEXTAUTH_SECRET`
3. Updates Vercel production environment
4. Deploys to production
5. Shows success message

**Total time:** ~30 seconds

---

## 🎯 AFTER SETUP

**Test Production:**
1. Visit: https://llmmerch.space/auth/signin
2. Click "Sign in with Google"
3. Login with: leonardo.lech@gmail.com or leo@lbldomain.com
4. Access: https://llmmerch.space/admin

**Test Local:**
```bash
npm run dev
# Visit: http://localhost:3000/auth/signin
```

---

## 📋 TROUBLESHOOTING

### "OAuth consent screen not configured"
- Go back to Step 3 and configure it first

### "Redirect URI mismatch"
- Make sure all 3 redirect URIs are added exactly as shown
- Check for typos or missing `/api/auth/callback/google`

### "Invalid client"
- Make sure you created a "Web application" type (not Desktop)
- Verify the Client ID and Secret were copied correctly

---

## 🔐 ADMIN WHITELIST

Only these emails can access `/admin`:
- leonardo.lech@gmail.com
- leo@lbldomain.com

To add more admins:
Edit `app/api/auth/[...nextauth]/route.ts` lines 12-15

---

**Ready? Open the link above and follow the steps!** 🚀

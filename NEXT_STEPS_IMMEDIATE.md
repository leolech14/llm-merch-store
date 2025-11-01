# ⚡ IMMEDIATE ACTION REQUIRED

**Current Status:** 72% production ready
**Blocking Issues:** 4 critical gaps
**Time to Production:** 6-8 hours of focused work

---

## 🚨 DO THESE 3 THINGS FIRST (Before accepting real payments)

### 1. Set Up Google OAuth Credentials (30 min)
**Why:** Authentication won't work without these

```bash
# 1. Go to Google Cloud Console
open https://console.cloud.google.com/apis/credentials

# 2. Create OAuth 2.0 Client ID
# - Authorized redirect URIs:
#   http://localhost:3000/api/auth/callback/google
#   https://llmmerch.space/api/auth/callback/google

# 3. Add to .env.local
echo "GOOGLE_CLIENT_ID=your_client_id_here" >> .env.local
echo "GOOGLE_CLIENT_SECRET=your_secret_here" >> .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "NEXTAUTH_URL=https://llmmerch.space" >> .env.local

# 4. Also add to Doppler dashboard
doppler secrets set GOOGLE_CLIENT_ID
doppler secrets set GOOGLE_CLIENT_SECRET
```

### 2. Implement Cart Persistence (3-4 hours)
**Why:** Users can't buy anything without this

**File to Create:** `/app/api/cart/route.ts`
```typescript
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  const { userId, items } = await request.json();
  
  // Save to Vercel KV
  await kv.set(`cart:${userId}`, items);
  
  return Response.json({ success: true });
}

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  const cart = await kv.get(`cart:${userId}`);
  return Response.json({ cart });
}
```

**File to Update:** `/context/CartContext.tsx`
- Add API call to persist cart
- Load cart from API on mount
- Sync localStorage ↔ KV store

### 3. Fix CORS Security (30 min)
**Why:** Currently vulnerable to attacks

**File to Update:** `/next.config.ts`
```typescript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://llmmerch.space' // ← Change from '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
        ],
      },
    ];
  },
};
```

---

## 📋 VERIFICATION CHECKLIST

After completing above:

- [ ] Can log in with Google
- [ ] Cart persists after page reload
- [ ] Cart survives browser close
- [ ] CORS only allows your domain
- [ ] No console errors in browser
- [ ] Build completes successfully
- [ ] Deployed to Vercel without errors

**Then:** Ready for beta testing with warning: "BETA - Report issues to support@llmmerch.space"

---

## 🚀 AFTER IMMEDIATE FIXES (Week 1)

1. **Add EBANX Webhook** (2-3 hrs)
   - Create `/app/api/webhook/pix-payment/route.ts`
   - Update inventory after payment
   - Create order record

2. **Add Rate Limiting** (1 hr)
   - Prevent API abuse
   - Use Vercel Edge Config or Upstash

3. **Add Error Boundaries** (1 hr)
   - Prevent full app crashes
   - Show friendly error messages

**Total:** ~7-9 hours to production-ready

---

## 📚 REFERENCE DOCS

- **PROVIDERS_REGISTRY.md** - All service credentials
- **STRUCTURE_ANALYSIS_SUMMARY.txt** - Quick overview
- **CLEANUP_CHECKLIST.md** - Optional improvements

**Questions?** All documentation is in project root.

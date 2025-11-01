# PIX Payment Integration - Troubleshooting Guide

## Quick Diagnosis

### Error Message
```
The payment method type 'pix' is invalid. Please ensure the provided type is activated in your dashboard
```

### Root Cause
Your Stripe account does **NOT** have the `pix_payments` capability enabled.

---

## Diagnostic Steps

### Step 1: Check PIX Capability Status

**Option A: Via API (Recommended)**

Call the new diagnostic endpoint:
```bash
curl http://localhost:3000/api/check-pix-capability
```

Expected successful response:
```json
{
  "success": true,
  "accountConfigured": true,
  "accountId": "acct_xxxxx",
  "pixPaymentCapability": {
    "status": "active",
    "requested": true
  },
  "canCreatePixPayments": true,
  "accountDetails": {
    "country": "US",
    "type": "standard"
  }
}
```

If PIX is NOT enabled, you'll see:
```json
{
  "success": true,
  "canCreatePixPayments": false,
  "warning": "PIX payments are not enabled for this account",
  "currentStatus": "unrequested",
  "nextSteps": [...]
}
```

**Option B: Via Stripe CLI**

```bash
# Install if needed: brew install stripe/stripe-cli/stripe
stripe accounts retrieve

# Look for this in the output:
# "pix_payments": {
#   "status": "active" or "pending" or "inactive" or "unrequested",
#   "requested": true or false
# }
```

**Option C: Via Stripe Dashboard**

1. Go to https://dashboard.stripe.com
2. Click **Settings** (gear icon, top right)
3. Click **Payment methods** on the left menu
4. Search for "Pix"
5. Check the status

---

## Solution: Enable PIX Capability

### Method 1: Stripe Dashboard (Easiest - 2 minutes)

1. **Open Dashboard**: https://dashboard.stripe.com
2. **Navigate**: Settings > Payment methods
3. **Find**: "Pix" in the payment methods list
4. **Click**: "Activate" or "Request" button
5. **Verify**: Wait for confirmation (usually immediate or 24-48 hours)
6. **Test**: Call `/api/check-pix-capability` again to confirm

### Method 2: Stripe CLI (If you prefer CLI)

```bash
# Requires Stripe CLI installed
stripe login

# Request PIX capability
stripe account request pix_payments

# Verify it was requested
stripe accounts retrieve
```

### Method 3: API Endpoint (Programmatic)

We've created an endpoint for this:

```bash
# Request PIX capability via API
curl -X POST http://localhost:3000/api/enable-pix-capability

# Response will show status and next steps
```

### Method 4: cURL Direct to Stripe API

```bash
curl https://api.stripe.com/v1/account/capabilities/pix_payments \
  -X POST \
  -u sk_test_YOUR_KEY_HERE: \
  -d "requested=true"

# Response includes current capability status
```

---

## Verification: PIX is Working

### Step 1: Confirm Capability is Active

```bash
curl http://localhost:3000/api/check-pix-capability
# Should show: "canCreatePixPayments": true
```

### Step 2: Test Creating a PIX Payment

```bash
curl -X POST http://localhost:3000/api/create-pix-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29.99,
    "productId": "test-merch",
    "productName": "Test Product"
  }'
```

**Expected successful response:**
```json
{
  "success": true,
  "paymentIntentId": "pi_xxxxx",
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "pixCode": "00020126...",
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/...",
  "expiresAt": 1234567890,
  "amount": 29.99
}
```

### Step 3: Test QR Code

1. Open the `qrCodeUrl` in a browser
2. You should see a QR code image
3. Scan with PIX-enabled banking app to verify

### Step 4: Check Payment Status

```bash
curl -X POST http://localhost:3000/api/check-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId": "pi_xxxxx"}'
```

---

## Timeline: When Will PIX Work?

| Step | Timeline | Status |
|------|----------|--------|
| Request capability via Dashboard | Immediate | Usually auto-approved |
| Request capability via API | 24-48 hours | Manual review |
| Full activation for payments | Varies | Usually with approval |
| Test API endpoint | Immediate after activation | Check status endpoint |
| Accept real payments | Immediate after activation | Full integration ready |

---

## Troubleshooting Common Issues

### Issue 1: "Pix" Not Visible in Payment Methods List

**Causes:**
- Your account is in an unsupported region
- Your account type doesn't support PIX
- Your Stripe plan doesn't support PIX

**Solutions:**
- For **US accounts**: PIX is in public preview; request manually
- For **Brazil accounts**: Should be available; contact Stripe Support
- For **Other regions**: Contact Stripe Support about availability

### Issue 2: Status Shows "pending" or "inactive"

**What it means:**
- Stripe is reviewing your request
- Additional verification may be needed

**What to do:**
1. Check your email for messages from Stripe
2. Check Dashboard > Settings > Payment methods > Pix
3. Complete any verification steps requested
4. Wait 24-48 hours for automatic approval

### Issue 3: "Payment method type 'pix' is invalid" Still Shows After Enabling

**Causes:**
- Cache issue (API credentials cached before enabling)
- API version mismatch
- Capability just enabled and still propagating

**Solutions:**
1. Clear any API caches (restart your server)
2. Verify API version is `2024-11-20.acacia`
3. Run `/api/check-pix-capability` to confirm
4. Wait 5 minutes and try again
5. Check Stripe Dashboard directly for confirmation

### Issue 4: "Account ID not found" Error

**Cause:**
- Invalid or test key being used with wrong account

**Solutions:**
- Verify `STRIPE_SECRET_KEY` is correct
- Ensure it's for the same Stripe account
- Confirm it's not a restricted/limited API key

---

## Code Configuration Review

### Current Setup (Correct)

**File**: `app/api/create-pix-payment/route.ts`

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia' as any,  // ✓ Correct version
});

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'brl',  // ✓ Correct currency for PIX
  payment_method_types: ['pix'],  // ✓ Correct payment method
  payment_method_options: {
    pix: {
      expires_after_seconds: 600,  // ✓ 10 minute expiry
    },
  },
});
```

### Environment Variables

Required in Vercel (or `.env.local` for development):

```env
# Required
STRIPE_SECRET_KEY=sk_test_xxxxx_or_sk_live_xxxxx
NEXT_PUBLIC_URL=https://yourdomain.com

# Optional
USE_DEMO_PIX=false  # Set to true to always use demo mode (for testing UX)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx_or_pk_live_xxxxx
```

---

## Demo Mode

The `/api/create-pix-payment` endpoint has a built-in demo mode:

```typescript
const demoMode = !process.env.STRIPE_SECRET_KEY || process.env.USE_DEMO_PIX === 'true';
```

When in demo mode:
- Returns fake but valid-looking PIX codes
- Generates QR codes via external service
- Perfect for testing UI/UX before PIX is enabled

**To enable demo mode:**
```env
USE_DEMO_PIX=true
# or simply don't set STRIPE_SECRET_KEY
```

---

## New API Endpoints

### 1. Check PIX Capability
```
GET /api/check-pix-capability

Response:
{
  "canCreatePixPayments": boolean,
  "pixPaymentCapability": { status, requested },
  "nextSteps": [...] (if not enabled),
  "accountDetails": { country, type, created }
}
```

### 2. Enable PIX Capability (Programmatically)
```
POST /api/enable-pix-capability

Response:
{
  "success": boolean,
  "capability": { status, requested },
  "timeline": { automatic, note },
  "nextSteps": [...]
}
```

### 3. Create PIX Payment (Existing)
```
POST /api/create-pix-payment
Body: { amount, productId, productName }

Response:
{
  "pixCode": "string",
  "qrCodeUrl": "string",
  "expiresAt": number,
  "paymentIntentId": "string"
}
```

---

## Additional Resources

- **Stripe PIX Docs**: https://docs.stripe.com/payments/pix
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Account Capabilities**: https://docs.stripe.com/api/accounts/object#account_object-capabilities
- **Payment Intents API**: https://docs.stripe.com/api/payment_intents

---

## Support & Contact

If PIX still doesn't work after following these steps:

1. **Check**: Stripe Dashboard for any error messages
2. **Verify**: API key is correct and has proper permissions
3. **Confirm**: Account is eligible for PIX (regional/business restrictions)
4. **Contact**: [Stripe Support](https://support.stripe.com/) with:
   - Account ID (acct_xxxx)
   - Account country
   - Error message you're seeing
   - API version you're using (2024-11-20.acacia)

---

## Summary

| Item | Status | Notes |
|------|--------|-------|
| API Version | ✓ Correct | 2024-11-20.acacia |
| Stripe SDK | ✓ Correct | v19.2.0 |
| Code Implementation | ✓ Correct | Properly configured |
| **PIX Capability** | ✗ **NOT ENABLED** | **Action Required** |

**Action**: Follow "Enable PIX Capability" section above to activate on your account.

# EBANX Webhook Setup Guide

## Quick Start

The webhook handler is now live at: `/api/webhook/pix-payment`

### 1. Configure EBANX Webhook

#### Sandbox Setup
1. Log in to EBANX Sandbox Dashboard
2. Navigate to: Account Settings > Webhooks
3. Add webhook endpoint:
   - **URL**: `https://your-domain.com/api/webhook/pix-payment`
   - **Event**: Payment Status Change (or similar)
   - **Status Filter**: Confirmed (CO)

#### Production Setup
Same as sandbox, but use your production domain.

### 2. How It Works

```
Payment Flow Diagram
====================

BEFORE (Frontend Polling - Inefficient)
┌─────────┐         ┌──────────────┐         ┌──────────┐
│ Browser │ ◄────►  │ PIX Payment  │         │ Inventory│
│ (polling)│ Poll   │ Status Route  │ ◄─────► │  (JSON) │
└─────────┘ every   └──────────────┘ Check   └──────────┘
              2sec      status

Problem: Continuous polling, delays, server load

AFTER (Webhook - Instant)
┌─────────┐         ┌──────────────┐         ┌──────────┐
│ Browser │ ─────► │ Webhook Route│ ◄──────│ EBANX    │
│ (one    │ Check  │ (instant)    │ POST   │ Payment  │
│ request)│ once   └──────────────┘ Status │ Gateway  │
└─────────┘        │     Inventory│ Change└──────────┘
                   │ Update (lock)│
                   │ Log order    │
                   └──────────────┘

Benefit: No polling, instant confirmation, minimal load
```

### 3. Payment Confirmation Flow

```
1. Customer scans PIX QR Code
   ↓
2. Customer confirms payment in their bank app
   ↓
3. Bank processes payment (typically < 1 second)
   ↓
4. EBANX receives confirmation from bank
   ↓
5. EBANX sends POST to your webhook with status "CO"
   ↓
6. Webhook handler:
   a. Validates payload
   b. Extracts product ID from merchant_payment_code
   c. Updates /data/inventory.json (atomic with locking)
   d. Logs order to /data/orders.json
   e. Returns 200 OK
   ↓
7. Frontend can check status (now fast since inventory is updated)
   ↓
8. Customer receives confirmation
```

## Request/Response Examples

### EBANX Sends Payment Confirmation Webhook

```http
POST /api/webhook/pix-payment HTTP/1.1
Host: your-domain.com
Content-Type: application/json

{
  "merchant_payment_code": "ask-anything-chest-1635000000000",
  "status": "CO",
  "hash": "c8a3b5d7e9f2a4c6e8f0b2d4f6a8c0e2",
  "amount_total": 89.90,
  "currency_code": "BRL",
  "payment_type_code": "pix",
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

### Webhook Handler Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "orderId": "order-c8a3b5d7-1635000000000",
  "message": "Payment processed and inventory updated"
}
```

## Data Changes After Webhook

### Inventory Before
```json
{
  "products": {
    "ask-anything-chest": {
      "name": "Ask Anything Tee",
      "stock": 1,
      "sold": false
    }
  },
  "lastUpdated": "2025-10-30T20:50:00.000Z"
}
```

### Inventory After
```json
{
  "products": {
    "ask-anything-chest": {
      "name": "Ask Anything Tee",
      "stock": 0,
      "sold": true
    }
  },
  "lastUpdated": "2025-11-01T12:00:00.000Z"
}
```

### Orders File (Created if doesn't exist)
```json
[
  {
    "orderId": "order-c8a3b5d7-1635000000000",
    "productId": "ask-anything-chest",
    "amount": 89.90,
    "paymentHash": "c8a3b5d7e9f2a4c6e8f0b2d4f6a8c0e2",
    "timestamp": "2025-11-01T12:00:00.000Z",
    "status": "CONFIRMED",
    "merchantPaymentCode": "ask-anything-chest-1635000000000"
  }
]
```

## Testing the Webhook

### Test 1: Successful Payment
```bash
curl -X POST http://localhost:3000/api/webhook/pix-payment \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_payment_code": "ask-anything-chest-'$(date +%s)'",
    "status": "CO",
    "hash": "test-hash-123456789abcdef",
    "amount_total": 89.90,
    "currency_code": "BRL"
  }'

# Expected response:
# {"status":"success","orderId":"order-test-hash-12-..."}
```

### Test 2: Pending Payment (Should be ignored)
```bash
curl -X POST http://localhost:3000/api/webhook/pix-payment \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_payment_code": "ask-anything-chest-'$(date +%s)'",
    "status": "PE",
    "hash": "test-pending-123456789abcdef",
    "amount_total": 89.90,
    "currency_code": "BRL"
  }'

# Expected response:
# {"status":"acknowledged","message":"Non-confirmed payment status"}
```

### Test 3: Invalid Product ID
```bash
curl -X POST http://localhost:3000/api/webhook/pix-payment \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_payment_code": "invalid-product-'$(date +%s)'",
    "status": "CO",
    "hash": "test-invalid-123456789abcdef",
    "amount_total": 89.90,
    "currency_code": "BRL"
  }'

# Expected response:
# {"status":"acknowledged","message":"Webhook received but processing encountered an error","error":"Product not found: invalid-product"}
```

### Test 4: Malformed JSON (Should still return 200)
```bash
curl -X POST http://localhost:3000/api/webhook/pix-payment \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# Expected response:
# {"status":"ignored","reason":"Invalid payload format"}
```

## Checking Results

### View Inventory Changes
```bash
cat /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/data/inventory.json | jq '.products["ask-anything-chest"]'
```

### View Order Log
```bash
cat /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/data/orders.json | jq '.'
```

### View Server Logs
```bash
# When running locally: npm run dev
# Look for lines starting with [webhook-*]

[webhook-1635000000-abc123] Received EBANX webhook request
[webhook-1635000000-abc123] Webhook details: {...}
[webhook-1635000000-abc123] Inventory updated for product: ask-anything-chest
[webhook-1635000000-abc123] Transaction logged: order-c8a3b5d7-1635000000000
```

## Troubleshooting

### Webhook Not Being Called
1. Verify URL in EBANX dashboard is correct
2. Check firewall/SSL issues
3. Verify webhook is enabled in EBANX settings
4. Test with curl to ensure endpoint is reachable

### Inventory Not Updating
1. Check server logs for error messages
2. Verify product ID matches inventory.json
3. Check file permissions on /data directory
4. Verify JSON format is valid

### Lock Timeout Errors
1. Indicates high concurrency
2. Check if multiple webhooks arriving simultaneously
3. Monitor /data directory for stale .lock files
4. Consider upgrading to database

### Wrong Amount/Status
1. Verify EBANX webhook payload matches expected format
2. Check if filtering/transforming in middleware
3. Confirm webhook is not being rate-limited (it's excluded)

## Monitoring Webhook Activity

### Real-time Log Monitoring
```bash
# Run development server
npm run dev

# In another terminal, watch for webhook logs
tail -f /path/to/your/logs | grep webhook
```

### Verify Payment Processing
```bash
# Check if orders are being logged
ls -la /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/data/orders.json

# Count total orders
jq 'length' /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/data/orders.json

# View latest orders
jq '.[(-3):]' /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store/data/orders.json
```

## Migration from Polling

### Updating Frontend Code

**Before (Polling)**
```typescript
async function checkPaymentStatus(paymentHash: string) {
  const response = await fetch(`/api/pix-payment-status?hash=${paymentHash}`);
  const data = await response.json();

  if (data.status === 'paid') {
    // Payment confirmed
  }
}

// Poll every 2 seconds
setInterval(() => checkPaymentStatus(hash), 2000);
```

**After (No Polling Needed)**
```typescript
// Frontend can check status once after a delay
// Webhook will have updated inventory by then
async function checkPaymentStatus(paymentHash: string) {
  const response = await fetch(`/api/pix-payment-status?hash=${paymentHash}`);
  const data = await response.json();

  // Status is updated immediately via webhook
  // No need for polling
}

// Check once after reasonable delay (5-10 seconds)
setTimeout(() => checkPaymentStatus(hash), 5000);
```

## Production Considerations

### Security
- Add HMAC signature verification if EBANX provides it
- Validate webhook IP addresses
- Consider webhook secret in environment variables

### Reliability
- Consider event queue (Redis) for failed webhooks
- Add retry logic for transient failures
- Implement dead letter queue for investigation

### Scalability
- Move from JSON files to database for better concurrency
- Implement proper transaction logging
- Add metrics/monitoring

### Compliance
- Maintain audit trail of all transactions
- Log all webhook calls (success and failures)
- Implement proper error recovery
- Regular backups of order data

## Files Modified/Created

### Created
- `/app/api/webhook/pix-payment/route.ts` - Webhook handler
- `WEBHOOK_INTEGRATION.md` - Technical documentation
- `WEBHOOK_SETUP_GUIDE.md` - This file

### Modified
- `/middleware.ts` - Excluded webhook routes from rate limiting/auth

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Review the technical documentation in WEBHOOK_INTEGRATION.md
3. Test with curl command examples above
4. Verify EBANX webhook configuration
5. Check that /data/inventory.json and /data/orders.json are accessible

# EBANX Webhook Integration Guide

## Overview
This document describes the webhook handler for EBANX payment confirmations, eliminating the need for frontend polling.

## Endpoint
- **URL**: `/api/webhook/pix-payment`
- **Method**: POST
- **Authentication**: None (server-to-server)
- **Rate Limiting**: Not applied (excluded from middleware)

## Webhook Flow

### 1. EBANX Sends Payment Confirmation
EBANX will POST to your webhook endpoint with the following payload:

```json
{
  "merchant_payment_code": "ask-anything-chest-1635000000",
  "status": "CO",
  "hash": "abc123def456",
  "amount_total": 89.90,
  "currency_code": "BRL",
  "payment_type_code": "pix"
}
```

### 2. Payment Status Codes
- `CO` - **Confirmed** (payment processed successfully)
- `PE` - **Pending** (payment awaiting confirmation)
- `CA` - **Cancelled** (payment cancelled)

Only `CO` status triggers inventory updates.

### 3. Handler Processing
When a confirmed payment webhook is received:

1. **Parse & Validate**: Validates EBANX payload structure
2. **Extract Product ID**: Parses `merchant_payment_code` format (`productId-timestamp`)
3. **Update Inventory**:
   - Decrements product stock in `/data/inventory.json`
   - Marks product as sold when stock reaches 0
4. **Log Transaction**:
   - Appends order record to `/data/orders.json`
   - Records: orderId, productId, amount, paymentHash, timestamp, status

## Concurrency Safety

The handler uses **file-based locking** to safely handle concurrent requests:

```typescript
// Lock mechanism prevents race conditions
await withFileLock<Inventory>(
  inventoryPath,
  async (inventory) => {
    // Safe read-modify-write operation
    inventory.products[productId].stock -= 1;
    return inventory;
  }
);
```

Features:
- Atomic lock file creation (`wx` flag)
- 10 retry attempts with 100ms backoff
- Automatic lock cleanup
- Falls back to initial data if file doesn't exist

## Response Behavior

All responses return **HTTP 200 OK**, following webhook best practices:

```typescript
// Success
{ "status": "success", "orderId": "order-abc123-1635000000" }

// Non-confirmed status
{ "status": "acknowledged", "message": "Non-confirmed payment status" }

// Invalid payload
{ "status": "ignored", "reason": "Invalid payload format" }

// Processing error
{
  "status": "acknowledged",
  "message": "Webhook received but processing encountered an error",
  "error": "Product not found: invalid-id"
}
```

Always returns 200 to prevent EBANX retry loops on processing errors.

## Data Structures

### Inventory File (`/data/inventory.json`)
```json
{
  "products": {
    "ask-anything-chest": {
      "name": "Ask Anything Tee",
      "stock": 1,
      "sold": false
    }
  },
  "lastUpdated": "2025-11-01T12:00:00.000Z"
}
```

### Orders File (`/data/orders.json`)
```json
[
  {
    "orderId": "order-abc123-1635000000",
    "productId": "ask-anything-chest",
    "amount": 89.90,
    "paymentHash": "abc123def456",
    "timestamp": "2025-11-01T12:00:00.000Z",
    "status": "CONFIRMED",
    "merchantPaymentCode": "ask-anything-chest-1635000000"
  }
]
```

## Error Handling

The handler catches and logs errors at multiple levels:

1. **Parsing errors**: Invalid JSON or missing required fields
2. **Product not found**: Product ID doesn't exist in inventory
3. **File I/O errors**: Lock acquisition timeouts or write failures

All errors log with a unique request ID for debugging:
```
[webhook-1635000000-abc123] Error processing payment: Product not found: invalid-id
```

## Configuration

### Required Environment Variables
- None (no API keys needed for webhook reception)

### Optional Enhancements
For production use, consider adding:
- HMAC signature verification (if EBANX provides)
- Webhook secret validation
- Event queuing for resilience
- Database instead of JSON files

## Testing

Test with curl:
```bash
curl -X POST http://localhost:3000/api/webhook/pix-payment \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_payment_code": "ask-anything-chest-'$(date +%s)'",
    "status": "CO",
    "hash": "test-hash-'$(date +%s%N | sha256sum | cut -c1-16)'",
    "amount_total": 89.90,
    "currency_code": "BRL"
  }'
```

## Monitoring

Check server logs for webhook activity:
```
[webhook-1635000000-abc123] Received EBANX webhook request
[webhook-1635000000-abc123] Webhook details: {"merchantPaymentCode":"ask-anything-chest-1635000000","status":"CO","amount":89.9,"hash":"abc123..."}
[webhook-1635000000-abc123] Inventory updated for product: ask-anything-chest
[webhook-1635000000-abc123] Transaction logged: order-abc123-1635000000
```

## Implementation Files

- **Webhook Handler**: `/app/api/webhook/pix-payment/route.ts` (300 lines)
- **Middleware Config**: `/middleware.ts` (updated to exclude webhooks)

## Migration from Polling

### Before (Frontend Polling)
```javascript
// Inefficient - client had to poll continuously
setInterval(() => checkPaymentStatus(paymentHash), 2000);
```

### After (Webhook)
```bash
# EBANX automatically calls when payment confirms
POST /api/webhook/pix-payment
```

Benefits:
- No polling overhead
- Instant confirmation
- Reduces server load
- More reliable

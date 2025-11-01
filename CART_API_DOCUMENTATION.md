# Cart Persistence API Documentation

## Overview

The Cart API provides persistent storage for shopping carts using Vercel KV. Each user's cart is stored with a 7-day TTL, allowing shoppers to maintain their selections across sessions.

**Endpoint:** `/api/cart`

**Storage Backend:** Vercel KV (Redis-compatible)

---

## Key Features

- Type-safe cart operations with TypeScript
- Automatic 7-day expiration (TTL)
- Flexible userId input (query param or header)
- Comprehensive error handling
- CORS support for cross-origin requests
- JSON validation for all requests

---

## API Endpoints

### GET - Retrieve Cart

Fetch cart items for a specific user.

**Request:**

```bash
GET /api/cart?userId=user123
# OR
GET /api/cart
Header: X-User-ID: user123
```

**Query Parameters:**
- `userId` (optional): User identifier (fallback if header not provided)

**Headers:**
- `X-User-ID` (optional): User identifier (takes priority over query param)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "items": [
      {
        "id": "backprop-blue",
        "name": "Back-Propagation (Blue)",
        "stock": 1,
        "sold": false,
        "soldPrice": 149,
        "quantity": 2
      }
    ],
    "totalItems": 1,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:30:00.000Z"
  }
}
```

**Empty Cart Response (200):**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "items": [],
    "totalItems": 0,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Missing userId parameter or X-User-ID header",
  "status": 400
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Failed to retrieve cart",
  "status": 500
}
```

---

### POST - Save Cart

Save or update cart items for a user.

**Request:**

```bash
POST /api/cart
Content-Type: application/json

{
  "userId": "user123",
  "items": [
    {
      "id": "backprop-blue",
      "name": "Back-Propagation (Blue)",
      "stock": 1,
      "sold": false,
      "soldPrice": 149,
      "quantity": 2
    },
    {
      "id": "transformer",
      "name": "Transformer Architecture Tee",
      "stock": 1,
      "sold": false,
      "soldPrice": 149,
      "quantity": 1
    }
  ]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Unique user identifier |
| `items` | CartItem[] | Yes | Array of cart items |

**CartItem Structure:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Product identifier |
| `name` | string | Yes | Product name |
| `stock` | number | Yes | Available stock |
| `sold` | boolean | Yes | Sold status |
| `soldPrice` | number | No | Sale price |
| `collectorNickname` | string | No | Collector info |
| `soldAt` | string | No | Timestamp when sold |
| `quantity` | number | No | Quantity in cart |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "items": [
      {
        "id": "backprop-blue",
        "name": "Back-Propagation (Blue)",
        "stock": 1,
        "sold": false,
        "soldPrice": 149,
        "quantity": 2
      }
    ],
    "totalItems": 1,
    "createdAt": "2025-11-01T10:30:00.000Z",
    "updatedAt": "2025-11-01T10:30:00.000Z"
  }
}
```

**Error Response - Missing userId (400):**

```json
{
  "success": false,
  "error": "Invalid or missing userId in request body",
  "status": 400
}
```

**Error Response - Invalid items (400):**

```json
{
  "success": false,
  "error": "Items must be an array",
  "status": 400
}
```

**Error Response - Missing item fields (400):**

```json
{
  "success": false,
  "error": "Each cart item must have id and name",
  "status": 400
}
```

**Error Response - Invalid JSON (400):**

```json
{
  "success": false,
  "error": "Invalid JSON in request body",
  "status": 400
}
```

**Error Response - Server Error (500):**

```json
{
  "success": false,
  "error": "Failed to save cart",
  "status": 500
}
```

---

### DELETE - Clear Cart

Remove a user's cart from storage.

**Request:**

```bash
DELETE /api/cart?userId=user123
# OR
DELETE /api/cart
Header: X-User-ID: user123
```

**Query Parameters:**
- `userId` (optional): User identifier (fallback if header not provided)

**Headers:**
- `X-User-ID` (optional): User identifier (takes priority over query param)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Cart deleted successfully",
    "userId": "user123"
  }
}
```

**Error Response - Cart not found (404):**

```json
{
  "success": false,
  "error": "Cart not found",
  "status": 404
}
```

**Error Response - Missing userId (400):**

```json
{
  "success": false,
  "error": "Missing userId parameter or X-User-ID header",
  "status": 400
}
```

**Error Response - Server Error (500):**

```json
{
  "success": false,
  "error": "Failed to delete cart",
  "status": 500
}
```

---

### OPTIONS - CORS Preflight

CORS preflight handler for browser requests.

**Request:**

```bash
OPTIONS /api/cart
```

**Response (200):**

Headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-User-ID
```

---

## Storage Details

### Cache Key Format

Carts are stored with the key pattern:

```
cart:${userId}
```

Example: `cart:user123`

### Time-to-Live (TTL)

- **Default TTL:** 7 days (604,800 seconds)
- Automatically refreshed when cart is updated
- Expired carts are automatically removed by Vercel KV

### Storage Capacity

Each cart is limited by Vercel KV's per-key size limit (typically 512MB, but practical limit is much smaller for JSON objects).

---

## Usage Examples

### JavaScript/Fetch

**Retrieve Cart:**

```javascript
const userId = 'user123';

const response = await fetch(`/api/cart?userId=${userId}`);
const result = await response.json();

if (result.success) {
  console.log('Cart:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Save Cart:**

```javascript
const userId = 'user123';
const cartItems = [
  {
    id: 'backprop-blue',
    name: 'Back-Propagation (Blue)',
    stock: 1,
    sold: false,
    soldPrice: 149,
    quantity: 2
  }
];

const response = await fetch('/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId,
    items: cartItems
  })
});

const result = await response.json();

if (result.success) {
  console.log('Cart saved:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Delete Cart:**

```javascript
const userId = 'user123';

const response = await fetch(`/api/cart?userId=${userId}`, {
  method: 'DELETE'
});

const result = await response.json();

if (result.success) {
  console.log('Cart cleared');
} else {
  console.error('Error:', result.error);
}
```

### Using X-User-ID Header

**With Header (More Secure):**

```javascript
const response = await fetch('/api/cart', {
  method: 'GET',
  headers: {
    'X-User-ID': 'user123'
  }
});

const result = await response.json();
```

### TypeScript

```typescript
import { CartItem, CartData } from '@/types/api';

interface CartResponse {
  success: boolean;
  data?: CartData;
  error?: string;
}

async function getCart(userId: string): Promise<CartData | null> {
  const response = await fetch(`/api/cart?userId=${userId}`);
  const result: CartResponse = await response.json();

  if (result.success && result.data) {
    return result.data;
  }

  return null;
}

async function saveCart(userId: string, items: CartItem[]): Promise<CartData | null> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, items })
  });

  const result: CartResponse = await response.json();

  if (result.success && result.data) {
    return result.data;
  }

  return null;
}

async function clearCart(userId: string): Promise<boolean> {
  const response = await fetch(`/api/cart?userId=${userId}`, {
    method: 'DELETE'
  });

  const result: CartResponse = await response.json();
  return result.success;
}
```

---

## HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 | Successful GET or DELETE |
| 201 | Successful POST (resource created) |
| 400 | Bad request (missing/invalid parameters) |
| 404 | Cart not found (DELETE only) |
| 500 | Server error |

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "status": 400
}
```

Always check the `success` field before accessing `data`.

---

## Implementation Notes

### Type Safety

The API uses strict TypeScript interfaces:

```typescript
interface CartItem {
  id: string;
  name: string;
  stock: number;
  sold: boolean;
  soldPrice?: number;
  collectorNickname?: string;
  soldAt?: string;
  quantity?: number;
}

interface CartData {
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  totalItems: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
```

### Validation

- `userId` is required and must be a non-empty string
- `items` must be an array
- Each cart item must have `id` and `name` fields
- Invalid JSON returns a 400 error

### Performance

- Cart retrieval is O(1) lookup in Redis
- Cart persistence is O(1) write operation
- No database queries required
- TTL prevents stale data accumulation

---

## Vercel KV Configuration

The API requires Vercel KV to be configured:

1. Create a Vercel KV database in your Vercel dashboard
2. Set environment variables in `.env.local`:

```env
KV_URL=redis://your-kv-instance-url
KV_REST_API_URL=https://your-kv-rest-api-url
KV_REST_API_TOKEN=your-token
```

3. Install the client:

```bash
npm install @vercel/kv
```

---

## File Location

**File:** `/app/api/cart/route.ts`

**Build Status:** Verified with `npm run build`

---

## Related Files

- **Types:** `/types/api.ts` (extends with CartItem and CartData)
- **Examples:** Integrate with Cart Context at `/context/CartContext.tsx`

---

## Migration Guide

To integrate with existing CartContext:

1. Replace localStorage calls with API calls
2. Update cart loading on app initialization:

```typescript
useEffect(() => {
  if (userId) {
    fetch(`/api/cart?userId=${userId}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setCart(result.data.items);
        }
      });
  }
}, [userId]);
```

3. Update cart saving (debounced):

```typescript
const debouncedSaveCart = debounce(async (items) => {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items })
  });
}, 1000);
```

4. Update logout to clear cart:

```typescript
const handleLogout = async () => {
  await fetch(`/api/cart?userId=${userId}`, {
    method: 'DELETE'
  });
  // proceed with logout
};
```

---

## FAQ

**Q: What happens to carts after 7 days?**
A: They are automatically deleted by Vercel KV. Use a user ID to restore previous cart data if you have a database.

**Q: Is the cart data encrypted?**
A: Yes. Vercel KV stores data in an encrypted Redis instance. Data is encrypted in transit (TLS) and at rest.

**Q: Can multiple requests save a cart simultaneously?**
A: Yes. Redis operations are atomic, so the last write wins. Consider implementing optimistic locking for concurrent operations.

**Q: How do I handle anonymous users?**
A: Generate a temporary ID (UUID) and store it in a session cookie or local storage.

**Q: What's the maximum cart size?**
A: Each key is limited to ~512MB, but realistically a cart should be much smaller. Typical carts are < 1KB.

---

## Support

For issues with the Cart API, check:

1. Vercel KV connection status
2. `.env.local` environment variables
3. Console logs for detailed error messages
4. HTTP status codes in API responses

# Cart API Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  React Components                         │  │
│  │  (useCart() hook - no changes needed)                     │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /context/CartContext.tsx                                │  │
│  │  ├─ useState(items)                                       │  │
│  │  ├─ useState(isInitialized)                              │  │
│  │  ├─ useRef(syncTimeoutRef)                               │  │
│  │  │                                                        │  │
│  │  ├─ useEffect #1: Load from localStorage                 │  │
│  │  ├─ useEffect #2: Debounced API sync (500ms)             │  │
│  │  │                                                        │  │
│  │  ├─ addToCart()          ──► setItems() ──► localStorage │  │
│  │  ├─ removeFromCart()     ──► setItems() ──► localStorage │  │
│  │  ├─ updateQuantity()     ──► setItems() ──► localStorage │  │
│  │  └─ clearCart()          ──► setItems() ──► localStorage │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│           ┌───────────┴───────────┐                              │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌──────────────────┐   ┌──────────────────┐                    │
│  │  localStorage    │   │  Debounce Timer  │                    │
│  │  (Instant)       │   │  (500ms)         │                    │
│  └──────────────────┘   └────────┬─────────┘                    │
│                                  │                              │
│                                  ▼                              │
│                          ┌──────────────────┐                    │
│                          │  fetch('/api/    │                    │
│                          │  cart', {        │                    │
│                          │    POST, userId, │                    │
│                          │    items         │                    │
│                          │  })              │                    │
│                          └────────┬─────────┘                    │
│                                   │ (non-blocking)              │
└───────────────────────────────────┼──────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │  Network (HTTP/1.1)             │
                    │  POST /api/cart                 │
                    └────────────┬────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  /app/api/cart/route.ts                                │ │
│  │                                                         │ │
│  │  POST /api/cart                                        │ │
│  │  ├─ Parse JSON request body                           │ │
│  │  ├─ Validate userId and items                         │ │
│  │  ├─ Call: kv.setex('cart:${userId}', TTL, data)      │ │
│  │  └─ Return JSON response                              │ │
│  │                                                         │ │
│  │  GET /api/cart?userId=...                             │ │
│  │  ├─ Extract userId from query params                  │ │
│  │  ├─ Call: kv.get('cart:${userId}')                    │ │
│  │  └─ Return cart items                                 │ │
│  │                                                         │ │
│  │  DELETE /api/cart?userId=...                          │ │
│  │  ├─ Extract userId from query params                  │ │
│  │  ├─ Call: kv.del('cart:${userId}')                    │ │
│  │  └─ Return success message                            │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
            ┌─────────────────────────────┐
            │  Vercel KV (Redis)          │
            │                             │
            │  cart:${userId} → {...}    │
            │  └─ TTL: 90 days            │
            │  └─ Format: JSON            │
            │  └─ Keys: userId-based      │
            │                             │
            │  Storage Type: String       │
            │  Persistence: Automatic     │
            └─────────────────────────────┘
```

## Data Flow Sequence

### Adding Item to Cart

```
1. User clicks "Add to Cart"
   │
2. Component calls useCart().addToCart(product)
   │
3. CartContext.addToCart() executes
   │
4. setItems(prev => [...prev, newItem])
   │
5. React re-renders UI (instant feedback)
   │
6. useEffect #2 detects items change
   │
7. Clears old timeout (if any)
   │
8. Starts new 500ms debounce timer
   │
9. User sees updated cart immediately
   │
10. Meanwhile, component also does:
    localStorage.setItem('cart', JSON.stringify(items))
    │
11. After 500ms without changes:
    │
12. saveCart() executes
    │
13. fetch('/api/cart', { POST, userId, items })
    │ (non-blocking - doesn't wait)
    │
14. API request sent in background
    │
15. Server receives, validates, stores in KV
    │
16. User has already moved on (async)
```

## Data Structures

### localStorage Format

```javascript
// Key: 'cart'
{
  "items": [
    {
      "id": "product-123",
      "name": "T-Shirt",
      "description": "Cool t-shirt",
      "price": 29.99,
      "image": "https://...",
      "credits": 100,
      "badge": "Popular",
      "popular": true,
      "quantity": 2
    }
  ]
}

// Key: 'userId'
"anon_a1b2c3d4e5f6g7h8..."
```

### API Request Body (POST)

```json
{
  "userId": "anon_a1b2c3d4e5f6g7h8...",
  "items": [
    {
      "id": "product-123",
      "name": "T-Shirt",
      "description": "Cool t-shirt",
      "price": 29.99,
      "image": "https://...",
      "credits": 100,
      "badge": "Popular",
      "popular": true,
      "quantity": 2
    }
  ]
}
```

### Vercel KV Storage Format

```
Key:   cart:anon_a1b2c3d4e5f6g7h8...
Value: {
         "items": [...],
         "updatedAt": "2025-11-01T10:30:00.000Z"
       }
TTL:   7776000 seconds (90 days)
Type:  String (JSON encoded)
```

## User ID Strategy

### Anonymous Users (Default)

```
First Time Visit:
├─ Generate random UUID: a1b2c3d4e5f6g7h8...
├─ Format: anon_a1b2c3d4e5f6g7h8...
├─ Store in localStorage['userId']
├─ Persist across page refreshes (same device)
├─ Different device = different ID
└─ Associated with their cart in KV

Returning Visit (Same Device):
├─ Load from localStorage['userId']
├─ Use same ID across sessions
└─ Cart restored from KV
```

### Future: Authenticated Users

```
After Login:
├─ Get user.id from NextAuth session
├─ Use as userId instead of anon_...
├─ Cart tied to user account
├─ Restore across devices
├─ Manual logout clears localStorage
└─ Account deletion removes from KV
```

## Error Handling Flow

```
User Action
    │
    ├─► setItems() ──► localStorage ✓ (instant)
    │
    └─► Debounce Timer (500ms)
        │
        ├─► API Call
        │   │
        │   ├─► Network Error
        │   │   └─► console.error() + continue
        │   │
        │   ├─► API Returns 400 (invalid data)
        │   │   └─► console.error() + continue
        │   │
        │   ├─► API Returns 500 (server error)
        │   │   └─► console.error() + continue
        │   │
        │   ├─► No userId
        │   │   └─► console.warn() + skip sync
        │   │
        │   └─► KV Connection Fails
        │       └─► console.error() + continue
        │
        └─► Cart Still Works (localStorage fallback)
```

## Timing Diagram

```
Time    Action              State
────────────────────────────────────────────────
0ms     Click "Add Item"    UI updates instantly
        setItems()
        localStorage set
        ─ 50ms ─
50ms    User sees item      Timeout started (500ms)

100ms   Click "Remove"      Old timeout cleared
        setItems()          New timeout started
        localStorage set

150ms   User sees update    Debounce restarted

200ms   (idle)              Waiting...

650ms   Debounce fires      fetch() called
        saveCart()
        ─ 100-400ms ─
750ms   API Request sent
        (non-blocking)

850ms   API Response        KV persisted
        Server returns 200

900ms   User still          All data safely stored
        shopping            Both localStorage + KV
```

## Component Integration

```
┌─────────────────────────────────┐
│  React Component                │
│  (ProductCard, Cart, etc.)      │
└────────────┬────────────────────┘
             │
             │ imports useCart()
             ▼
┌──────────────────────────────────────────┐
│  CartContext                             │
│  ├─ items: CartItem[]                    │
│  ├─ addToCart(product)                   │
│  ├─ removeFromCart(productId)            │
│  ├─ updateQuantity(productId, qty)       │
│  ├─ clearCart()                          │
│  ├─ totalItems: number                   │
│  └─ totalPrice: number                   │
│                                          │
│  Internal:                               │
│  ├─ useState(items)                      │
│  ├─ useState(isInitialized)              │
│  ├─ useRef(syncTimeoutRef)               │
│  ├─ useEffect (load from localStorage)   │
│  └─ useEffect (sync to API)              │
│                                          │
│  Utilities (imported):                   │
│  └─ saveCartToAPI()                      │
└──────────────────────────────────────────┘
```

## Dependency Graph

```
CartContext.tsx
├─ React (useState, useContext, useRef, useEffect)
├─ @vercel/kv (used in API route, not here)
└─ localStorage (Browser API)

/lib/utils.ts
├─ Existing cn() function
├─ New CartItem interface
├─ New saveCartToAPI()
├─ New loadCartFromAPI()
└─ New clearCartFromAPI()

/hooks/useCartSync.ts
├─ React (useCallback, useRef)
├─ useCart() hook
└─ Functions from /lib/utils.ts

/app/api/cart/route.ts (TO BE CREATED)
├─ Next.js (NextRequest, NextResponse)
└─ @vercel/kv (KV database)
```

## Decision Tree

```
                        User adds item
                             │
                    ┌────────┴────────┐
                    │                 │
            Should sync?          Is initialized?
            (debounce done)            │
                    │         ────┬────┴────┬────
                   Yes         Yes│        │No
                    │            │         │
                    │    localStorage     Skip
                    │      updated        (first load)
                    │            │
                    ▼            ▼
                 fetch()    No sync yet
                   │
        ┌──────────┴──────────┐
        │                     │
      Success            Network/Server
        │                  Error
        │                     │
        ▼                     ▼
     KV Updated         Log error
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
           Cart works anyway
           (localStorage)
```

## Scalability Considerations

### localStorage Limits
- Typical limit: 5-10MB per domain
- Typical cart size: 2-5KB
- Support for: ~1000 items (estimated)
- No cleanup needed (user manages)

### KV Capacity
- Unlimited items per user (practically)
- TTL: 90 days automatic cleanup
- Recommended: Store user ID, let item count grow naturally
- Cost: Per-request basis (minimal)

### Debounce Optimization
- 500ms chosen for balance
- Too fast: Excessive API calls
- Too slow: User waits to see sync
- Fine-tune in CartContext.tsx if needed

## Monitoring & Observability

### What to Monitor

```
CartContext.tsx logs:
├─ API sync failures (saveCart errors)
├─ localStorage parse errors
├─ Missing userId warnings
└─ General error stack traces

API Route logs:
├─ Request validation failures
├─ KV operation errors
├─ JSON parse errors
└─ Server exceptions

Vercel Analytics:
├─ POST /api/cart success rate
├─ GET /api/cart response times
├─ DELETE /api/cart completion
└─ Error rates per endpoint

Browser DevTools:
├─ Network tab: API call frequency
├─ Storage: localStorage size growth
├─ Console: Error messages
└─ Performance: Debounce timing
```

## Security Considerations

### Current (Anonymous)
- No authentication required
- userId not validated to belong to user
- Shared devices = shared cart
- Recommendation: Use authentication for sensitive data

### Future (Authenticated)
- Require NextAuth session
- Validate userId matches user.id
- Implement rate limiting
- Add CORS headers for API endpoints
- Hash sensitive cart data

## Performance Characteristics

### Latency
- localStorage: < 1ms
- Debounce delay: 500ms
- Network: 50-500ms (variable)
- KV: 10-100ms (included in network)
- Total: ~550-1000ms after last change

### Memory
- CartContext state: ~2KB per item
- localStorage entry: ~2KB per item
- Timeout ref: Negligible
- No memory leaks (proper cleanup)

### Bandwidth
- Per sync: ~500 bytes (typical small cart)
- Frequency: ~1 request per 500ms+ of changes
- Optimization: Debounce reduces to ~0.5 requests/min at rest

## Testing Strategy

```
Unit Tests:
├─ generateAnonymousId() returns correct format
├─ getUserId() reads/creates localStorage
├─ saveCart() updates both localStorage + API
├─ Debounce prevents rapid API calls
└─ Error handling doesn't break cart

Integration Tests:
├─ Add → localStorage updated
├─ Remove → localStorage updated
├─ API syncs after debounce
├─ API failures don't block UI
└─ Refresh → cart persists

E2E Tests:
├─ Add item → navigate away → refresh → item exists
├─ Go offline → add item → item persists
├─ Add multiple → sync once → KV has all
└─ Clear cart → API called → KV cleared
```

---

This architecture provides instant feedback via localStorage while maintaining persistence through Vercel KV, with graceful degradation if the API is unavailable.

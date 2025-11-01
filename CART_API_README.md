# Cart API Integration with Vercel KV

This document explains the CartContext API integration that was implemented.

## What Was Done

The CartContext has been enhanced to automatically persist cart data to Vercel KV while maintaining instant UI feedback via localStorage.

### Files Modified

#### 1. `/context/CartContext.tsx`
**Enhanced with:**
- Anonymous user ID generation (`anon_${uuid}`)
- Background API sync with 500ms debounce
- localStorage for instant feedback
- Graceful error handling and offline support

**Key Functions Added:**
- `generateAnonymousId()` - Creates unique IDs for anonymous users
- `getUserId()` - Gets or creates user ID from localStorage
- `saveCart()` - Updates localStorage and syncs to API in background

**State Added:**
- `isInitialized` - Prevents premature syncs
- `syncTimeoutRef` - Manages debounce timeouts

### Files Enhanced

#### 2. `/lib/utils.ts`
**New exports:**
- `CartItem` interface - Type definition for cart items
- `saveCartToAPI()` - POST to /api/cart
- `loadCartFromAPI()` - GET from /api/cart
- `clearCartFromAPI()` - DELETE from /api/cart

### Files Created

#### 3. `/hooks/useCartSync.ts`
**New hook for manual operations:**
- `useCartSync()` - Hook to manually trigger cart sync
- Methods: `syncCart()`, `loadCart()`, `clearCart()`
- Status: `isSyncing` boolean

#### 4. Documentation Files
- `/CART_API_IMPLEMENTATION.md` - Complete implementation guide
- `/IMPLEMENTATION_STATUS.md` - Detailed status tracking
- `/CART_INTEGRATION_SUMMARY.txt` - Overview and checklist

## How It Works

### The Flow

```
User Action (add/remove/update)
    ↓
setState() in CartContext
    ↓
localStorage updated immediately
    ↓
UI re-renders (instant feedback)
    ↓
Debounce timer starts (500ms)
    ↓
After 500ms without changes:
    ↓
POST /api/cart (background, non-blocking)
    ↓
Vercel KV persisted
    ↓
Done (user has already seen changes)
```

### Key Design Decisions

1. **localStorage First** - Updates UI immediately
2. **Background API Sync** - Doesn't block user actions
3. **Debounced** - Prevents excessive API calls (500ms)
4. **Non-blocking** - Doesn't wait for API response
5. **Graceful Degradation** - Works offline via localStorage

## What Needs to Be Created

You must create: **`/app/api/cart/route.ts`**

This file implements three endpoints:

### POST /api/cart - Save Cart
```
Request:
{
  "userId": "anon_abc123...",
  "items": [{ id, name, price, quantity, ... }]
}

Response:
{
  "success": true,
  "message": "Cart saved successfully",
  "userId": "anon_abc123...",
  "itemCount": 1
}
```

### GET /api/cart?userId=... - Load Cart
```
Query: userId=anon_abc123...

Response:
{
  "success": true,
  "items": [...],
  "updatedAt": "2025-11-01T10:00:00.000Z"
}
```

### DELETE /api/cart?userId=... - Clear Cart
```
Query: userId=anon_abc123...

Response:
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

## Implementation Template

Copy this template to `/app/api/cart/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  credits?: number;
  badge?: string;
  popular?: boolean;
  quantity: number;
}

interface CartRequest {
  userId: string;
  items: CartItem[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items }: CartRequest = await request.json();

    if (!userId || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing or invalid userId or items' },
        { status: 400 }
      );
    }

    await kv.setex(
      `cart:${userId}`,
      7776000, // 90 days TTL
      JSON.stringify({
        items,
        updatedAt: new Date().toISOString(),
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Cart saved successfully',
        userId,
        itemCount: items.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const cartData = await kv.get(`cart:${userId}`);

    if (!cartData) {
      return NextResponse.json(
        { success: true, items: [] },
        { status: 200 }
      );
    }

    const parsed = typeof cartData === 'string' ? JSON.parse(cartData) : cartData;
    return NextResponse.json(
      {
        success: true,
        items: parsed.items || [],
        updatedAt: parsed.updatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cart retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    await kv.del(`cart:${userId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Cart cleared successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cart deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Environment Setup

Add to `.env.local`:

```bash
KV_URL=<your-kv-url>
KV_REST_API_URL=<your-kv-rest-api-url>
KV_REST_API_TOKEN=<your-kv-rest-api-token>
KV_REST_API_READ_ONLY_TOKEN=<your-kv-rest-api-read-only-token>
```

Get these from Vercel Dashboard → Project → Storage → KV

## Using the Cart

### In Components
No changes needed to existing components:

```typescript
import { useCart } from '@/context/CartContext';

export function CartWidget() {
  const { items, addToCart, removeFromCart, totalPrice } = useCart();

  // Everything just works - syncs to API automatically!
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${totalPrice}</p>
    </div>
  );
}
```

### Manual Sync (Advanced)
For critical operations like checkout:

```typescript
import { useCartSync } from '@/hooks/useCartSync';

export function CheckoutButton() {
  const { syncCart, isSyncing } = useCartSync();

  const handleCheckout = async () => {
    // Ensure cart is synced before checkout
    const synced = await syncCart();
    if (synced) {
      // Proceed to payment
    }
  };

  return (
    <button onClick={handleCheckout} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : 'Checkout'}
    </button>
  );
}
```

## Testing

### Browser Console
```javascript
// Check localStorage
localStorage.getItem('cart')      // Should show cart items
localStorage.getItem('userId')    // Should show anon_xxxxx

// Parse and view
JSON.parse(localStorage.getItem('cart'))
```

### Network Tab
1. Open DevTools → Network tab
2. Add item to cart
3. Wait 500ms
4. Should see POST to `/api/cart`
5. Check Request/Response in Network tab

### API Testing
```bash
# Save cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","items":[]}'

# Load cart
curl "http://localhost:3000/api/cart?userId=test-user"

# Clear cart
curl -X DELETE "http://localhost:3000/api/cart?userId=test-user"
```

### Offline Testing
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Try adding/removing items
4. Cart should work fine via localStorage
5. Uncheck "Offline"
6. API should sync when online

## Monitoring

### Console Logs
The CartContext logs important events to console:

```javascript
// Success (no console output, silent operation)

// Errors logged as:
console.error('CartContext: API sync failed', { status: 400, error: {...} })
console.error('CartContext: Failed to sync cart to API:', error)
console.warn('CartContext: Unable to determine user ID, skipping API sync')
```

### Network Activity
Monitor POST requests to `/api/cart` in Network tab:
- Triggered 500ms after last cart change
- Should see Request body with userId and items
- Should see 200 response with success message

## Troubleshooting

### Cart not syncing?
1. Check browser console for errors
2. Verify `/api/cart/route.ts` exists
3. Check Network tab → POST /api/cart
4. Verify environment variables are set
5. Check Vercel logs in production

### localStorage empty?
1. Make sure you're testing in browser (not SSR)
2. Add an item first
3. Check DevTools → Application → Storage → localStorage
4. Check browser privacy settings (shouldn't block storage)

### API returns 400 error?
1. Check request format in Network tab
2. Verify userId is a non-empty string
3. Verify items is an array
4. Check request body is valid JSON

### Build fails?
1. Run `npm install` to ensure all dependencies
2. Check TypeScript errors: `npm run build`
3. Verify `/app/api/cart/route.ts` syntax
4. Check all imports are correct

## Performance

### Optimizations
- 500ms debounce prevents excessive API calls
- localStorage updates are instant (< 1ms)
- API calls are non-blocking (don't wait for response)
- Proper cleanup of timeout references

### Expected Timing
- User sees changes: < 5ms (UI update)
- API call sent: ~505ms after change (debounce + network)
- Data in KV: ~50-500ms after API call (network + KV latency)

### Impact
- Zero noticeable impact on UI responsiveness
- Minimal memory overhead
- Small localStorage size increase (typical cart ~2-5KB)

## Backwards Compatibility

All changes are 100% backwards compatible:
- No changes needed to existing components
- CartContext API unchanged
- useCart() hook works identically
- localStorage still works as fallback

## TypeScript Support

All code is fully typed:
- Strict mode enabled
- No implicit any types
- Proper error handling
- Exported interfaces for reuse

## Future Enhancements

Optional improvements (not required):
1. **Authentication** - Tie carts to user accounts instead of anonymous IDs
2. **Load on Startup** - Restore cart from KV on app initialization
3. **Real-time Sync** - Use WebSockets or Server-Sent Events
4. **Multi-device** - Sync cart across devices for authenticated users
5. **Cart Recovery** - Backup/restore functionality

## Summary

The CartContext is now enhanced with:
- Automatic Vercel KV persistence
- Instant UI feedback via localStorage
- Graceful offline support
- Debounced API syncing
- Anonymous user ID generation
- Complete error handling
- Full TypeScript support
- Backwards compatibility

**Next Step:** Create `/app/api/cart/route.ts` using the template above.

## Documentation

- **Implementation Guide** - `/CART_API_IMPLEMENTATION.md`
- **Status Tracking** - `/IMPLEMENTATION_STATUS.md`
- **Quick Reference** - `/QUICK_START.md`
- **Summary** - `/CART_INTEGRATION_SUMMARY.txt`

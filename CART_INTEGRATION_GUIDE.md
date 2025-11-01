# Cart API Integration Guide

This guide shows how to integrate the new Cart API with your frontend components.

## Quick Start

The Cart API is now live at `/api/cart`. It replaces localStorage-based cart persistence with Vercel KV.

---

## 1. Update CartContext (when ready)

**File:** `/context/CartContext.tsx`

Replace localStorage calls with API calls:

```typescript
import { useCallback, useEffect } from 'react';

const useCartStore = (userId: string | undefined) => {
  // ... existing code ...

  // Replace localStorage.getItem with API call
  const loadCart = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart?userId=${userId}`);
      const result = await response.json();

      if (result.success && result.data?.items) {
        setCartItems(result.data.items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, [userId]);

  // Replace localStorage.setItem with API call (debounced)
  const saveCart = useCallback(
    debounce(async (items) => {
      if (!userId) return;

      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, items })
        });
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    }, 1000),
    [userId]
  );

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Return store interface
  return {
    items: cartItems,
    addItem: (item) => {
      setCartItems([...cartItems, item]);
      saveCart([...cartItems, item]);
    },
    removeItem: (id) => {
      const updated = cartItems.filter(item => item.id !== id);
      setCartItems(updated);
      saveCart(updated);
    },
    clearCart: async () => {
      if (!userId) return;

      try {
        await fetch(`/api/cart?userId=${userId}`, {
          method: 'DELETE'
        });
        setCartItems([]);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };
};
```

---

## 2. API Methods Reference

### Get Cart

```typescript
async function getCart(userId: string) {
  const response = await fetch(`/api/cart?userId=${userId}`);
  const result = await response.json();

  if (result.success) {
    return result.data; // CartData
  }
  throw new Error(result.error);
}
```

### Save Cart

```typescript
async function saveCart(userId: string, items: CartItem[]) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items })
  });

  const result = await response.json();

  if (result.success) {
    return result.data; // CartData
  }
  throw new Error(result.error);
}
```

### Clear Cart

```typescript
async function clearCart(userId: string) {
  const response = await fetch(`/api/cart?userId=${userId}`, {
    method: 'DELETE'
  });

  const result = await response.json();

  if (result.success) {
    return true;
  }
  throw new Error(result.error);
}
```

---

## 3. Integration with React Hooks

### Custom Hook

Create a file `/hooks/useCart.ts`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import { CartItem, CartData } from '@/types/api';

export function useCart(userId: string | undefined) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart from API
  const load = useCallback(async () => {
    if (!userId) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cart?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setCart(result.data);
      } else {
        setError(result.error || 'Failed to load cart');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save cart to API
  const save = useCallback(
    async (items: CartItem[]) => {
      if (!userId) return;

      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, items })
        });

        const result = await response.json();

        if (result.success) {
          setCart(result.data);
          return result.data;
        } else {
          setError(result.error || 'Failed to save cart');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [userId]
  );

  // Clear cart
  const clear = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart?userId=${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setCart({
          userId,
          items: [],
          totalItems: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        setError(result.error || 'Failed to clear cart');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId]);

  // Load on mount or when userId changes
  useEffect(() => {
    load();
  }, [load]);

  return {
    cart,
    items: cart?.items || [],
    totalItems: cart?.totalItems || 0,
    loading,
    error,
    save,
    clear,
    reload: load
  };
}
```

### Usage in Component

```typescript
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';

export function ShoppingCart() {
  const { data: session } = useSession();
  const { items, loading, error, save, clear } = useCart(session?.user?.id);

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Cart ({items.length} items)</h2>
      {items.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
      <button onClick={() => clear()}>Clear Cart</button>
    </div>
  );
}
```

---

## 4. Testing the API

### Using cURL

**Get cart:**
```bash
curl "http://localhost:3000/api/cart?userId=test-user-1"
```

**Save cart:**
```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "items": [
      {
        "id": "backprop-blue",
        "name": "Back-Propagation (Blue)",
        "stock": 1,
        "sold": false,
        "soldPrice": 149,
        "quantity": 1
      }
    ]
  }'
```

**Delete cart:**
```bash
curl -X DELETE "http://localhost:3000/api/cart?userId=test-user-1"
```

### Using Postman

1. **GET Request**
   - URL: `http://localhost:3000/api/cart?userId=test-user-1`
   - Method: GET

2. **POST Request**
   - URL: `http://localhost:3000/api/cart`
   - Method: POST
   - Body (JSON):
   ```json
   {
     "userId": "test-user-1",
     "items": [
       {
         "id": "backprop-blue",
         "name": "Back-Propagation (Blue)",
         "stock": 1,
         "sold": false,
         "soldPrice": 149,
         "quantity": 1
       }
     ]
   }
   ```

3. **DELETE Request**
   - URL: `http://localhost:3000/api/cart?userId=test-user-1`
   - Method: DELETE

---

## 5. Error Handling

Always check the `success` field in responses:

```typescript
const response = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, items })
});

const result = await response.json();

if (result.success) {
  console.log('Cart saved:', result.data);
} else {
  console.error('Error:', result.error, 'Status:', result.status);

  // Handle specific errors
  if (result.status === 400) {
    // Validation error
    showValidationError(result.error);
  } else if (result.status === 500) {
    // Server error
    showServerError(result.error);
  }
}
```

---

## 6. Migration Checklist

- [ ] Verify API route works with `npm run build`
- [ ] Test GET endpoint manually (cURL or Postman)
- [ ] Test POST endpoint with sample cart data
- [ ] Test DELETE endpoint to clear cart
- [ ] Create `/hooks/useCart.ts` custom hook
- [ ] Update CartContext to use API instead of localStorage
- [ ] Test cart persistence across page reloads
- [ ] Test cart sync with multiple browser tabs
- [ ] Implement error boundaries in cart-related components
- [ ] Add loading states to cart UI
- [ ] Test with different user IDs
- [ ] Verify TTL behavior (7-day expiration)

---

## 7. Authentication Note

**Current Implementation:** No authentication required (optional for MVP)

If you add authentication later:

```typescript
// In your middleware or fetch wrapper
const response = await fetch('/api/cart?userId=' + userId, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-User-ID': userId
  }
});
```

---

## 8. Performance Considerations

### Debounce Cart Saves

Prevent excessive API calls when cart changes frequently:

```typescript
import { debounce } from 'lodash'; // or create your own

const debouncedSave = debounce(async (items) => {
  await saveCart(userId, items);
}, 1000); // Wait 1 second after last change

// In your component
const handleAddItem = (item) => {
  setCartItems([...cartItems, item]);
  debouncedSave([...cartItems, item]);
};
```

### Optimistic Updates

Update UI immediately, sync to server in background:

```typescript
const handleAddItem = async (item) => {
  // Update UI immediately
  const newItems = [...cartItems, item];
  setCartItems(newItems);

  // Sync to server
  try {
    await saveCart(userId, newItems);
  } catch (error) {
    // Revert on error
    setCartItems(cartItems);
    showError('Failed to save item');
  }
};
```

---

## 9. Troubleshooting

### "Missing userId" Error

Make sure to provide userId:
```typescript
// Option 1: Query parameter
fetch(`/api/cart?userId=${userId}`)

// Option 2: Header
fetch('/api/cart', {
  headers: { 'X-User-ID': userId }
})
```

### "Failed to save cart" Error

Check:
1. Vercel KV is configured in `.env.local`
2. Network tab shows successful 201 response
3. Console shows no parsing errors

### Cart Not Persisting

Verify:
1. POST endpoint returns 201 status
2. Response includes cart data
3. KV_URL environment variable is set
4. Vercel KV database is active in Vercel dashboard

---

## 10. Next Steps

- Coordinate with UI Specialist for cart display updates
- Consider adding cart analytics tracking
- Implement cart recovery for abandoned carts
- Add cart synchronization across tabs using BroadcastChannel API

---

## Related Documentation

- Full API docs: `/CART_API_DOCUMENTATION.md`
- API types: `/types/api.ts`
- Vercel KV: https://vercel.com/docs/storage/vercel-kv

---

## Support

For issues:
1. Check `.env.local` has KV credentials
2. Review console logs for error details
3. Verify API route exists: `/app/api/cart/route.ts`
4. Test with curl/Postman before frontend integration

# Cart API Implementation Guide

## Overview

The CartContext has been updated to integrate with Vercel KV persistence. This document provides the complete implementation steps.

## Changes Made

### 1. Updated CartContext (`/context/CartContext.tsx`)

The CartContext now includes:
- **Anonymous User ID Generation**: Creates `anon_${uuid}` for unauthenticated users
- **localStorage Persistence**: Maintains instant UI feedback
- **Background API Sync**: Debounced (500ms) to reduce API calls
- **Graceful Degradation**: Cart works offline via localStorage

Key features:
```typescript
// Generate anonymous ID for first-time users
const generateAnonymousId = (): string => { ... }

// Get or create userId
const getUserId = (): string => { ... }

// Save to localStorage immediately, sync to API in background
const saveCart = async (cartItems: CartItem[]) => { ... }
```

### 2. Updated Utilities (`/lib/utils.ts`)

Added three new async functions for API communication:
- `saveCartToAPI(userId: string, items: CartItem[])`
- `loadCartFromAPI(userId: string)`
- `clearCartFromAPI(userId: string)`

These provide reusable methods for cart API operations.

## Required API Route Implementation

You must create: `/app/api/cart/route.ts`

This file should implement three HTTP methods:

### POST /api/cart
Save user's cart to Vercel KV

**Request Body:**
```json
{
  "userId": "anon_abc123...",
  "items": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      "description": "...",
      "image": "...",
      "credits": 10,
      "badge": "Popular",
      "popular": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart saved successfully",
  "userId": "anon_abc123...",
  "itemCount": 1
}
```

**Implementation Notes:**
- Validate `userId` is a non-empty string
- Validate `items` is an array
- Store in KV with key: `cart:${userId}`
- TTL: 90 days (7776000 seconds)
- Store metadata: `{ items, updatedAt: ISO_STRING }`
- Return 400 for invalid input
- Return 500 for server errors

### GET /api/cart?userId=...
Retrieve user's cart from Vercel KV

**Query Parameters:**
- `userId` (required): The user's ID

**Response:**
```json
{
  "success": true,
  "items": [...],
  "updatedAt": "2025-11-01T10:00:00.000Z",
  "message": "No cart found for user" // if empty
}
```

**Implementation Notes:**
- Validate `userId` query parameter
- Return empty items array if not found
- Return 400 for missing userId
- Return 500 for server errors

### DELETE /api/cart?userId=...
Clear user's cart from Vercel KV

**Query Parameters:**
- `userId` (required): The user's ID

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

**Implementation Notes:**
- Validate `userId` query parameter
- Delete the KV key: `cart:${userId}`
- Return 400 for missing userId
- Return 500 for server errors

## Complete API Route Template

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
    const body: CartRequest = await request.json();
    const { userId, items } = body;

    if (!userId || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing or invalid userId or items' },
        { status: 400 }
      );
    }

    if (typeof userId !== 'string' || userId.length === 0) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
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

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string' || userId.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid userId parameter' },
        { status: 400 }
      );
    }

    const cartData = await kv.get(`cart:${userId}`);

    if (!cartData) {
      return NextResponse.json(
        {
          success: true,
          items: [],
          message: 'No cart found for user',
        },
        { status: 200 }
      );
    }

    const parsedCart = typeof cartData === 'string' ? JSON.parse(cartData) : cartData;

    return NextResponse.json(
      {
        success: true,
        items: parsedCart.items || [],
        updatedAt: parsedCart.updatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cart retrieval error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid cart data in storage' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string' || userId.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid userId parameter' },
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

### Required Vercel KV Environment Variables

Add to your Vercel project settings or `.env.local`:

```bash
KV_URL=<your-kv-url>
KV_REST_API_URL=<your-kv-rest-api-url>
KV_REST_API_TOKEN=<your-kv-rest-api-token>
KV_REST_API_READ_ONLY_TOKEN=<your-kv-rest-api-read-only-token>
```

To get these values:
1. Create a Vercel KV database on vercel.com
2. Go to Settings > Environment Variables
3. Copy the KV_* variables

## How It Works

### User Journey

1. **First Time User**:
   - CartContext generates `anon_${uuid}`
   - Stored in localStorage for persistence
   - Cart changes sync to API in background (debounced 500ms)

2. **Returning User**:
   - CartContext loads from localStorage first (instant)
   - Cart operations update localStorage immediately (instant feedback)
   - Changes sync to API in background

3. **No Network**:
   - Cart still works via localStorage
   - API sync skipped (graceful degradation)
   - No error shown to user

4. **API Sync**:
   - Debounced to 500ms to prevent excessive requests
   - Non-blocking (doesn't wait for API response)
   - Failures logged but don't break cart functionality

### Data Flow

```
User Action (add/remove/update)
    ↓
setItems() called
    ↓
localStorage updated immediately
    ↓
UI re-renders (instant feedback)
    ↓
Debounce timer starts (500ms)
    ↓
API sync starts (in background)
    ↓
Vercel KV persisted (eventual consistency)
```

## Testing

### Test localStorage sync:
```javascript
// In browser console
localStorage.getItem('cart')      // See saved cart
localStorage.getItem('userId')    // See user ID
```

### Test API:
```bash
# Save cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-123","items":[]}'

# Load cart
curl http://localhost:3000/api/cart?userId=test-123

# Clear cart
curl -X DELETE http://localhost:3000/api/cart?userId=test-123
```

## TypeScript Strict Mode

All code follows TypeScript strict mode:
- No implicit `any`
- Proper type annotations
- Null/undefined handling
- Error type checking

## Backwards Compatibility

- Existing components using `useCart()` work without changes
- CartContext export interface unchanged
- localStorage as fallback ensures offline functionality

## Build Verification

```bash
npm run build
# Should complete without TypeScript errors
```

## Error Handling

The system handles these scenarios gracefully:

1. **Invalid JSON in request**: Returns 400 with clear error message
2. **Missing userId**: Returns 400
3. **Invalid items format**: Returns 400
4. **KV connection failure**: Logs error, cart still works via localStorage
5. **JSON parsing error**: Returns 500, suggests corrupted data
6. **Offline**: Cart works via localStorage alone

## Future Enhancements

- Add authentication to tie carts to user accounts
- Load cart on app start (optional, for auto-restore)
- Real-time sync instead of debounce
- Cart recovery from backup
- Analytics on cart abandonment
- Cleanup expired carts (KV TTL handles this)

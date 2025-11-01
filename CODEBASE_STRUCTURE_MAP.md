# LLM MERCH STORE - COMPREHENSIVE CODEBASE MAP

## EXECUTIVE SUMMARY
E-commerce platform for AI/LLM-themed merchandise with:
- Shopping cart system (localStorage + API sync)
- PIX payment integration (Brazilian payment method)
- Order management and confirmation
- Real-time inventory and telemetry
- Multi-provider AI chat integration
- Product detail modals with zoom/animations

---

## E-COMMERCE FLOW DIAGRAM

```
Homepage (/) → Product Browse → Product Detail Modal
                    ↓
            Add to Cart ← ← ← 
                    ↓
        Cart Drawer (Sidebar) 
                    ↓
        /checkout → Shipping Form
                    ↓
        /api/pix-payment (EBANX) → PixPaymentModal (QR Code)
                    ↓
        /api/pix-payment-status (Poll) → Payment Confirmed
                    ↓
        /order/[id] → Order Confirmation
```

---

## PAGES (Routes)

### Public Pages
| File | Route | Purpose |
|------|-------|---------|
| `/app/page.tsx` | `/` | Homepage - Hero, products, testimonials, FAQs |
| `/app/checkout/page.tsx` | `/checkout` | Checkout form + order summary |
| `/app/order/[id]/page.tsx` | `/order/[id]` | Order confirmation (success page) |

### Auth Pages
| File | Route | Purpose |
|------|-------|---------|
| `/app/auth/signin/page.tsx` | `/auth/signin` | SignIn page (NextAuth setup) |
| `/app/auth/unauthorized/page.tsx` | `/auth/unauthorized` | Unauthorized access page |

### Admin Pages
| File | Route | Purpose |
|------|-------|---------|
| `/app/admin/page.tsx` | `/admin` | Admin dashboard (analytics) |
| `/app/charts/page.tsx` | `/charts` | Analytics charts & metrics |

---

## API ROUTES

### Payment & PIX
| Route | Method | Purpose | Dependencies |
|-------|--------|---------|--------------|
| `/api/pix-payment` | POST | Create PIX payment via EBANX | EBANX_INTEGRATION_KEY |
| `/api/pix-payment-status` | POST | Check payment confirmation status | Payment hash |
| `/api/webhook/pix-payment` | POST | EBANX webhook handler | Payment confirmation |

### Cart & Orders
| Route | Method | Purpose | Dependencies |
|-------|--------|---------|--------------|
| `/api/cart` | POST | Save/sync cart to API | userId, items |
| `/api/orders` | POST | Create order record | orderId, items, shippingInfo |

### Telemetry & Analytics
| Route | Method | Purpose | Dependencies |
|-------|--------|---------|--------------|
| `/api/telemetry` | POST | Track events (visitor, page view, add_to_cart, like) | eventType |
| `/api/visitors` | POST | Get/increment visitor count | - |
| `/api/stats` | GET | Get overall stats | - |
| `/api/events` | GET/POST | List/create events | - |
| `/api/metrics` | GET | Get performance metrics | - |
| `/api/sale-status` | GET | Get sale start/end times | - |
| `/api/inventory` | GET | Get product stock status | - |
| `/api/market-prices` | GET | Get market price trends | - |

### Admin APIs
| Route | Method | Purpose | Dependencies |
|-------|--------|---------|--------------|
| `/api/admin/system-config` | GET/POST | System configuration | Auth required |
| `/api/admin/hero-config` | GET/POST | Hero section configuration | Auth required |

### AI Integration
| Route | Method | Purpose | Dependencies |
|-------|--------|---------|--------------|
| `/api/ask` | POST | Get AI explanation for product | provider (anthropic/openai) |

### Collectors & Offers (Secondary Features)
| Route | Method | Purpose | Dependencies |
|-------|--------|---------|--------------|
| `/api/collectors` | GET/POST | Track product collectors | - |
| `/api/offers` | GET/POST | Track market offers | - |
| `/api/transactions` | GET | Get transaction history | - |

---

## COMPONENTS

### Cart System
| Component | File | Purpose |
|-----------|------|---------|
| **CartDrawer** | `components/CartDrawer.tsx` | Sidebar cart (add, remove, quantity) |
| **CartContext** | `context/CartContext.tsx` | State management (localStorage + API sync) |
| **HeaderCart** | `components/header-cart.tsx` | Cart icon with badge |
| **useCartSync** | `hooks/useCartSync.ts` | Custom hook for cart sync logic |

### Product Display
| Component | File | Purpose |
|-----------|------|---------|
| **ProductDetailModal** | `components/ui/product-detail-modal.tsx` | Full product view (zoom, AI explain, like, share) |
| **Scoreboard** | `components/ui/scoreboard.tsx` | Inventory/market prices table |
| **VisitorPopup** | `components/ui/visitor-popup.tsx` | Visitor count notification |

### Payment
| Component | File | Purpose |
|-----------|------|---------|
| **PixPaymentModal** | `components/PixPaymentModal.tsx` | PIX QR code + copy modal |

### Header Components
| Component | File | Purpose |
|-----------|------|---------|
| **HeaderVisitor** | `components/header-visitor.tsx` | Real-time visitor count |
| **HeaderProducts** | `components/header-products.tsx` | Available products count |
| **HeaderCountdown** | `components/header-countdown.tsx` | Sale countdown timer |
| **HeaderStats** | `components/header-stats.tsx` | Stats display |

### Hero Variants
| Component | File | Purpose |
|-----------|------|---------|
| **HeroSwitch** | `components/hero-switch.tsx` | Switches between hero variants |
| **HeroMoney** | `components/hero-variants/hero-money.tsx` | Money-themed hero |
| **HeroStrikethrough** | `components/hero-variants/hero-strikethrough.tsx` | Strikethrough text hero |
| **HeroAIFailure** | `components/hero-variants/hero-ai-failure.tsx` | AI failure themed hero |
| **HeroMoneyWTF** | `components/hero-variants/hero-money-wtf.tsx` | Humorous money hero |

### Miscellaneous
| Component | File | Purpose |
|-----------|------|---------|
| **AIProviders** | `components/ai-providers.tsx` | AI provider showcase |
| **AIChat** | `components/ai-chat.tsx` | Chat input for /api/ask |
| **LanguageToggle** | `components/language-toggle.tsx` | Language switcher |
| **HeroNavigation** | `components/hero-navigation.tsx` | Navigation menu |
| **WebsiteScaffold** | `components/website-scaffold.tsx` | Page layout structure |
| **Providers** | `components/providers.tsx` | Context/Provider wrapper |

### UI Components
| Component | File | Purpose |
|-----------|------|---------|
| **Accordion** | `components/ui/accordion.tsx` | FAQ accordion |
| **Countdown** | `components/ui/countdown.tsx` | Timer component |
| **TextRotate** | `components/ui/text-rotate.tsx` | Rotating text animation |
| **AuroraBackground** | `components/ui/aurora-background.tsx` | Aurora visual effect |

---

## CONTEXT & STATE

### CartContext
**File**: `context/CartContext.tsx`

**Type**: Client-side React Context

**State**:
```typescript
{
  items: CartItem[]        // Cart items with quantity
  addToCart(product)       // Add/increment item
  removeFromCart(id)       // Remove item
  updateQuantity(id, qty)  // Update quantity
  clearCart()              // Empty cart
  totalItems: number       // Sum of quantities
  totalPrice: number       // Sum of prices × qty
}
```

**Storage**: 
- **Primary**: localStorage (cart key)
- **Secondary**: API (`/api/cart`) - background sync with debounce (500ms)
- **User ID**: Anonymous (device fingerprint) or session

---

## TYPES

**File**: `types/api.ts`

```typescript
Stats {
  totalVisitors, totalPageViews, addToCartEvents,
  totalSales, totalProducts, totalLikes,
  topProducts: [{name, clicks}],
  engagementRate
}

SaleStatus {
  isActive: boolean
  status: 'before' | 'during' | 'after'
  timeUntilStart/End?: number (ms)
}

Inventory {
  products: {[key]: {name, stock, sold, soldPrice}}
  stats: {totalProducts, soldOut, available}
}

MarketPrice {
  productId, productName, basePrice,
  highestOffer, totalOffers,
  priceAppreciation, percentageGain,
  isTrending, status: 'available' | 'sold'
}
```

---

## UTILITIES & LIBRARIES

### Core Utils
| File | Purpose |
|------|---------|
| `lib/utils.ts` | General utilities (cn, formatting) |
| `lib/i18n.tsx` | i18n provider & useLanguage hook |
| `lib/easings.ts` | Animation easing functions |
| `lib/fetch-with-retry.ts` | Fetch with exponential backoff |
| `lib/device-fingerprint.ts` | Anonymous user ID generation |
| `lib/event-store.ts` | Local event storage system |
| `lib/swipe-handler.ts` | Gesture detection |

---

## CONFIGURATION

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `middleware.ts` | Request middleware (redirects, auth) |
| `tailwind.config.ts` (implied) | Tailwind CSS config |
| `postcss.config.mjs` | PostCSS configuration |
| `tsconfig.json` (implied) | TypeScript configuration |

---

## LAYOUT STRUCTURE

```
RootLayout (/app/layout.tsx)
├── LanguageProvider
├── Providers (CartProvider, NextAuth, etc.)
├── LanguageToggle
├── Page Content
├── Analytics
└── SpeedInsights

Homepage (/)
├── Header (Logo + Stats + Nav)
├── HeroSwitch (Dynamic hero)
├── WebsiteScaffold
├── Features Section
├── Products Grid (ProductCard → ProductDetailModal)
├── Scoreboard (Market prices)
├── Testimonials
├── FAQ (Accordion)
├── Stats Display
├── AI Providers Showcase
├── AI Chat Section
├── Contact Form
└── Footer

Checkout (/checkout)
├── Header
├── 2-Column Layout
│   ├── Left: Shipping Form
│   └── Right: Order Summary
├── Payment Buttons
└── PixPaymentModal (on submit)

Order Confirmation (/order/[id])
├── Success Badge
├── Order Number
├── Payment Status
├── Items List
├── Shipping Address
├── Delivery Timeline
└── CTA Buttons
```

---

## DATA FLOW EXAMPLES

### Add to Cart Flow
```
1. User clicks "Add to Cart" on ProductCard
2. ProductCard.handleAddToCart() calls useCart().addToCart(product)
3. CartContext updates state & localStorage
4. CartContext triggers saveCart() (debounced 500ms)
5. saveCart() POSTs to /api/cart with userId + items
6. HeaderCart updates badge (via totalItems)
7. CartDrawer updates if open
```

### Checkout Flow
```
1. User navigates to /checkout
2. Page loads CartContext items
3. User fills ShippingInfo form
4. User clicks "PAY WITH PIX"
5. CheckoutPage POSTs to /api/pix-payment
   - amount: totalPrice
   - productId: ORD-{timestamp}-{random}
   - productName: Order {orderId}
   - buyerEmail/Name: from form
6. /api/pix-payment calls EBANX sandbox API
7. PixPaymentModal opens with QR code + PIX code
8. User pays via bank app
9. PixPaymentModal polls /api/pix-payment-status (every 2s)
10. On confirmed (status='CO'), onSuccess() called
11. CheckoutPage POSTs to /api/orders (save order)
12. CartContext.clearCart()
13. Router.push(/order/{orderId})
```

### Real-time Telemetry Flow
```
1. Page load triggers multiple parallel fetches:
   - POST /api/telemetry (visitor)
   - POST /api/telemetry (page_view)
   - POST /api/visitors (get count)
   - GET /api/stats
   - GET /api/sale-status
   - GET /api/inventory
   - GET /api/market-prices
2. Results displayed in header + stats section
3. Sale status interval refreshes /api/sale-status every 60s
4. User actions (add_to_cart, like) POST to /api/telemetry
```

### Product Detail Flow
```
1. User clicks ProductCard
2. ProductDetailModal opens with animation
3. User can:
   a) Add to cart → addToCart() → CartContext
   b) Like → POST /api/telemetry (product_like)
   c) Share via WhatsApp
   d) Explain → POST /api/ask with AI provider
4. Close modal → restores scroll position
```

---

## KEY INTEGRATIONS

### Payment: EBANX
- **Endpoint**: https://sandbox.ebanx.com/ws/direct
- **Method**: PIX (Brazilian instant transfer)
- **Auth**: EBANX_INTEGRATION_KEY (env)
- **Polling**: /api/pix-payment-status checks payment status

### AI: Claude + ChatGPT
- **Route**: /api/ask
- **Providers**: anthropic, openai
- **Use**: Product explanation modal

### Analytics: Vercel
- **Components**: Analytics, SpeedInsights
- **Method**: Auto-tracked in layout.tsx

---

## MISSING/INCOMPLETE FEATURES

### Critical
- [ ] `/api/orders` endpoint (order persistence)
- [ ] Email receipt system (send after payment)
- [ ] Order status tracking (not just confirmation)
- [ ] Admin order management dashboard

### Nice-to-Have
- [ ] Search/filter products
- [ ] Product reviews
- [ ] Wishlist
- [ ] User authentication (NextAuth setup exists but incomplete)
- [ ] Shipping provider integration
- [ ] Inventory sync from external system
- [ ] Market API (trending prices)

---

## FILE TREE (SOURCE ONLY)

```
llm-merch-store/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── layout.tsx                        # Root layout
│   ├── checkout/page.tsx                 # Checkout
│   ├── order/[id]/page.tsx              # Order confirmation
│   ├── auth/
│   │   ├── signin/page.tsx              # SignIn
│   │   └── unauthorized/page.tsx        # 401
│   ├── admin/page.tsx                   # Admin dashboard
│   ├── charts/page.tsx                  # Charts
│   ├── api/
│   │   ├── pix-payment/route.ts         # Create payment
│   │   ├── pix-payment-status/route.ts # Check status
│   │   ├── webhook/pix-payment/route.ts # EBANX webhook
│   │   ├── cart/route.ts                # Save cart
│   │   ├── telemetry/route.ts           # Track events
│   │   ├── visitors/route.ts            # Count visitors
│   │   ├── stats/route.ts               # Get stats
│   │   ├── sale-status/route.ts         # Sale times
│   │   ├── inventory/route.ts           # Stock status
│   │   ├── market-prices/route.ts       # Price trends
│   │   ├── events/route.ts              # Events list
│   │   ├── metrics/route.ts             # Metrics
│   │   ├── collectors/route.ts          # Collectors
│   │   ├── offers/route.ts              # Market offers
│   │   ├── transactions/route.ts        # Transactions
│   │   ├── ask/route.ts                 # AI explain
│   │   ├── admin/
│   │   │   ├── hero-config/route.ts    # Hero config
│   │   │   └── system-config/route.ts  # System config
│   │   └── auth/[...nextauth]/route.ts # NextAuth
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── CartDrawer.tsx                   # Cart sidebar
│   ├── PixPaymentModal.tsx              # PIX QR modal
│   ├── header-cart.tsx
│   ├── header-countdown.tsx
│   ├── header-products.tsx
│   ├── header-visitor.tsx
│   ├── header-stats.tsx
│   ├── hero-switch.tsx
│   ├── hero-navigation.tsx
│   ├── ai-chat.tsx
│   ├── ai-providers.tsx
│   ├── language-toggle.tsx
│   ├── website-scaffold.tsx
│   ├── providers.tsx
│   ├── hero-variants/
│   │   ├── hero-money.tsx
│   │   ├── hero-strikethrough.tsx
│   │   ├── hero-ai-failure.tsx
│   │   └── hero-money-wtf.tsx
│   └── ui/
│       ├── product-detail-modal.tsx     # Product view
│       ├── accordion.tsx
│       ├── countdown.tsx
│       ├── scoreboard.tsx
│       ├── visitor-popup.tsx
│       ├── text-rotate.tsx
│       └── aurora-background.tsx
├── context/
│   └── CartContext.tsx                  # Cart state
├── hooks/
│   └── useCartSync.ts                   # Cart sync hook
├── lib/
│   ├── utils.ts
│   ├── i18n.tsx
│   ├── easings.ts
│   ├── fetch-with-retry.ts
│   ├── device-fingerprint.ts
│   ├── event-store.ts
│   └── swipe-handler.ts
├── types/
│   ├── api.ts                           # API types
│   └── next-auth.d.ts                   # NextAuth types
├── middleware.ts
└── next.config.ts
```

---

## QUICK NAVIGATION GUIDE

**To add a new product**: Modify `allProducts` array in `/app/page.tsx` (line 537)

**To add a new API endpoint**: Create file in `/app/api/{endpoint}/route.ts`

**To modify cart behavior**: Edit `/context/CartContext.tsx`

**To add AI provider**: Update `/api/ask/route.ts` and provider selection in product detail modal

**To change checkout form**: Edit `/app/checkout/page.tsx` ShippingInfo interface

**To customize payment**: Modify EBANX payload in `/api/pix-payment/route.ts`

---

## DEPENDENCIES SUMMARY

**Framework**: Next.js 14+ (App Router)
**Styling**: Tailwind CSS
**Animations**: Framer Motion
**UI Primitives**: Radix UI
**Forms**: React Hook Form (implied)
**Auth**: NextAuth.js
**Payment**: EBANX API
**AI**: Anthropic Claude, OpenAI ChatGPT
**Analytics**: Vercel Analytics
**Icons**: Lucide React


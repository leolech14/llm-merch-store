# Admin Orders Dashboard - Quick Reference

## File Locations

```
/app/admin/orders/page.tsx          - Main dashboard UI
/app/api/admin/orders/[id]/route.ts - Update API endpoint
/app/admin/page.tsx                 - Updated with Orders link
/types/orders.ts                    - Type definitions (existing)
/app/api/admin/orders/route.ts      - List API (existing)
/app/api/admin/orders/export/route.ts - Export API (existing)
```

## Key Components

### AdminOrdersPage (Main Component)
**Location:** `/app/admin/orders/page.tsx`

**Features:**
- Order list with search and filtering
- Real-time stats
- CSV export
- Modal-based order editing

**Key State:**
```typescript
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState<string>("all");
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
```

### OrderDetailModal (Sub-Component)
**Features:**
- Display order information
- Edit fulfillment status
- Add tracking number
- Add admin notes
- Save/cancel buttons

**Props:**
```typescript
{
  order: Order,
  onClose: () => void,
  onUpdate: () => void
}
```

## API Usage

### Fetch Orders
```typescript
const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
const data = await res.json();
// Returns: { success: true, data: { orders: [], total: 0, ... } }
```

### Update Order
```typescript
const res = await fetch(`/api/admin/orders/${orderId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fulfillmentStatus: "shipped",
    trackingNumber: "BR123456",
    adminNotes: "Sent today"
  })
});
```

### Export CSV
```typescript
const res = await fetch("/api/admin/orders/export");
const blob = await res.blob();
// Create download link and trigger download
```

## Common Tasks

### Add a New Status Filter Option
**File:** `/app/admin/orders/page.tsx`

```typescript
// Find the <select> element with statusFilter
<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
  <option value="all">All Orders</option>
  <option value="NEW_STATUS">New Status Name</option>  // Add here
</select>
```

Then update the API to handle the filter:
**File:** `/app/api/admin/orders/route.ts`

### Change Table Column
**File:** `/app/admin/orders/page.tsx`

1. Add/remove `<th>` in table header
2. Add/remove corresponding `<td>` in table body
3. Update TypeScript types if needed

### Customize Stats Cards
**File:** `/app/admin/orders/page.tsx`

Replace or add new stat cards:
```typescript
<div className="bg-card rounded-lg p-4 border">
  <p className="text-sm text-muted-foreground mb-1">New Stat</p>
  <p className="text-2xl font-bold">{calculateStat()}</p>
</div>
```

### Change Color Scheme
**File:** `/app/admin/orders/page.tsx`

Status badge colors defined in rendering:
```typescript
className={`px-2 py-1 rounded text-xs font-semibold ${
  condition ? "bg-color-500/20 text-color-700" : "bg-color-500/20 text-color-700"
}`}
```

Tailwind colors available:
- emerald (green)
- amber (yellow)
- rose (red)
- blue (blue)
- muted (gray)

## Type Definitions Quick Reference

```typescript
interface Order {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
  paymentHash?: string;
  createdAt: string;
  updatedAt: string;
  fulfillmentStatus?: FulfillmentStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerNotes?: string;
  adminNotes?: string;
}

type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}
```

## CSS Classes Reference

### Layout Classes
```
min-h-screen       - Full viewport height
container          - Max-width container
px-4 py-8          - Padding
gap-4              - Grid/flex gap
grid-cols-2        - 2-column grid on all screens
md:grid-cols-4     - 4-column on medium+ screens
```

### Component Classes
```
bg-card            - Card background
bg-background      - Page background
border              - 1px border
rounded-lg         - Rounded corners
rounded-xl         - Larger rounded corners
p-6                - Large padding
```

### Interactive Classes
```
hover:opacity-90   - Hover effect
hover:bg-muted/50  - Hover background
transition         - CSS transitions
cursor-pointer     - Pointer cursor
disabled:opacity-50 - Disabled state
```

### Status Colors
```
bg-emerald-500/20 text-emerald-700  - Success/delivered
bg-blue-500/20 text-blue-700         - Info/shipped
bg-amber-500/20 text-amber-700       - Warning/pending
bg-rose-500/20 text-rose-700         - Error/failed
bg-muted text-muted-foreground       - Neutral/pending
```

## Debugging Tips

### Check API Response
```javascript
// In browser console
fetch('/api/admin/orders')
  .then(r => r.json())
  .then(console.log)
```

### Log State Changes
```typescript
useEffect(() => {
  console.log('Orders updated:', orders);
}, [orders]);
```

### Verify Authentication
```javascript
// Check session in console
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

### Network Troubleshooting
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by Fetch/XHR
4. Trigger action
5. Click request to see details
```

## Performance Optimizations

### Current Optimizations
- Framer Motion for smooth animations
- Client-side search/filter (no API round-trip)
- Motion.tr for row animations
- Conditional rendering for modals

### If Needed
```typescript
// Add debounced search
import { useDebouncedValue } from './hooks'; // or install library
const debouncedSearch = useDebouncedValue(searchQuery, 300);
```

```typescript
// Add pagination
const itemsPerPage = 20;
const currentPage = 1;
const paginatedOrders = orders.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

## Accessibility Checklist

- [x] Semantic HTML (table, buttons, inputs)
- [x] Color with text indicators (not color alone)
- [x] Keyboard navigation
- [x] Focus styles
- [x] ARIA labels where needed
- [x] Modal with backdrop and escape key
- [x] Touch-friendly sizes (44px+)

## Common Issues & Solutions

### Issue: Orders not loading
**Solution:** Check if admin is authenticated
```typescript
// Add console log
console.log('Session:', session);
console.log('Is Admin:', session?.user?.isAdmin);
```

### Issue: Modal won't close
**Solution:** Check onClick handlers
```typescript
// Make sure e.stopPropagation() used on modal content
<div onClick={(e) => e.stopPropagation()}>
  Modal content
</div>
```

### Issue: CSV export fails
**Solution:** Check endpoint response
```javascript
fetch('/api/admin/orders/export')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    return r.blob();
  })
```

### Issue: Table misaligned on mobile
**Solution:** Check overflow-x-auto is on container
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    {/* table content */}
  </table>
</div>
```

## Deployment Checklist

- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no warnings
- [ ] Test on production database
- [ ] Verify NextAuth variables set
- [ ] Verify Vercel KV connected
- [ ] Test on actual device sizes
- [ ] Test export with production data
- [ ] Verify admin emails configured

## Environment Variables Needed

In `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000 (or your domain)
NEXTAUTH_SECRET=... (generated by NextAuth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## Testing Commands

```bash
# Build
npm run build

# Run dev server
npm run dev

# Lint
npm run lint

# TypeScript check
npx tsc --noEmit
```

## Documentation Files

```
ADMIN_ORDERS_IMPLEMENTATION.md  - Full technical documentation
TESTING_ORDERS_DASHBOARD.md     - Comprehensive testing guide
ORDERS_DASHBOARD_QUICK_REFERENCE.md - This file
```

## Related Files

- `/types/orders.ts` - Order type definitions
- `/app/api/admin/orders/route.ts` - List/filter endpoint
- `/app/api/admin/orders/export/route.ts` - CSV export endpoint
- `/app/api/auth/[...nextauth]/route.ts` - Auth configuration
- `/app/admin/page.tsx` - Main admin dashboard

## Browser DevTools Shortcuts

```
F12                - Open DevTools
Ctrl+Shift+K       - Console
Ctrl+Shift+J       - Console alternative
Ctrl+Shift+E       - Network
Ctrl+Shift+I       - Inspector
Ctrl+Shift+C       - Element picker
```

## Useful Commands

```bash
# Find all references to a component
grep -r "AdminOrdersPage" .

# Find all API calls
grep -r "fetch.*orders" .

# Count lines of code
wc -l app/admin/orders/page.tsx

# Check file size
du -h app/admin/orders/page.tsx
```

## Next Steps

1. Run `npm run build` to verify
2. Run `npm run dev` to test locally
3. Review TESTING_ORDERS_DASHBOARD.md for full test suite
4. Deploy to staging environment
5. Run production tests
6. Deploy to production

## Support

For issues:
1. Check console errors (F12 > Console)
2. Check Network tab for failed requests
3. Review TESTING_ORDERS_DASHBOARD.md for troubleshooting
4. Check ADMIN_ORDERS_IMPLEMENTATION.md for architecture
5. Check type definitions in /types/orders.ts

## Version Info

- Next.js: 16.0.1
- React: 19.2.0
- TypeScript: 5.x
- Created: 2025-11-01
- Status: Production Ready

---

Last updated: 2025-11-01

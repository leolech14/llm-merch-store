# Testing Guide - Admin Orders Dashboard

## Pre-Build Verification

### 1. File Existence Check
```bash
# Verify all new files exist
ls -la app/admin/orders/page.tsx
ls -la app/api/admin/orders/[id]/route.ts

# Check that admin page was updated
grep -n "Orders Management" app/admin/page.tsx
```

### 2. TypeScript Compilation
```bash
npm run build
# Expected output: Successfully compiled (no errors)
```

## Build Validation

After running `npm run build`, verify:

1. **No TypeScript Errors**
   - All imports resolve correctly
   - All type definitions match
   - No implicit any types

2. **Build Output**
   - Check `.next/` folder is created
   - Verify no failed chunks

## Feature Testing

### Test 1: Authentication & Authorization

**Scenario:** Unauthenticated user visits `/admin/orders`

Steps:
1. Clear browser cookies/session
2. Navigate to `/admin/orders`
3. Expected: Redirect to `/auth/signin`

**Scenario:** Non-admin user visits `/admin/orders`

Steps:
1. Sign in with non-admin Google account
2. Navigate to `/admin/orders`
3. Expected: Redirect to `/auth/unauthorized` (if applicable)

**Scenario:** Admin user visits `/admin/orders`

Steps:
1. Sign in with admin Google account (leonardo.lech@gmail.com or leo@lbldomain.com)
2. Navigate to `/admin/orders`
3. Expected: Page loads with orders table

### Test 2: Orders List Display

**Initial Load:**
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] Orders table displays with headers
- [ ] Stats cards show correct counts

**Empty State:**
- [ ] If no orders exist, show "No orders found" message
- [ ] Empty state has Package icon and helpful text

**With Orders:**
- [ ] All order rows visible
- [ ] Dates formatted in pt-BR format (e.g., "01/11/2025")
- [ ] Prices show in R$ format with 2 decimals
- [ ] Item counts are accurate
- [ ] Status badges color-coded correctly

### Test 3: Search Functionality

**Test Scenarios:**

1. **Search by Order ID**
   - Type partial order ID
   - Expected: Table filters to matching orders
   - Clear search: Shows all orders again

2. **Search by Email**
   - Type customer email
   - Expected: Shows orders with matching email
   - Case-insensitive search works

3. **Search by Customer Name**
   - Type customer full name
   - Expected: Shows orders with matching name
   - Partial name matches work

4. **No Results**
   - Search term with no matches
   - Expected: Shows empty state

### Test 4: Status Filtering

**Filter Options:**
```
- All Orders (shows all)
- Payment: Pending (paymentStatus = PENDING)
- Payment: Confirmed (paymentStatus = CONFIRMED)
- Fulfillment: Pending (fulfillmentStatus = pending or null)
- Fulfillment: Processing (fulfillmentStatus = processing)
- Fulfillment: Shipped (fulfillmentStatus = shipped)
- Fulfillment: Delivered (fulfillmentStatus = delivered)
```

**Test Each Filter:**
- [ ] Select filter option
- [ ] Page fetches filtered results
- [ ] Stats update for filtered view
- [ ] Clear filter to All Orders

**Combined Filters:**
- [ ] Status filter + Search = correct results
- [ ] Changing filter updates table instantly
- [ ] Stats cards update with filtered data

### Test 5: CSV Export

**Test Steps:**
1. Click "Export CSV" button
2. Check browser downloads
3. Open CSV file in text editor

**Validation:**
- [ ] File named `orders-YYYY-MM-DD.csv`
- [ ] Headers present: Order ID, Date, Customer Name, Email, etc.
- [ ] All confirmed orders included
- [ ] No unconfirmed orders included
- [ ] Data formatting correct (quotes for addresses, etc.)
- [ ] Dates in pt-BR format
- [ ] Prices with 2 decimal places

**CSV Structure:**
```
Order ID,Date,Customer Name,Email,Phone,Address,City,State,ZIP,Items,Quantity,Total,Status,Tracking
ORD-123,01/11/2025,John Doe,john@example.com,...
```

### Test 6: Order Detail Modal

**Opening Modal:**
1. Click "View" button on any order row
2. Or click anywhere on the order row
3. Expected: Modal slides in with animation

**Modal Content Verification:**
- [ ] Order Information section displays:
  - Order ID (complete, not truncated)
  - Date and time
  - Payment status
  - Payment hash (first 16 chars)

- [ ] Items section shows:
  - Product name
  - Quantity
  - Individual subtotal (price × qty)
  - Total at bottom

- [ ] Shipping Address displays:
  - Full name
  - Email
  - Phone
  - Complete address
  - City, State, ZIP

**Editable Fields:**
- [ ] Fulfillment Status dropdown contains all options
- [ ] Tracking Number input accepts text
- [ ] Admin Notes textarea accepts multi-line text

**Modal Actions:**
- [ ] Close button (X) works
- [ ] Cancel button closes modal
- [ ] Click backdrop closes modal
- [ ] Cannot interact with page behind modal

### Test 7: Fulfillment Management

**Update Fulfillment Status:**

1. Open order detail modal
2. Change "Fulfillment Status" dropdown
3. Select new status (e.g., "processing")
4. Click "Save Changes"
5. Expected: Loading state shows, then closes
6. Verify: Modal closes and order status updated in table

**Add Tracking Number:**

1. Open order modal
2. Enter tracking number (e.g., "BR123456789")
3. Click "Save Changes"
4. Expected: Saved successfully
5. Verify: Can reopen modal and tracking number persists

**Add Admin Notes:**

1. Open order modal
2. Enter admin notes (e.g., "Customer called asking about delivery")
3. Click "Save Changes"
4. Expected: Saved successfully
5. Verify: Notes persist on reopening modal

**Error Handling:**
- [ ] If update fails, show error indication
- [ ] Clicking Save while saving shows "Saving..." state
- [ ] Cancel button always works
- [ ] Can retry after error

### Test 8: Responsive Design

**Desktop (1920px+):**
- [ ] All columns visible without horizontal scroll
- [ ] Stats cards in 4-column grid
- [ ] Controls in single row

**Tablet (768px - 1024px):**
- [ ] Stats cards in 2-column grid
- [ ] Controls flex to fit
- [ ] Table may scroll horizontally

**Mobile (375px - 480px):**
- [ ] Stats cards stack to 2 columns (pairs)
- [ ] Search and filter stack vertically
- [ ] Table has horizontal scroll
- [ ] Modal fits screen (max-height: 90vh)
- [ ] Modal padding and font sizes readable

**Test on Real Devices:**
```bash
# Use Chrome DevTools device emulation
# Test: iPhone SE, iPad, Samsung Galaxy
# Also test with actual devices if available
```

### Test 9: Loading States

**Initial Load:**
- [ ] Shows spinner while fetching orders
- [ ] Spinner styled correctly
- [ ] Loading duration reasonable (< 2 seconds typical)

**Filter Change:**
- [ ] Shows brief loading state when filter changes
- [ ] Results update smoothly
- [ ] No flashing or jumping

**Save Operation:**
- [ ] Save button shows "Saving..." while pending
- [ ] Button disabled during save
- [ ] Shows success (modal closes) or error

### Test 10: Data Validation

**Verify API Responses:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Trigger actions and check:

**GET /api/admin/orders**
- [ ] Status 200
- [ ] Response has structure: `{ success: true, data: { orders: [...], total: N, ... } }`
- [ ] Orders array contains correct fields

**PATCH /api/admin/orders/[id]**
- [ ] Status 200
- [ ] Response returns updated order
- [ ] updatedAt timestamp changed
- [ ] Changes reflected in database

**GET /api/admin/orders/export**
- [ ] Status 200
- [ ] Content-Type: text/csv
- [ ] Content-Disposition: attachment
- [ ] File downloads correctly

### Test 11: Edge Cases

**Large Order Lists:**
- [ ] Performance acceptable with 100+ orders
- [ ] Search/filter still responsive
- [ ] No memory leaks (check DevTools)

**Long Customer Names/Addresses:**
- [ ] Text wraps or truncates appropriately
- [ ] Modal displays full text
- [ ] CSV escapes special characters

**Special Characters:**
- [ ] Names with accents (e.g., "João")
- [ ] Addresses with quotes or commas
- [ ] CSV export handles escaping correctly

**Missing Optional Fields:**
- [ ] Orders without trackingNumber display correctly
- [ ] Orders without adminNotes don't show "undefined"
- [ ] Null/undefined fields handled gracefully

**Concurrent Updates:**
- [ ] If two modals open for same order, handle appropriately
- [ ] Last update wins (if simultaneous saves)
- [ ] No data corruption

### Test 12: Browser Compatibility

Test on:
- [ ] Chrome 120+ (latest)
- [ ] Firefox 121+ (latest)
- [ ] Safari 17+ (latest)
- [ ] Edge 120+ (latest)

**Check for:**
- [ ] CSS compatibility (no unsupported properties)
- [ ] JavaScript compatibility (no console errors)
- [ ] Modal backdrop filter (blur effect)
- [ ] Animations smooth

## Performance Testing

### Load Time
```
npm run build && npm run start
# Navigate to /admin/orders
# Check DevTools Performance tab
# Target: First Paint < 1s, Largest Paint < 2s
```

### Search Performance
```
# Type in search with 100+ orders
# Check response time
# Target: < 100ms for filtering
```

### Export Performance
```
# Export with 500+ orders
# Check time to generate and download
# Target: < 5 seconds
```

## Security Testing

1. **Authentication Bypass:**
   - [ ] Cannot access without session
   - [ ] Cannot access with forged token
   - [ ] Session validation works

2. **Authorization Check:**
   - [ ] Non-admin cannot use API endpoints
   - [ ] Admin-only endpoints reject unauthorized

3. **XSS Prevention:**
   - [ ] Input fields escape HTML
   - [ ] No script injection possible
   - [ ] Admin notes display safely

4. **CSRF Protection:**
   - [ ] NextAuth CSRF tokens validated
   - [ ] POST/PATCH requests protected

## Accessibility Testing

### Keyboard Navigation
```
- Tab through all form inputs
- Enter to submit
- Escape to close modal
- All buttons reachable via keyboard
```

### Screen Reader (NVDA/JAWS)
```
- Announce table headers
- Announce status badges
- Describe button purposes
- Read modal content
```

### Color Contrast
```
DevTools > Accessibility > Color Contrast
Target: AA standard (4.5:1 for text, 3:1 for UI)
```

## Troubleshooting

### Orders Not Loading
```
1. Check Network tab - is /api/admin/orders called?
2. Is session valid? Check cookies
3. Check console for JavaScript errors
4. Verify NextAuth configured correctly
5. Verify Vercel KV connection
```

### Modal Not Opening
```
1. Check for JavaScript errors in console
2. Verify Framer Motion installed
3. Check onClick handlers
4. Clear browser cache
```

### Export Not Working
```
1. Verify GET /api/admin/orders/export responds
2. Check CORS headers (should have Content-Type: text/csv)
3. Check browser download settings
4. Try different browser
```

### Save Changes Not Working
```
1. Check PATCH response in Network tab
2. Verify order ID passed correctly
3. Check for validation errors
4. Check Vercel KV connection
5. Verify admin session still valid
```

## Test Data Requirements

For complete testing, need sample orders:

```typescript
// Sample order for testing
{
  orderId: "ORD-2025-11-001",
  items: [
    {
      id: "prod-1",
      name: "T-Shirt Classic",
      price: 49.90,
      quantity: 2
    }
  ],
  subtotal: 99.80,
  shipping: 10.00,
  total: 109.80,
  shippingAddress: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100"
  },
  paymentStatus: "CONFIRMED",
  paymentHash: "hash_2024...",
  createdAt: "2025-11-01T10:30:00Z",
  updatedAt: "2025-11-01T10:30:00Z",
  fulfillmentStatus: "pending"
}
```

To add test data:
```bash
# Use Vercel KV CLI or API to insert sample orders
# OR use the checkout flow to create real orders
```

## Sign-Off Checklist

- [ ] Build completes without errors
- [ ] All TypeScript types valid
- [ ] All tests pass from Test 1-12
- [ ] Performance acceptable
- [ ] Responsive on all screen sizes
- [ ] Accessible to keyboard and screen readers
- [ ] No security vulnerabilities
- [ ] Documentation complete and accurate
- [ ] Ready for production deployment

## Report Template

```markdown
## Admin Orders Dashboard - Testing Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Development / Staging / Production

### Summary
- Total Tests: 12
- Passed: XX
- Failed: XX
- Blocked: XX

### Critical Issues
[List any blockers]

### Major Issues
[List any failures]

### Minor Issues
[List any warnings/observations]

### Recommendations
[Improvements or next steps]

### Approved for Production
- [ ] Yes, all critical issues resolved
- [ ] No, issues remain
```

---

## Running Tests Programmatically

```bash
# Install testing dependencies (optional)
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run build validation
npm run build

# Start dev server for manual testing
npm run dev

# Then navigate to:
# http://localhost:3000/admin/orders
```

## Continuous Integration

For GitHub Actions / CI/CD:
```yaml
- name: Build
  run: npm run build

- name: TypeScript Check
  run: npx tsc --noEmit

- name: Deploy
  run: # your deployment script
```

---

**Total Expected Test Duration:** 1-2 hours (comprehensive)
**Quick Smoke Test Duration:** 15-20 minutes

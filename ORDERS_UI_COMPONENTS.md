# Admin Orders Dashboard - UI Components Reference

## Component Hierarchy

```
AdminOrdersPage
├── Header
│   ├── Package Icon
│   ├── Title: "Orders Management"
│   └── Button: "Back to Dashboard"
│
├── Main Content Container
│   ├── Controls Section
│   │   ├── Search Input
│   │   ├── Status Filter Select
│   │   └── Export CSV Button
│   │
│   ├── Statistics Section
│   │   ├── Stat Card: Total Orders
│   │   ├── Stat Card: Pending
│   │   ├── Stat Card: Shipped
│   │   └── Stat Card: Total Revenue
│   │
│   ├── Orders Table
│   │   ├── Table Header
│   │   │   ├── Order ID
│   │   │   ├── Date
│   │   │   ├── Customer
│   │   │   ├── Items
│   │   │   ├── Total
│   │   │   ├── Payment
│   │   │   ├── Fulfillment
│   │   │   └── Actions
│   │   └── Table Body
│   │       └── Order Rows (animated)
│   │
│   └── Order Detail Modal (conditional)
│       ├── Modal Header with Close Button
│       ├── Order Information Section
│       ├── Items Section
│       ├── Shipping Address Section
│       ├── Fulfillment Management Section
│       └── Action Buttons (Save/Cancel)
│
└── Loading/Empty States
    ├── Loading Spinner
    └── Empty State Message
```

---

## Component Specifications

### Header Component

**Structure:**
```
┌────────────────────────────────────────────────────┐
│ [Package] Orders Management    [Back to Dashboard] │
└────────────────────────────────────────────────────┘
```

**CSS Classes:**
```
Container:     header border-b bg-card sticky top-0 z-40 backdrop-blur
Content:       container mx-auto px-4 py-4
Flex Group:    flex items-center justify-between
Left Side:     flex items-center gap-3
Icon:          Package w-6 h-6
Title:         text-2xl font-bold
Right Button:  px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition
```

**Responsive:**
- Desktop: All elements visible
- Mobile: Button text possibly hidden, still clickable

---

### Search Input Component

**Structure:**
```
[Search] Search by order ID, email, or customer name...
```

**CSS Classes:**
```
Container:     flex-1 relative
Icon:          absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground
Input:         w-full pl-10 pr-4 py-2 border rounded-lg bg-background
               focus:outline-none focus:ring-2 focus:ring-primary
```

**Behavior:**
- Real-time filtering as user types
- No debounce (instant filtering)
- Case-insensitive matching
- Searches 3 fields simultaneously

**Placeholder Text:**
"Search by order ID, email, or customer name..."

---

### Status Filter Select Component

**Structure:**
```
┌─────────────────────────┐
│ All Orders           ▼  │
└─────────────────────────┘
  Options:
  - All Orders
  - Payment: Pending
  - Payment: Confirmed
  - Fulfillment: Pending
  - Fulfillment: Processing
  - Fulfillment: Shipped
  - Fulfillment: Delivered
```

**CSS Classes:**
```
Container:     px-4 py-2 border rounded-lg bg-background
               focus:outline-none focus:ring-2 focus:ring-primary
```

**Behavior:**
- onChange triggers API call
- Updates orders list
- Updates statistics
- Preserves search query

---

### Export Button Component

**Structure:**
```
┌──────────────────┐
│ [Download] Export CSV │
└──────────────────┘
```

**CSS Classes:**
```
Button:        px-6 py-2 rounded-lg bg-primary text-primary-foreground
               font-semibold flex items-center gap-2 hover:opacity-90 transition
Icon:          Download w-4 h-4
Text:          Export CSV
```

**Behavior:**
- Triggers CSV generation
- Downloads file to user's device
- Filename: `orders-YYYY-MM-DD.csv`
- Only includes confirmed orders

---

### Statistic Cards Component

**Structure:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Orders │ │   Pending    │ │   Shipped    │ │Total Revenue │
│      12      │ │      5       │ │      3       │ │ R$ 1,234.56  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**CSS Classes:**
```
Container:     grid grid-cols-2 md:grid-cols-4 gap-4
Card:          bg-card rounded-lg p-4 border
Label:         text-sm text-muted-foreground mb-1
Value:         text-2xl font-bold
```

**Cards:**
1. Total Orders - Count of filtered orders
2. Pending - Count with fulfillmentStatus = pending
3. Shipped - Count with fulfillmentStatus = shipped
4. Total Revenue - Sum of all order.total values

**Responsive:**
- Mobile: 2 columns (stacks as 2x2 grid)
- Tablet: 4 columns
- Desktop: 4 columns

---

### Orders Table Component

**Structure:**
```
┌────────────┬─────────┬──────────────┬─────────┬─────────┬─────────┬────────────┬────────┐
│ Order ID   │ Date    │ Customer     │ Items   │ Total   │ Payment │ Fulfillment│ Actions│
├────────────┼─────────┼──────────────┼─────────┼─────────┼─────────┼────────────┼────────┤
│ORD-123..   │01/11/25 │John Doe      │ 2      │R$ 99.80 │ Conf... │ pending    │ View   │
│            │         │john@ex...    │        │         │         │            │        │
├────────────┼─────────┼──────────────┼─────────┼─────────┼─────────┼────────────┼────────┤
│ORD-456..   │30/10/25 │Jane Smith    │ 1      │R$ 49.90 │ Pending │ shipped    │ View   │
│            │         │jane@ex...    │        │         │         │            │        │
└────────────┴─────────┴──────────────┴─────────┴─────────┴─────────┴────────────┴────────┘
```

**CSS Classes:**
```
Container:     bg-card rounded-lg border overflow-hidden
Scroll:        overflow-x-auto
Table:         w-full
Header Row:    bg-muted/50 border-b
Header Cells:  px-4 py-3 text-left text-sm font-semibold
Body Row:      border-b hover:bg-muted/30 transition cursor-pointer
Body Cells:    px-4 py-3
```

**Column Specifications:**

| Column | Width | Format | Action |
|--------|-------|--------|--------|
| Order ID | - | First 12 chars + ... | Clickable |
| Date | - | dd/mm/yyyy | Display |
| Customer | - | Name + Email stacked | Display |
| Items | - | Count (e.g., "2 item(s)") | Display |
| Total | - | R$ with 2 decimals | Display |
| Payment | - | Status badge | Display |
| Fulfillment | - | Status badge | Display |
| Actions | - | "View" link | Opens modal |

**Status Badges:**

**Payment Status:**
```
CONFIRMED  → emerald (green)    bg-emerald-500/20 text-emerald-700
PENDING    → amber (yellow)     bg-amber-500/20 text-amber-700
FAILED     → rose (red)         bg-rose-500/20 text-rose-700
```

**Fulfillment Status:**
```
delivered   → emerald (green)    bg-emerald-500/20 text-emerald-700
shipped     → blue               bg-blue-500/20 text-blue-700
processing  → amber (yellow)     bg-amber-500/20 text-amber-700
pending     → muted (gray)       bg-muted text-muted-foreground
```

**Responsive Behavior:**
- Desktop (1024px+): All columns visible
- Tablet (768px-1023px): Table may scroll
- Mobile (< 768px): Horizontal scroll
- Text sizes reduce on mobile

**Animations:**
- Row entrance: Fade in (opacity 0 → 1)
- Row hover: Slight background change
- Duration: 0.3s
- Easing: Smooth (Framer Motion default)

---

### Order Detail Modal Component

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ Order Details                                    X       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Order Information                                        │
│ ┌──────────────────────┬──────────────────────┐        │
│ │ Order ID             │ ORD-123abc...       │        │
│ │ ORD-123...           │ Date: 01/11/25 10:30│        │
│ └──────────────────────┴──────────────────────┘        │
│                                                          │
│ Items                                                    │
│ ┌──────────────────────────────────────────┐            │
│ │ T-Shirt Classic         Qty: 2           │            │
│ │ Price: R$ 99.80                          │            │
│ └──────────────────────────────────────────┘            │
│ Total: R$ 109.80                                        │
│                                                          │
│ Shipping Address                                         │
│ ┌──────────────────────────────────────────┐            │
│ │ John Doe                                 │            │
│ │ john@example.com                         │            │
│ │ Rua das Flores, 123                      │            │
│ │ São Paulo, SP 01310-100                  │            │
│ └──────────────────────────────────────────┘            │
│                                                          │
│ Fulfillment Management                                   │
│ Status: [Processing ▼]                                  │
│ Tracking: [BR123456789              ]                  │
│ Notes: [Customer called, asked...   ]                  │
│                                                          │
│ [Save Changes]  [Cancel]                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**CSS Classes:**

```
Backdrop:      fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4
Modal:         bg-card rounded-xl border shadow-2xl max-w-3xl w-full
               max-h-[90vh] overflow-y-auto
Header:        sticky top-0 bg-card border-b px-6 py-4 flex items-center
               justify-between
Content:       p-6 space-y-6
Section:       [space-y-3 per section]
```

**Animation:**
```
Entrance:      scale (0.9 → 1.0), opacity (0 → 1)
Duration:      0.2s
Easing:        ease-in-out
```

**Sections:**

1. **Order Information**
   - 2-column grid
   - Order ID, Date
   - Payment Status, Payment Hash
   - Read-only display

2. **Items**
   - Item list (one per line)
   - Name, quantity, subtotal
   - Total at bottom with border-top
   - Calculated subtotals

3. **Shipping Address**
   - 1-column display
   - Name, email, phone
   - Address with divider
   - City, State, ZIP

4. **Fulfillment Management**
   - 3 input fields
   - Status dropdown (5 options)
   - Tracking number input
   - Admin notes textarea (3 rows)
   - Editable by admin

5. **Action Buttons**
   - Save Changes (primary, flex-1)
   - Cancel (secondary)
   - Disabled during save
   - Shows "Saving..." text

**Interaction:**
- Click outside (backdrop): Close
- Click X button: Close
- Click modal content: No action
- Tab navigation through inputs
- Enter on button: Trigger action
- Escape key: Close (via backdrop)

---

### Loading State Component

**Structure:**
```
     [Loading Spinner]
```

**CSS Classes:**
```
Container:     flex items-center justify-center py-12
Spinner:       w-8 h-8 animate-spin
```

**Animation:**
- Continuous rotation
- 1s per rotation (Tailwind default)
- Smooth animation

---

### Empty State Component

**Structure:**
```
        [Package Icon]
      No orders found
  Orders will appear here when customers make purchases
```

**CSS Classes:**
```
Container:     text-center py-12 bg-card rounded-lg border
Icon:          w-12 h-12 mx-auto mb-4 text-muted-foreground
Title:         text-lg font-semibold mb-2
Subtitle:      text-muted-foreground
```

**Displayed When:**
- No orders exist in filtered view
- All results filtered out by search/status

---

## Color Palette

### Base Colors (Tailwind)
```
Background:     bg-background      (page background)
Card:          bg-card            (card/container background)
Border:        border             (1px solid border)
Text:          text-foreground    (primary text)
Muted:         text-muted-foreground (secondary text)
```

### Interactive Colors
```
Primary:       bg-primary         (buttons, highlights)
Primary Text:  text-primary-foreground (text on primary)
Muted:         bg-muted           (secondary buttons)
```

### Status Colors
```
Success:       emerald-500        (delivered, confirmed)
Warning:       amber-500          (pending, processing)
Error:         rose-500           (failed)
Info:          blue-500           (shipped)
Neutral:       muted              (default, gray)
```

### Opacity Variants
```
/20            - 20% opacity (backgrounds)
/30            - 30% opacity (hover states)
/50            - 50% opacity (secondary backgrounds)
/60            - 60% opacity (backdrops)
/80            - 80% opacity (hover, focus)
```

---

## Typography

### Font Sizes
```
Display:       text-2xl font-bold   (main title)
Section:       font-semibold        (section headers)
Body:          text-base (default)  (regular text)
Small:         text-sm              (labels, metadata)
Tiny:          text-xs              (badges, hints)
```

### Font Weights
```
Regular:       font-normal   (default)
Medium:        font-medium   (emphasized)
Semibold:      font-semibold (headers, important)
Bold:          font-bold     (titles, strong)
Mono:          font-mono     (codes, IDs)
```

---

## Spacing System

### Margins/Padding (Tailwind units, 4px base)
```
px-2 = 8px    (small)
px-3 = 12px   (medium)
px-4 = 16px   (medium-large)
px-6 = 24px   (large)

py-2 = 8px    (vertical small)
py-3 = 12px   (vertical medium)
py-4 = 16px   (vertical medium-large)
py-8 = 32px   (vertical large)
```

### Gaps
```
gap-2 = 8px   (tight)
gap-3 = 12px  (medium)
gap-4 = 16px  (default)
gap-6 = 24px  (large)
```

---

## Responsive Breakpoints

### Tailwind Breakpoints
```
Default/Mobile:  0px         (< 640px)
sm:             640px        (≥ 640px)
md:             768px        (≥ 768px)
lg:             1024px       (≥ 1024px)
xl:             1280px       (≥ 1280px)
2xl:            1536px       (≥ 1536px)
```

### Layout Changes
```
Mobile:
  - Stats: 2 columns (2x2 grid)
  - Table: Horizontal scroll
  - Controls: Stacked vertically

Tablet (md):
  - Stats: 4 columns
  - Table: May scroll
  - Controls: Flex row

Desktop (lg+):
  - All full width
  - No scrolling needed
  - Optimal spacing
```

---

## Interaction States

### Button States
```
Default:       bg-primary text-primary-foreground
Hover:         hover:opacity-90 (slightly transparent)
Focus:         focus:ring-2 focus:ring-primary (keyboard)
Disabled:      disabled:opacity-50
Loading:       Shows "Saving..." text
```

### Input States
```
Default:       border bg-background
Focus:         focus:outline-none focus:ring-2 focus:ring-primary
Active:        Has content (no visual change)
Placeholder:   text-muted-foreground
```

### Row States
```
Default:       border-b
Hover:         hover:bg-muted/30 transition
Active:        Selected by click (opens modal)
```

---

## Animations

### Entrance Animations
```
Fade In:       opacity: 0 → 1
               duration: 0.3s
               easing: ease-in-out

Scale In:      scale: 0.9 → 1
               opacity: 0 → 1
               duration: 0.2s
               easing: ease-in-out

Slide Down:    y: -10 → 0
               opacity: 0 → 1
               duration: 0.2s
```

### Hover Animations
```
Background:    smooth transition 0.2s
Opacity:       smooth transition 0.2s
Transform:     smooth transition 0.2s
```

### Loading Animations
```
Spin:          rotate: 0deg → 360deg
               duration: 1s
               repeat: infinite
               easing: linear
```

---

## Accessibility Features

### Visual Indicators
```
Focus:         ring-2 ring-primary (keyboard navigation)
Color:         text labels + background color (status)
Contrast:      4.5:1 minimum (WCAG AA)
Text:          Clear, descriptive labels
```

### Interactive Elements
```
Buttons:       min 44px height (touch-friendly)
Inputs:        Clear labels, visible focus
Dropdowns:     Standard select element
Links:         Underlined, color contrast
```

### Semantic HTML
```
<table>         Orders table
<button>        All interactive elements
<input>         Form inputs
<label>         Form labels (implicit/explicit)
<select>        Status filter dropdown
<textarea>      Admin notes
<header>        Page header
<h1>, <h2>     Heading hierarchy
```

---

## Dark Mode Support

All colors use CSS custom properties (Tailwind):
```
background  → CSS var(--background)
card        → CSS var(--card)
primary     → CSS var(--primary)
etc.
```

Dark mode automatically supported via Tailwind's `dark:` prefix if needed.

---

## Icon Library (Lucide React)

Used Icons:
```
Package      - Orders section icon
Search       - Search field icon
Filter       - Filter indication
Download    - Export button
Loader2      - Loading spinner
LogOut       - Sign out button (in admin page)
Brain        - Admin dashboard (in admin page)
```

All icons: w-4 h-4 or w-6 h-6, text color inherited

---

## Component Reusability

### Shared Components
- StatCard (in admin page)
- Buttons (custom, no separate component)
- Modal (inline, not extracted)
- Table (inline, not extracted)

### Possible Extractions
1. Search Input
2. Status Filter
3. Stat Cards
4. Status Badges
5. Modal Header
6. Modal Footer

### Usage Pattern
```typescript
import { SearchInput } from '@/components/admin/SearchInput'
import { StatusBadge } from '@/components/admin/StatusBadge'
```

---

## Performance Considerations

### Render Optimizations
- Conditional rendering for modal
- Table row animations use Framer Motion
- No unnecessary re-renders

### Image Optimization
- All icons are SVG (Lucide)
- No raster images
- Minimal payload

### CSS Optimization
- Tailwind CSS (production build removes unused)
- Only used classes in final bundle
- No CSS-in-JS runtime

---

## Testing Considerations

### Component Testing
- Test search input onChange
- Test status filter onChange
- Test modal open/close
- Test form submission
- Test export button click

### Integration Testing
- Verify API calls on filter change
- Verify modal updates from API
- Verify stats calculate correctly

### Visual Regression
- Compare screenshots on changes
- Check responsive behavior
- Verify animations smooth

---

## Browser Compatibility

### CSS Features Used
- CSS Grid (supported in all modern browsers)
- CSS Flexbox (supported in all modern browsers)
- CSS Backdrop Filter (supported in Chrome 76+, Safari 9+)
- CSS Transitions (supported everywhere)
- CSS Custom Properties (Tailwind)

### JavaScript Features
- Fetch API (ES6+)
- Template Literals (ES6+)
- Arrow Functions (ES6+)
- Destructuring (ES6+)
- Optional Chaining (ES2020)

All transpiled by Next.js for compatibility.

---

## Conclusion

This reference document provides complete specifications for all UI components in the Admin Orders Dashboard. Use this as a guide for:
- Understanding component structure
- Making consistent design decisions
- Adding new components
- Maintaining visual consistency
- Testing and QA

For component code, refer to `/app/admin/orders/page.tsx`.

---

Last Updated: November 1, 2025

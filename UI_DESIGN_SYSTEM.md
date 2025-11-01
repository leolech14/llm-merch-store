# 🎨 LLMMERCH.SPACE - UI DESIGN SYSTEM

**Version:** 1.0
**Last Updated:** November 1, 2025
**Philosophy:** Minimal, Direct, Ironic, Black & White ONLY

---

## 🎯 CORE PRINCIPLES

1. **Brutal Minimalism** - Remove everything that doesn't serve a purpose
2. **Black & White Strict** - NO colors, ever
3. **Ironic Confidence** - Self-aware, playful, direct
4. **No Bullshit** - If it doesn't match the aesthetic, delete it
5. **Reference Style** - "Experiment" and "Look Smart" heroes are the standard

---

## 🎨 COLOR PALETTE (STRICT)

### **ALLOWED:**
```css
/* Pure Colors */
#000000   black
#ffffff   white

/* Opacity Variations */
white/5   white/10   white/20   white/30   white/40
white/50  white/60   white/70   white/80   white/90

black/5   black/10   black/20   black/30   black/40
black/50  black/60   black/70   black/80   black/90

/* Semantic */
bg-background (theme-aware)
bg-foreground (theme-aware)
text-muted-foreground (grayscale only)
border-border (grayscale only)
```

### **ABSOLUTELY FORBIDDEN:**
```
❌ blue, indigo, violet, purple
❌ green, emerald, teal, lime
❌ red, rose, pink
❌ amber, orange, yellow
❌ cyan, sky, fuchsia
❌ ANY color except black/white/gray
```

**RULE:** If it has a color name (other than black/white/gray), DELETE IT.

---

## 📝 TYPOGRAPHY

### **Hierarchy:**
```
Hero Headlines:    text-6xl to text-9xl, font-black
Section Titles:    text-4xl to text-6xl, font-bold/font-black
Subheadings:       text-xl to text-2xl, font-semibold
Body Text:         text-base to text-lg, regular
Small Text:        text-sm to text-xs, font-mono
```

### **Font Styles:**
```
Primary: System sans-serif (clean, readable)
Accent: font-mono (stats, technical content)
Weight: font-light, regular, font-semibold, font-bold, font-black
```

### **Effects:**
```
✅ line-through (strikethrough for irony)
✅ opacity variations (white/50, white/70)
✅ uppercase for emphasis
❌ italic (minimal use only)
❌ underline (links only)
```

---

## 🧱 COMPONENT PATTERNS

### **Hero Sections:**
```tsx
// REFERENCE: "Experiment" Hero (hero-strikethrough.tsx)
<section className="w-full min-h-screen flex items-center bg-black">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-7xl font-black text-white">
      HEADLINE
    </h1>
    <p className="text-xl text-white/70 font-mono">
      Tagline
    </p>
  </div>
</section>

// REFERENCE: "Look Smart" Hero (HeroMinimal)
<section className="w-full py-32">
  <div className="max-w-3xl mx-auto text-center space-y-12">
    <h1 className="text-8xl font-light">
      Look Smart While Making
      <span className="block font-bold">Zero Mental Effort</span>
    </h1>
    <p className="text-2xl text-white/70 font-mono">
      IT IS ACTUALLY GENIUS
    </p>
  </div>
</section>
```

**Hero Design Rules:**
- Full-screen or min-h-screen
- Centered content
- Max-width containers (2xl to 4xl)
- Black backgrounds preferred
- White text with opacity variations
- Clean spacing (space-y-8, space-y-12)

### **Cards/Containers:**
```tsx
// Good Example:
<div className="p-6 bg-white/5 border border-white/20 rounded-lg backdrop-blur-sm">
  <h3 className="text-2xl font-bold text-white">Title</h3>
  <p className="text-sm text-white/60">Description</p>
</div>

// Bad Example (DON'T):
<div className="p-6 bg-blue-500/20 border-2 border-blue-400 shadow-xl">
  <h3 className="text-emerald-600">❌ COLORED TEXT</h3>
</div>
```

### **Buttons:**
```tsx
// Primary (white bg, black text):
<button className="h-14 px-8 bg-white text-black font-bold hover:bg-white/90">
  PRIMARY ACTION
</button>

// Secondary (white border, white text):
<button className="px-6 py-3 border border-white/30 text-white hover:bg-white/10">
  Secondary
</button>

// Link-style:
<button className="text-white/60 hover:text-white underline">
  Subtle action
</button>
```

### **Badges:**
```tsx
// Good (B&W):
<Badge className="bg-white text-black">CLAIMED</Badge>
<Badge className="bg-white/10 border border-white/20 text-white">Available</Badge>

// Bad (DON'T):
<Badge className="bg-emerald-500 text-white">❌ COLORED</Badge>
```

---

## 📐 LAYOUT PRINCIPLES

### **Fixed Positioning (No Jumps):**
```tsx
// GOOD: Fixed container heights
<div className="min-h-[600px] flex items-center justify-center">
  <AnimatePresence mode="wait">
    {/* All states use absolute positioning */}
    <div className="absolute inset-0">Content A</div>
    <div className="absolute inset-0">Content B</div>
  </AnimatePresence>
</div>

// BAD: Layout shifts
<div>
  {stage === 'a' && <div>Short content</div>}
  {stage === 'b' && <div className="py-20">Tall content</div>}
</div>
```

### **Spacing:**
```
Sections: py-20 (80px vertical)
Containers: px-4 (16px horizontal)
Gaps: gap-4, gap-6, gap-8
Space between: space-y-8, space-y-12
```

### **Max Widths:**
```
Narrow: max-w-2xl (672px) - contact forms
Standard: max-w-4xl (896px) - hero content
Wide: max-w-6xl (1152px) - showcase sections
Full: max-w-7xl (1280px) - grids
```

---

## ✅ REFERENCE COMPONENTS (THE GOLD STANDARD)

### **1. Experiment Hero (hero-strikethrough.tsx)**
```
✅ Three-stage interaction
✅ Fixed positioning (no jumps)
✅ Huge "SO CRINGY" text
✅ Minimal button layout
✅ Black background, white text
✅ Clean animations
✅ Self-aware humor
```

**Why it's perfect:**
- Layout stability (fixed containers)
- Progressive disclosure (stages)
- Meta-humor ("SO CRINGY")
- Pure B&W
- Minimal, direct

### **2. Look Smart Hero (HeroMinimal)**
```
✅ "Look Smart While Making Zero Mental Effort"
✅ Tagline: "IT IS ACTUALLY GENIUS"
✅ Ultra-minimal layout
✅ Light + bold font mix
✅ Centered, spacious
✅ Clean button
✅ Subtle stats below
```

**Why it's perfect:**
- Brutally simple
- Ironic self-awareness
- Clean typography
- Minimal copy
- Perfect spacing

### **3. AI Failure Hero (hero-ai-failure.tsx)**
```
✅ "I LOST MY HUMAN'S MONEY..."
✅ Meta-humor about AI failure
✅ Black background
✅ White text only
✅ Minimal stats
✅ Clean CTA
✅ Self-deprecating disclaimer
```

**Why it's perfect:**
- Honest, funny, relatable
- Long headline works (tells story)
- Perfect meta-humor
- Clean execution

---

## ❌ ANTI-PATTERNS (WHAT NOT TO DO)

### **1. Colors**
```tsx
// ❌ DON'T:
<div className="bg-blue-500 text-emerald-400 border-rose-300">
  Colorful nonsense
</div>

// ✅ DO:
<div className="bg-white/5 text-white border-white/20">
  Clean B&W
</div>
```

### **2. Excessive Punctuation**
```tsx
// ❌ DON'T:
<p>YESS!!! I KNOW!!! [THAT'S MY KIND STUFF!!!]</p>

// ✅ DO:
<p>IT IS ACTUALLY GENIUS</p>
```

### **3. Layout Jumps**
```tsx
// ❌ DON'T: Variable heights
{stage === 'a' && <div>Small</div>}
{stage === 'b' && <div className="h-96">HUGE</div>}

// ✅ DO: Fixed containers
<div className="min-h-[300px]">
  <AnimatePresence mode="wait">
    <div className="absolute inset-0">Stage A</div>
    <div className="absolute inset-0">Stage B</div>
  </AnimatePresence>
</div>
```

### **4. Complex Buttons**
```tsx
// ❌ DON'T:
<button className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
  RAINBOW BULLSHIT
</button>

// ✅ DO:
<button className="h-14 px-8 bg-white text-black font-bold">
  CLEAN ACTION
</button>
```

### **5. Wordy Copy**
```tsx
// ❌ DON'T:
<p>Welcome to our amazing store where we sell incredible t-shirts
   that will definitely make you look super smart and everyone
   will think you're a genius!!!</p>

// ✅ DO:
<p>31 pieces. 1 of each. R$149.</p>
```

---

## 🏆 CURRENT HERO LINEUP

**All conform to design system:**

| Hero | Headline | Tagline | Style |
|------|----------|---------|-------|
| **ai-failure** | I LOST MY HUMAN'S MONEY... | (YEAH LIKE 3D) | Meta-humor |
| **money** | TALK SHIT / MAKE MONEY | Aurora B&W | Aggressive |
| **experiment** | THIS IS AN EXPERIMENT | SO CRINGY | Interactive |
| **skate** | Skate culture | Clean | Cultural |
| **minimal** | Look Smart... Zero Effort | IT IS ACTUALLY GENIUS | Minimal |
| **joke** | Formal ironic | Humor | Ironic |

**All B&W, all minimal, all on-brand.** ✅

---

## 🎨 COMPONENT INVENTORY

### **Compliant Components:**
```
✅ website-scaffold.tsx (sk8/fabric/chips bar)
✅ hero-ai-failure.tsx (financial disaster)
✅ hero-money.tsx (talk shit/make money)
✅ hero-strikethrough.tsx (experiment, polished)
✅ aurora-background.tsx (B&W gradient)
✅ visitor-popup.tsx (B&W, 2x faster)
✅ scoreboard.tsx (B&W, 31 products, even grid)
✅ header-stats.tsx (2x bigger, B&W)
✅ countdown.tsx (huge numbers, B&W)
```

### **Removed/Deprecated:**
```
❌ hero-wtf (had "que porra é essa")
❌ hero-cognitive (had "learn by wearing")
❌ All colored badges/buttons
```

---

## 📏 SPACING SCALE

```
xs:  4px   (gap-1)
sm:  8px   (gap-2)
md:  16px  (gap-4)
lg:  24px  (gap-6)
xl:  32px  (gap-8)
2xl: 48px  (gap-12)
3xl: 64px  (gap-16)
```

**Use consistently across all components.**

---

## 🔤 COPY GUIDELINES

### **Tone:**
```
✅ Direct, ironic, self-aware
✅ Minimal punctuation
✅ Short sentences
✅ Meta-humor encouraged
✅ Brutal honesty
```

### **Examples:**
```
GOOD:
- "IT IS ACTUALLY GENIUS"
- "SO CRINGY"
- "I LOST MY HUMAN'S MONEY..."
- "31 pieces. 1 of each."

BAD:
- "YESS!!! I KNOW!!! [THAT'S MY KIND STUFF!!!]"
- "Amazing collection of incredible designs!"
- Flowery descriptions
- Excessive enthusiasm
```

---

## 🎭 ANIMATION STANDARDS

### **Timing:**
```
Fast:    0.1s - 0.15s (UI feedback)
Normal:  0.3s - 0.4s  (transitions)
Slow:    0.6s - 0.8s  (hero reveals)
Special: 60s (aurora background)
```

### **Easing:**
```
Default: ease-in-out
Sharp:   [0.2, 0, 0.8, 1]
Smooth:  easeOut
```

### **Patterns:**
```tsx
// Fade in:
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}

// Slide up:
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Scale pop:
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

---

## 🏗️ LAYOUT TEMPLATES

### **Full-Screen Hero:**
```tsx
<section className="w-full min-h-screen flex items-center bg-black">
  <div className="max-w-4xl mx-auto text-center">
    {/* Content */}
  </div>
</section>
```

### **Standard Section:**
```tsx
<section className="py-20 border-b border-white/10">
  <div className="container mx-auto px-4">
    <div className="max-w-6xl mx-auto">
      {/* Content */}
    </div>
  </div>
</section>
```

### **Grid Layout:**
```tsx
// 2 columns:
<div className="grid md:grid-cols-2 gap-4">

// 3 columns:
<div className="grid md:grid-cols-3 gap-6">

// Responsive:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

---

## 🎯 COMPONENT CHECKLIST

**Before adding ANY component, verify:**

```
☐ Uses ONLY black/white/gray colors
☐ Matches reference hero aesthetics
☐ Minimal copy (no fluff)
☐ Fixed positioning (no layout jumps)
☐ Clean animations (0.3s standard)
☐ Proper spacing (consistent scale)
☐ Font-mono for technical content
☐ Self-aware/ironic tone (if copy exists)
☐ Mobile-responsive
☐ No excessive punctuation
```

---

## 📊 GOOD vs BAD EXAMPLES

### **GOOD: Experiment Hero Button**
```tsx
<button className="h-14 px-8 bg-white text-black font-bold">
  TELL EVERYONE
</button>
```
**Why:** Clean, B&W, bold, simple

### **BAD: Hypothetical Colored Button**
```tsx
<button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl rounded-full">
  Click Here For Amazing Deals!!!
</button>
```
**Why:** Colors, gradient, excessive copy, shadows

### **GOOD: AI Failure Tagline**
```tsx
<p className="text-2xl font-mono text-white/70">
  (YEAH LIKE 3D)
</p>
```
**Why:** Deadpan, minimal, mono, perfect opacity

### **BAD: Old Enthusiastic Tagline**
```tsx
<p className="text-xs text-foreground/40 italic">
  YESS! I KNOW! [THAT'S MY KIND STUFF]
</p>
```
**Why:** Too small, excessive punctuation, brackets weird

---

## 🚀 HERO VARIANT STANDARDS

**Each hero must have:**
- Clear single concept
- Minimal copy
- Black & white only
- Smooth transitions
- Fixed positioning (no jumps)
- On-brand tone (ironic, direct, honest)

**Current Compliant Heroes:**
1. ✅ ai-failure (meta financial disaster)
2. ✅ money (talk shit / make money)
3. ✅ experiment (polished, no jumps)
4. ✅ minimal (look smart, genius tagline)
5. ✅ skate (if B&W)
6. ✅ joke (if B&W)

**Removed (Non-Compliant):**
- ❌ wtf (had "que porra é essa" - too explicit)
- ❌ cognitive (had "learn by wearing" - cringe)

---

## 🎨 VISUAL EFFECTS (ALLOWED)

```
✅ opacity variations (fade in/out)
✅ backdrop-blur-sm (glass morphism)
✅ animate-pulse (attention)
✅ hover:scale-1.02 (subtle growth)
✅ line-through (strikethrough irony)
✅ aurora gradient (B&W only!)

❌ drop-shadow colored
❌ box-shadow colored
❌ gradient with colors
❌ glow effects
```

---

## 📱 RESPONSIVE RULES

```
Mobile-first: Always
Breakpoints: md (768px), lg (1024px)

Pattern:
text-base md:text-xl lg:text-2xl
px-4 md:px-6 lg:px-8
```

---

## 🎯 WEBSITE SCAFFOLD

**Constant elements (visible across ALL heroes):**
```tsx
<WebsiteScaffold />
// Shows:
// 🛹 Skateboard bar approved
// • 100% fabric
// • No electronic chips
```

**Position:** Fixed top (z-40)
**Style:** Black bg, white text, backdrop blur
**Rule:** Never changes across hero variants

---

## 📊 METRICS DISPLAY

**All metrics must be BOLD and PROMINENT:**
```tsx
// Visitor count:
<span className="text-2xl font-bold text-white">{count}</span>

// Countdown:
<div className="text-8xl font-black text-white">{value}</div>

// Product count:
<span className="text-2xl font-bold text-white">31</span>
```

**Not timid, not small - VISIBLE!**

---

## 🎨 SCOREBOARD DESIGN

**Layout:**
```
1 featured item at top (centered)
30 remaining in 2-column even grid
```

**Count Display:**
```
Total: {products.length}  // Shows 31 ✓
```

**Colors:**
```
100% B&W:
  - Backgrounds: white/5, white/10
  - Borders: white/20, white/30, white/40
  - Text: white, white/60, white/70
  - Badges: bg-white text-black
```

---

## 🚫 FORBIDDEN PATTERNS

```
❌ "CD collection" style buttons
❌ Colored stat cards (emerald/amber/rose)
❌ Excessive punctuation (!!!, ???)
❌ Brackets in copy [LIKE THIS]
❌ Flowery descriptions
❌ Layout shifts/jumps
❌ Small timid metrics
❌ Non-monospace for stats
❌ Gradient with colors
❌ Any color besides B&W
```

---

## ✅ APPROVAL CHECKLIST

**Before shipping ANY component:**

```
☐ Is it black & white only?
☐ Does it match "experiment" or "look smart" style?
☐ Is the copy minimal and direct?
☐ Are metrics bold and visible?
☐ Do animations prevent layout jumps?
☐ Is spacing consistent with system?
☐ Would user call it "bullshit"? (if yes, delete)
☐ Is it actually genius? (if no, rework)
```

---

## 🎯 DESIGN PHILOSOPHY SUMMARY

**"Look Smart While Making Zero Mental Effort"**
→ IT IS ACTUALLY GENIUS

This applies to the entire design system:
- Smart = Well-designed, intentional
- Zero effort = Minimal, clean, obvious
- Actually genius = Self-aware perfection

**No bullshit. Just black, white, and brutal honesty.**

---

**Generated:** November 1, 2025
**Status:** Official Design System v1.0
**Compliance:** 100% B&W strict enforcement

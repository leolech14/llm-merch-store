# LLMMERCH.SPACE - CLEANUP CHECKLIST

**Status:** Ready to execute
**Risk Level:** LOW - Non-breaking filesystem changes
**Estimated Time:** 2-3 hours

---

## PRIORITY 1: IMMEDIATE CLEANUP (< 30 minutes)

### 1.1 Delete Backup/Temp Files
```bash
# Navigate to project root
cd /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store

# Delete backup files
rm components/hero-variants/hero-strikethrough-complex.tsx.bak
rm components/hero-variants/hero-strikethrough.tsx.tmp

# Verify deletion
ls -la components/hero-variants/
```

**Check:** Should show only 3 files: hero-ai-failure.tsx, hero-money.tsx, hero-strikethrough.tsx

---

### 1.2 Delete Orphaned CartContext
```bash
# Delete unused context
rm context/CartContext.tsx

# Verify no imports exist
grep -r "CartContext\|useCart" . --include="*.tsx" --include="*.ts" --exclude-dir=node_modules

# Check result: Should return no output
ls -la context/
```

**Check:** context/ directory should be empty. grep should return 0 results.

---

### 1.3 Fix Type Definition
```bash
# Edit: types/api.ts line 78
# Change: telemetry?: any;
# To: telemetry?: Record<string, any>;
# Or: telemetry?: string | Record<string, unknown>;
```

**Check:** Verify `any` type is replaced with proper type

---

### 1.4 Update .gitignore (if needed)
```bash
# Append to .gitignore if not present:
echo "tsconfig.tsbuildinfo" >> .gitignore
echo ".DS_Store" >> .gitignore

# Verify
cat .gitignore | grep -E "tsbuildinfo|DS_Store"
```

---

## PRIORITY 2: DOCUMENTATION REORGANIZATION (1-1.5 hours)

### 2.1 Create Documentation Structure
```bash
# Create docs directory structure
mkdir -p docs/{integration,analysis,guides,tasks,archived}

echo "✓ Created: docs/integration/"
echo "✓ Created: docs/analysis/"
echo "✓ Created: docs/guides/"
echo "✓ Created: docs/tasks/"
echo "✓ Created: docs/archived/"
```

---

### 2.2 Move Integration/Setup Guides
```bash
# Integration guides
mv DOPPLER_SETUP.md docs/integration/
mv GET_CREDENTIALS_GUIDE.md docs/integration/
mv GOOGLE_LOGIN_SETUP.md docs/integration/
mv KV_SETUP_STATUS.md docs/integration/
mv KV_SETUP_LINE_BY_LINE.md docs/integration/
mv STORAGE_REALITY_CHECK.md docs/integration/
mv README_INTEGRATION.md docs/integration/

echo "✓ Moved 7 integration guides"
```

---

### 2.3 Move Analysis Reports
```bash
# Technical analysis
mv ANALYSIS_SUMMARY.txt docs/analysis/
mv ANALYSIS-SUMMARY.txt docs/analysis/ANALYSIS_SUMMARY_ALT.txt
mv ANALYSIS_INDEX.md docs/analysis/
mv api_analysis.md docs/analysis/
mv duplicate_code_examples.md docs/analysis/
mv INTEGRATION_ANALYSIS.md docs/analysis/
mv INTEGRATION-ANALYSIS.md docs/analysis/INTEGRATION_ANALYSIS_ALT.md
mv API-MISMATCH-QUICK-REFERENCE.md docs/analysis/
mv API_SPRAWL_CHECKLIST.md docs/analysis/
mv README_API_ANALYSIS.md docs/analysis/
mv INTEGRATION_CHECKLIST.md docs/analysis/
mv INTEGRATION_GAPS.txt docs/analysis/

echo "✓ Moved 12 analysis files"
```

---

### 2.4 Move User Guides
```bash
# User/Feature guides
mv PIX_PAYMENT_GUIDE.md docs/guides/
mv PIX_DIAGNOSIS_SUMMARY.md docs/guides/
mv PIX_TROUBLESHOOTING.md docs/guides/
mv PIX_QUICK_FIX.txt docs/guides/
mv QR_CODE_INSTRUCTIONS.md docs/guides/
mv QUICK_START.md docs/guides/
mv QUICK_REFERENCE.txt docs/guides/
mv PT-BR_TRANSLATION.md docs/guides/

echo "✓ Moved 8 user guides"
```

---

### 2.5 Move Task/Session Tracking
```bash
# Development session logs
mv TASK_1_ADMIN_AUDIT_REPORT.md docs/tasks/
mv TASK_2_AI_API_REPORT.md docs/tasks/
mv TASK_3_COLOR_COMPLETE.md docs/tasks/
mv TASK_3_COLOR_PROGRESS.md docs/tasks/
mv TASK_4_EXPERIMENT_HERO_COMPLETE.md docs/tasks/
mv DELIVERABLES.txt docs/tasks/
mv FINAL_SUMMARY.txt docs/tasks/
mv FINAL_SESSION_STATUS.md docs/tasks/
mv SESSION_COMPLETE.txt docs/tasks/
mv CONSOLIDATED_TASKS.md docs/tasks/
mv GAPS_FIXED_REPORT.md docs/tasks/
mv WORKER_PROGRESS.md docs/tasks/

echo "✓ Moved 12 task tracking files"
```

---

### 2.6 Move General Documentation
```bash
# General/architectural documentation
mv TECH_STACK_FLUENCY.md docs/guides/
mv UI_DESIGN_SYSTEM.md docs/guides/
mv UI_FLAWS_REPORT.md docs/guides/
mv UI_OVERHAUL_PLAN.md docs/guides/
mv AURORA_EXPLAINED.md docs/guides/
mv TAGLINE_OPTIONS.md docs/guides/
mv RESPONSIVENESS_REPORT.md docs/guides/
mv SPEED_IMPROVEMENTS.md docs/guides/
mv AI_PROVIDERS_COMPLETE.md docs/guides/
mv ADMIN_SYSTEM_COMPLETE.md docs/guides/

echo "✓ Moved 10 general docs"
```

---

### 2.7 Keep at Root (Remove from docs/)
Files that should remain at project root:
- README.md (Main project documentation)
- START_HERE.md (Getting started guide)
- .env.example (Environment template)
- PROJECT_STRUCTURE_MAP.md (New structure report - THIS FILE)

---

### 2.8 Verify Documentation Move
```bash
# Count remaining root-level markdown/txt files
ls -1 *.md *.txt 2>/dev/null | wc -l

# Should be: 4 or 5 files

# List what's at root
ls -1 *.md *.txt 2>/dev/null

# Verify docs/ structure
find docs -type f | wc -l
# Should be: ~50+ files

# Check specific directories
ls -la docs/integration/ | grep -c "^-"
ls -la docs/analysis/ | grep -c "^-"
ls -la docs/guides/ | grep -c "^-"
ls -la docs/tasks/ | grep -c "^-"
```

---

## PRIORITY 3: COMPONENT REORGANIZATION (Optional, 30-45 minutes)

### 3.1 Create Component Subdirectories
```bash
# Create organizational structure
mkdir -p components/header
mkdir -p components/features
mkdir -p components/layout

echo "✓ Created component subdirectories"
```

---

### 3.2 Move Header Components
```bash
# These are all header-related
mv components/header-countdown.tsx components/header/countdown.tsx
mv components/header-products.tsx components/header/products.tsx
mv components/header-stats.tsx components/header/stats.tsx
mv components/header-visitor.tsx components/header/visitor.tsx

echo "✓ Moved 4 header components"
```

---

### 3.3 Move Layout Components
```bash
# Layout/page structure
mv components/providers.tsx components/layout/providers.tsx
mv components/website-scaffold.tsx components/layout/scaffold.tsx

echo "✓ Moved 2 layout components"
```

---

### 3.4 Move Feature Components
```bash
# Feature-specific components
mv components/ai-chat.tsx components/features/ai-chat.tsx
mv components/ai-providers.tsx components/features/ai-providers.tsx
mv components/PixPaymentModal.tsx components/features/pix-payment.tsx
mv components/language-toggle.tsx components/features/language-toggle.tsx
mv components/hero-navigation.tsx components/features/hero-navigation.tsx

echo "✓ Moved 5 feature components"
```

---

### 3.5 Update Imports (IMPORTANT!)
After moving files, update all import statements:

**In app/page.tsx:**
```typescript
// OLD
import { HeaderCountdown } from "@/components/header-countdown";
import { HeaderProducts } from "@/components/header-products";

// NEW
import { HeaderCountdown } from "@/components/header/countdown";
import { HeaderProducts } from "@/components/header/products";
```

**Script to find all imports:**
```bash
grep -r "from \"@/components/header-" app components --include="*.tsx" | head -20
grep -r "from \"@/components/[a-z]" app components --include="*.tsx" | grep -v "from \"@/components/ui" | grep -v "from \"@/components/hero" | grep -v "from \"@/components/features" | grep -v "from \"@/components/layout"
```

---

### 3.6 Verify Component Organization
```bash
# List new structure
tree components/ -L 2

# Or with ls
find components -maxdepth 2 -type d | sort
```

---

## PRIORITY 4: ASSET OPTIMIZATION (Optional, 1-2 hours)

### 4.1 Analyze Asset Size
```bash
# Check image sizes
du -sh public/
du -sh public/*.png | sort -hr | head -10

# Count images
find public -name "*.png" | wc -l
find public -name "*.jpg" | wc -l
find public -name "*.webp" | wc -l
```

---

### 4.2 Image Optimization (Skip for now - requires external tools)
Options for later:
- Use Next.js Image component with optimization
- Convert to WebP format
- Use image CDN (Vercel Blob, Cloudinary)
- Implement lazy-loading

---

## VERIFICATION CHECKLIST

After completing Priority 1 & 2:

- [ ] No `.bak` or `.tmp` files exist
- [ ] `context/CartContext.tsx` deleted
- [ ] Type definitions use no `any` types
- [ ] Root directory has max 4-5 markdown files
- [ ] `docs/` directory contains 50+ archived files
- [ ] No broken imports in codebase
- [ ] Project builds successfully: `npm run build`
- [ ] No console errors or warnings
- [ ] All tests pass (if applicable)

After optional Priority 3:

- [ ] Components are reorganized by type/feature
- [ ] All imports updated correctly
- [ ] No broken component references
- [ ] Project still builds successfully

---

## ROLLBACK PROCEDURE (if needed)

```bash
# Git allows easy rollback
git status  # Check what changed
git diff    # Review changes
git restore .  # Restore all files
```

Or restore individual files:
```bash
git restore components/hero-variants/
git restore context/
git restore types/api.ts
```

---

## COMMANDS SUMMARY (Copy-Paste Ready)

```bash
#!/bin/bash
cd /Users/lech/PROJECTS_all/PROJECT_merch/AI-PROVIDERS/llm-merch-store

# PRIORITY 1
rm components/hero-variants/*.bak components/hero-variants/*.tmp
rm context/CartContext.tsx
mkdir -p docs/{integration,analysis,guides,tasks}

# PRIORITY 2
mv DOPPLER_SETUP.md docs/integration/
mv GET_CREDENTIALS_GUIDE.md docs/integration/
mv GOOGLE_LOGIN_SETUP.md docs/integration/
mv KV_SETUP_STATUS.md docs/integration/
mv KV_SETUP_LINE_BY_LINE.md docs/integration/
mv STORAGE_REALITY_CHECK.md docs/integration/
mv README_INTEGRATION.md docs/integration/

mv ANALYSIS_SUMMARY.txt docs/analysis/
mv ANALYSIS_INDEX.md docs/analysis/
mv api_analysis.md docs/analysis/
# ... (continue with other analysis files)

echo "Cleanup Priority 1 & 2 Complete!"
ls -la docs/
```

---

## PROGRESS TRACKING

Use this checklist to track completion:

- [ ] Step 1.1: Delete backup files
- [ ] Step 1.2: Delete CartContext
- [ ] Step 1.3: Fix type definitions
- [ ] Step 1.4: Update .gitignore
- [ ] Step 2.1: Create docs structure
- [ ] Step 2.2-2.6: Move documentation files
- [ ] Step 2.8: Verify documentation
- [ ] Step 3.1-3.4: Reorganize components (optional)
- [ ] Step 3.5: Update imports (if doing Step 3)
- [ ] Verification: Run full checklist
- [ ] Final: Commit changes to git


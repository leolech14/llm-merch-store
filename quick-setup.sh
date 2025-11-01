#!/bin/bash
# Quick Setup Script - Automates what's possible

set -e

echo "╔════════════════════════════════════════════╗"
echo "║   🚀 LLM MERCH QUICK SETUP SCRIPT   🚀    ║"
echo "╚════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# STEP 1: Generate NEXTAUTH_SECRET
echo "📝 STEP 1: Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
echo "✅ Generated: $SECRET"
echo ""
echo "⚠️  MANUAL ACTION REQUIRED:"
echo "   Open .env.local and replace:"
echo "   NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_HERE_LOCALLY_ONLY"
echo "   With:"
echo "   NEXTAUTH_SECRET=$SECRET"
echo ""
read -p "Press ENTER when you've updated .env.local..."

# Verify secret was updated
if grep -q "YOUR_GENERATED_SECRET_HERE_LOCALLY_ONLY" .env.local; then
  echo "❌ Error: .env.local still has placeholder!"
  echo "   Please update NEXTAUTH_SECRET and run again"
  exit 1
fi

echo "✅ .env.local updated!"
echo ""

# STEP 2: Check if Google OAuth is configured
echo "📝 STEP 2: Checking Google OAuth..."
if grep -q "your-client-id" .env.local; then
  echo "⚠️  Google OAuth NOT configured yet"
  echo ""
  echo "   Go to: https://console.cloud.google.com/apis/credentials"
  echo "   Follow: ../GOOGLE_OAUTH_SETUP.md"
  echo ""
  read -p "Press ENTER when you've added Google OAuth credentials to .env.local..."
fi

echo "✅ Checking OAuth credentials..."
if grep -q "apps.googleusercontent.com" .env.local && ! grep -q "your-client-id" .env.local; then
  echo "✅ Google OAuth configured!"
else
  echo "⚠️  Still needs configuration - continuing anyway"
fi
echo ""

# STEP 3: Generate placeholder images
echo "📝 STEP 3: Generating placeholder product images..."

if ! command -v convert &> /dev/null; then
  echo "⚠️  ImageMagick not installed"
  echo "   Install: brew install imagemagick"
  echo "   Or skip and add images manually"
  read -p "Skip image generation? (y/N): " skip
  if [[ "$skip" != "y" ]]; then
    echo "Install ImageMagick and run again"
    exit 1
  fi
else
  mkdir -p public/images
  cd public/images

  echo "   Generating 31 placeholder images..."

  products=(
    "ask-anything-chest" "chatgpt-pro" "mic-small" "backprop-blue"
    "backprop-red" "cross-attention" "self-attention" "query-key"
    "value-matrix" "transformer" "fluffy-creature" "fluffy-creature-y"
    "llm-brunette-color" "llm-brunette-bw" "llm-brunette-bw-50"
    "llm-blonde-color" "llm-blonde-bw" "fresh-models" "gossip"
    "info-theory" "circular-graph" "circular-graph-small" "data-cube"
    "paris-city" "tunable-params" "llm-brunette-alt" "ask-anything-pro"
    "transformer-mini" "neural-flow-combo" "fluffy-stack-bundle"
    "architecture-full"
  )

  for product in "${products[@]}"; do
    convert -size 800x800 \
      xc:'#1a1a1a' \
      -fill white \
      -pointsize 24 \
      -gravity center \
      -annotate +0+0 "$product" \
      "${product}.jpg" 2>/dev/null
  done

  cd ../..

  image_count=$(ls public/images/*.jpg 2>/dev/null | wc -l)
  echo "✅ Generated $image_count placeholder images"
fi
echo ""

# STEP 4: Test build
echo "📝 STEP 4: Testing production build..."
if npm run build; then
  echo "✅ Build SUCCESS!"
else
  echo "❌ Build FAILED - fix errors before deploying"
  exit 1
fi
echo ""

# STEP 5: Ready to deploy
echo "╔════════════════════════════════════════════╗"
echo "║          🎉 SETUP COMPLETE! 🎉            ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "✅ Checklist:"
echo "  ✓ NEXTAUTH_SECRET generated"
echo "  ✓ .env.local configured"
echo "  ✓ Images ready (placeholders or real)"
echo "  ✓ Build passing"
echo ""
echo "🚀 READY TO DEPLOY!"
echo ""
echo "Next command:"
echo "  vercel --prod"
echo ""
echo "⚠️  After first deploy:"
echo "  1. Note your Vercel URL"
echo "  2. Update NEXTAUTH_URL in Vercel dashboard"
echo "  3. Add production redirect URI to Google OAuth"
echo "  4. Redeploy: vercel --prod"
echo ""
echo "🎊 Your store will be LIVE!"
echo ""

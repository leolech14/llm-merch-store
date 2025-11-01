#!/bin/bash

# LLM Merch Store - OAuth Setup Script
# Run this after creating the Web OAuth client in Google Console

set -e

echo "🔐 LLM Merch Store - OAuth Setup"
echo "=================================="
echo ""

# Check if credentials are provided as arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ Missing credentials!"
  echo ""
  echo "Usage: ./setup-oauth.sh <CLIENT_ID> <CLIENT_SECRET>"
  echo ""
  echo "Example:"
  echo "./setup-oauth.sh \"123456-abc.apps.googleusercontent.com\" \"GOCSPX-xyz\""
  echo ""
  exit 1
fi

CLIENT_ID="$1"
CLIENT_SECRET="$2"

echo "📋 Credentials provided:"
echo "Client ID: ${CLIENT_ID:0:20}..."
echo "Client Secret: ${CLIENT_SECRET:0:15}..."
echo ""

# Generate NEXTAUTH_SECRET if not exists
if [ ! -f ".env.local" ] || ! grep -q "NEXTAUTH_SECRET" .env.local; then
  echo "🔑 Generating NEXTAUTH_SECRET..."
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
else
  echo "✅ NEXTAUTH_SECRET already exists"
  NEXTAUTH_SECRET=$(grep "NEXTAUTH_SECRET=" .env.local | cut -d '=' -f2)
fi

# Create/Update .env.local
echo "📝 Updating .env.local..."
cat > .env.local << EOF
# Google OAuth
GOOGLE_CLIENT_ID="$CLIENT_ID"
GOOGLE_CLIENT_SECRET="$CLIENT_SECRET"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
EOF

echo "✅ .env.local updated"
echo ""

# Update Vercel environment variables
echo "☁️  Updating Vercel production environment..."
echo ""

# Remove old variables (if exist)
echo "Removing old GOOGLE_CLIENT_ID..."
vercel env rm GOOGLE_CLIENT_ID production --yes 2>/dev/null || true

echo "Removing old GOOGLE_CLIENT_SECRET..."
vercel env rm GOOGLE_CLIENT_SECRET production --yes 2>/dev/null || true

echo "Removing old NEXTAUTH_SECRET..."
vercel env rm NEXTAUTH_SECRET production --yes 2>/dev/null || true

echo ""
echo "Adding new credentials..."

# Add new variables
echo "$CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production
echo "$CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

echo ""
echo "✅ Vercel environment variables updated"
echo ""

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Visit: http://localhost:3000/auth/signin"
echo "3. Test production: https://llmmerch.space/auth/signin"
echo ""
echo "🔐 Admin emails (whitelist):"
echo "- leonardo.lech@gmail.com"
echo "- leo@lbldomain.com"
echo ""

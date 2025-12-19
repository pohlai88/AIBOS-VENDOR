#!/bin/bash
# Supabase Storage Setup via CLI
# Run this script to configure storage buckets and policies

echo "🚀 Setting up Supabase Storage..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Note: Storage buckets must be created via Dashboard or Management API
# This script provides the SQL for policies

echo ""
echo "📋 Storage Setup Instructions:"
echo ""
echo "1. Create buckets via Supabase Dashboard:"
echo "   - Go to Storage → Buckets → New bucket"
echo "   - Create 'documents' (private, 50MB)"
echo "   - Create 'message-attachments' (private, 10MB)"
echo "   - Create 'public-assets' (public, 5MB)"
echo ""
echo "2. Apply RLS policies via SQL Editor:"
echo "   - Run the migration: storage_rls_policies"
echo "   - Or use the SQL from STORAGE_SETUP_INSTRUCTIONS.md"
echo ""
echo "3. Verify setup:"
echo "   SELECT * FROM storage.buckets;"
echo ""

echo "✅ Setup instructions provided"
echo "📚 See STORAGE_SETUP_INSTRUCTIONS.md for detailed steps"

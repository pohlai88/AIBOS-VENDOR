# OAuth Setup Guide - Complete Configuration

**Date:** 2025-01-27  
**Purpose:** Complete OAuth configuration for Vercel deployment  
**Status:** 📋 **SETUP GUIDE**

---

## Overview

This guide will help you:
1. **Select an OAuth provider** (we'll guide you through options)
2. **Configure Vercel deployment** with proper redirect URLs
3. **Set up Supabase OAuth** with the selected provider
4. **Test the complete flow**

---

## Step 1: Select OAuth Provider

### Available Providers

Your application supports these OAuth providers:

| Provider | Best For | Setup Complexity | Notes |
|----------|----------|------------------|-------|
| **Google** | General use, B2B | ⭐ Easy | Most common, good for business |
| **GitHub** | Developer tools | ⭐ Easy | Great for dev-focused apps |
| **Azure AD** | Enterprise | ⭐⭐ Medium | Good for B2B/enterprise |
| **Apple** | iOS users | ⭐⭐ Medium | Required for App Store apps |
| **Facebook** | Consumer apps | ⭐ Easy | Good for social apps |
| **Discord** | Gaming/community | ⭐ Easy | Great for community apps |
| **LinkedIn** | Professional | ⭐ Easy | Good for B2B/professional |

### Recommendation

**For a Vendor Portal/B2B application, we recommend:**
1. **Google** - Most universal, easy setup
2. **GitHub** - If targeting developers
3. **Azure AD** - If targeting enterprise customers

**You can enable multiple providers** - users can choose which one to use!

---

## Step 2: Get Your Vercel Deployment URL

### Before Deployment

We need to know your Vercel deployment URL to configure redirect URLs properly.

**Options:**
1. **If you already have a Vercel project:**
   - Your URL will be: `https://your-project.vercel.app`
   - Or custom domain: `https://yourdomain.com`

2. **If deploying for the first time:**
   - Vercel will assign: `https://your-project.vercel.app`
   - We'll configure for both production and preview deployments

---

## Step 3: Configure OAuth Provider (Example: Google)

### 3.1 Google Cloud Console Setup

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Create or Select Project:**
   - Create new project or select existing
   - Note the project name

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Vendor Portal" (or your app name)

5. **Add Authorized Redirect URIs:**
   ```
   # Production (Vercel)
   https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
   
   # Development (Local)
   http://localhost:3000/api/auth/oauth/callback
   ```

6. **Save and Copy:**
   - **Client ID** (copy this)
   - **Client Secret** (copy this - you'll only see it once!)

---

### 3.2 Supabase Dashboard Configuration

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/vrawceruzokxitybkufk/auth/providers
   ```

2. **Enable Google Provider:**
   - Find "Google" in the provider list
   - Toggle "Enable Google" to ON
   - Paste **Client ID** from Google Cloud Console
   - Paste **Client Secret** from Google Cloud Console
   - Click "Save"

3. **Verify Configuration:**
   - Status should show "Enabled"
   - Client ID should be visible (masked)

---

## Step 4: Configure Vercel Deployment

### 4.1 Environment Variables

**Required Environment Variables for Vercel:**

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://vrawceruzokxitybkufk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# OAuth Redirect URLs (will be set automatically)
# No additional env vars needed - handled by code
```

### 4.2 Vercel Project Configuration

**We'll configure:**
1. Environment variables
2. Build settings
3. Redirect URL handling

---

## Step 5: Test OAuth Flow

### 5.1 Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test OAuth:**
   ```
   http://localhost:3000/api/auth/oauth?provider=google
   ```

3. **Expected Flow:**
   - Redirects to Google login
   - After login, redirects back
   - Creates session
   - Redirects to dashboard

### 5.2 Production Testing

1. **Deploy to Vercel**
2. **Test OAuth:**
   ```
   https://your-project.vercel.app/api/auth/oauth?provider=google
   ```

---

## Step 6: Multiple Providers (Optional)

### Enable Additional Providers

You can enable multiple providers:

1. **GitHub:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set callback: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret
   - Enable in Supabase Dashboard

2. **Azure AD:**
   - Go to Azure Portal > App registrations
   - Create new registration
   - Add redirect URI: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`
   - Copy Application ID and Secret
   - Enable in Supabase Dashboard

---

## Configuration Checklist

### OAuth Provider Setup

- [ ] Selected OAuth provider(s)
- [ ] Created OAuth app in provider console
- [ ] Added redirect URI to provider
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Enabled provider in Supabase Dashboard
- [ ] Pasted Client ID in Supabase
- [ ] Pasted Client Secret in Supabase
- [ ] Saved configuration

### Vercel Deployment

- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Deployed to Vercel
- [ ] Production URL obtained
- [ ] Redirect URLs tested

### Testing

- [ ] Local OAuth flow tested
- [ ] Production OAuth flow tested
- [ ] Session creation verified
- [ ] User redirect verified

---

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Check redirect URI in provider console
   - Must match exactly: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`

2. **"Invalid client"**
   - Verify Client ID and Secret in Supabase Dashboard
   - Check for extra spaces or typos

3. **"OAuth provider not enabled"**
   - Verify provider is enabled in Supabase Dashboard
   - Check provider status

---

## Next Steps

1. **Select your OAuth provider** (we recommend starting with Google)
2. **Follow the provider-specific setup** (Google example above)
3. **Configure in Supabase Dashboard**
4. **Deploy to Vercel**
5. **Test the flow**

---

## Need Help?

**Which provider would you like to configure?**
- Google (recommended for B2B)
- GitHub (for developers)
- Azure AD (for enterprise)
- Other (specify)

Once you select, we'll provide step-by-step instructions!

---

**Last Updated:** 2025-01-27  
**Status:** 📋 **READY FOR CONFIGURATION**

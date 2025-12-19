# Complete OAuth & Vercel Setup Guide

**Date:** 2025-01-27  
**Purpose:** Step-by-step OAuth configuration for Vercel deployment  
**Status:** 📋 **READY TO CONFIGURE**

---

## 🎯 Overview

This guide will walk you through:
1. **Selecting an OAuth provider** (we'll guide you, not assume)
2. **Configuring Vercel deployment**
3. **Setting up Supabase OAuth**
4. **Testing the complete flow**

---

## Step 1: OAuth Provider Selection

### 🤔 Which Provider Should You Use?

**For a Vendor Portal (B2B application), here are the best options:**

| Provider | Best For | Setup Time | Recommendation |
|----------|----------|------------|----------------|
| **Google** | Universal, B2B | 5-10 min | ⭐⭐⭐ **Most Recommended** |
| **GitHub** | Developer-focused | 5-10 min | ⭐⭐ Good if targeting devs |
| **Azure AD** | Enterprise/B2B | 10-15 min | ⭐⭐⭐ **Best for Enterprise** |
| **Microsoft** | Office 365 users | 10-15 min | ⭐⭐ Good for B2B |
| **LinkedIn** | Professional networks | 5-10 min | ⭐⭐ Good for B2B |

### 💡 Our Recommendation

**Start with ONE provider first:**
- **Google** - Easiest, most universal, works for most B2B scenarios
- **OR Azure AD** - If you're targeting enterprise customers

**You can add more providers later!**

---

## Step 2: Get Your Vercel Project Ready

### 2.1 Check Existing Vercel Projects

We'll check if you already have a Vercel project configured.

**If you have a project:**
- We'll use that project's URL
- Configure environment variables
- Set up redirect URLs

**If you don't have a project:**
- We'll guide you to create one
- Or deploy directly from GitHub

### 2.2 Vercel Deployment URL

Your OAuth redirect URLs will be:
```
Production: https://your-project.vercel.app/api/auth/oauth/callback
Preview: https://your-project-git-branch.vercel.app/api/auth/oauth/callback
Development: http://localhost:3000/api/auth/oauth/callback
```

---

## Step 3: OAuth Provider Setup (Choose One)

### Option A: Google OAuth (Recommended) ⭐

#### 3.1 Google Cloud Console Setup

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Create or Select Project:**
   - Click "Select a project" > "New Project"
   - Name: "Vendor Portal" (or your choice)
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search "Google+ API" or "Google Identity"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External (or Internal if using Google Workspace)
     - App name: "Vendor Portal"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue"
     - Test users: Add your email, click "Save and Continue"
     - Click "Back to Dashboard"

5. **Create OAuth Client:**
   - Application type: **Web application**
   - Name: "Vendor Portal Production"
   - **Authorized redirect URIs:** Add these:
     ```
     https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
     ```
   - Click "Create"
   - **IMPORTANT:** Copy these immediately (you won't see the secret again):
     - **Client ID** (copy this)
     - **Client Secret** (copy this - save it securely!)

6. **Save Credentials:**
   - Keep Client ID and Client Secret safe
   - You'll need them for Supabase configuration

---

### Option B: Azure AD OAuth (For Enterprise) ⭐⭐⭐

#### 3.1 Azure Portal Setup

1. **Go to Azure Portal:**
   ```
   https://portal.azure.com/
   ```

2. **Register Application:**
   - Go to "Azure Active Directory" > "App registrations"
   - Click "+ New registration"
   - Name: "Vendor Portal"
   - Supported account types: Choose based on your needs
   - Redirect URI: 
     - Platform: Web
     - URI: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`
   - Click "Register"

3. **Get Credentials:**
   - Go to "Overview" - Copy **Application (client) ID**
   - Go to "Certificates & secrets" > "New client secret"
   - Description: "Vendor Portal Secret"
   - Expires: Choose expiration (recommend 24 months)
   - Click "Add"
   - **IMPORTANT:** Copy the **Value** immediately (you won't see it again!)

4. **Save Credentials:**
   - **Client ID** = Application (client) ID
   - **Client Secret** = The secret value you just copied

---

### Option C: GitHub OAuth (For Developers)

#### 3.1 GitHub Settings

1. **Go to GitHub Settings:**
   ```
   https://github.com/settings/developers
   ```

2. **Create OAuth App:**
   - Click "New OAuth App"
   - Application name: "Vendor Portal"
   - Homepage URL: `https://your-project.vercel.app` (or your domain)
   - **Authorization callback URL:**
     ```
     https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
     ```
   - Click "Register application"

3. **Get Credentials:**
   - **Client ID** - Visible on the page
   - **Client Secret** - Click "Generate a new client secret"
   - Copy the secret immediately

---

## Step 4: Configure Supabase OAuth

### 4.1 Access Supabase Dashboard

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/vrawceruzokxitybkufk/auth/providers
   ```

2. **Select Your Provider:**
   - Find your provider in the list (Google, Azure, GitHub, etc.)
   - Toggle the switch to **Enable**

3. **Enter Credentials:**
   - **Client ID:** Paste from Step 3
   - **Client Secret:** Paste from Step 3
   - Click **Save**

4. **Verify:**
   - Status should show "Enabled"
   - Client ID should be visible (masked)

---

## Step 5: Configure Vercel Deployment

### 5.1 Environment Variables

**Required for Vercel:**

```bash
# Supabase (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://vrawceruzokxitybkufk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**No additional OAuth env vars needed** - Supabase handles OAuth configuration!

### 5.2 Vercel Project Configuration

**We'll help you:**
1. List/create Vercel project
2. Set environment variables
3. Configure build settings
4. Deploy

---

## Step 6: Test OAuth Flow

### 6.1 Local Testing

1. **Start dev server:**
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Test OAuth:**
   ```
   http://localhost:3000/api/auth/oauth?provider=google
   ```
   (Replace `google` with your chosen provider)

3. **Expected Flow:**
   - Redirects to provider login
   - After login, redirects back
   - Creates session
   - Redirects to `/dashboard`

### 6.2 Production Testing

1. **Deploy to Vercel**
2. **Test OAuth:**
   ```
   https://your-project.vercel.app/api/auth/oauth?provider=google
   ```

---

## 📋 Configuration Checklist

### OAuth Provider Setup

- [ ] Selected OAuth provider (Google/Azure/GitHub)
- [ ] Created OAuth app in provider console
- [ ] Added redirect URI: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`
- [ ] Copied Client ID
- [ ] Copied Client Secret (saved securely)
- [ ] Enabled provider in Supabase Dashboard
- [ ] Pasted Client ID in Supabase
- [ ] Pasted Client Secret in Supabase
- [ ] Saved configuration in Supabase

### Vercel Deployment

- [ ] Vercel project created/identified
- [ ] Environment variables configured
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Project deployed to Vercel
- [ ] Production URL obtained

### Testing

- [ ] Local OAuth flow tested
- [ ] Production OAuth flow tested
- [ ] Session creation verified
- [ ] User redirect verified

---

## 🚀 Quick Start Decision

**Which OAuth provider do you want to configure?**

1. **Google** - Recommended for most B2B apps (5-10 min setup)
2. **Azure AD** - Best for enterprise customers (10-15 min setup)
3. **GitHub** - Good for developer-focused apps (5-10 min setup)
4. **Other** - Specify which one

**Once you choose, I'll provide step-by-step instructions!**

---

## 🔧 Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Verify redirect URI in provider console matches exactly:
     ```
     https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
     ```
   - No trailing slashes, exact match required

2. **"Invalid client credentials"**
   - Double-check Client ID and Secret in Supabase Dashboard
   - Ensure no extra spaces or typos
   - Regenerate secret if needed

3. **"Provider not enabled"**
   - Verify provider is enabled in Supabase Dashboard
   - Check provider status shows "Enabled"

---

## 📚 Next Steps

1. **Choose your OAuth provider** (tell me which one!)
2. **Follow provider-specific setup** (I'll guide you)
3. **Configure in Supabase Dashboard**
4. **Deploy to Vercel**
5. **Test the flow**

---

**Ready to start?** Tell me which OAuth provider you'd like to configure, and I'll provide detailed step-by-step instructions!

---

**Last Updated:** 2025-01-27  
**Status:** 📋 **READY FOR CONFIGURATION**

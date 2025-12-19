# Vercel Deployment Configuration for OAuth

**Date:** 2025-01-27  
**Purpose:** Vercel deployment setup for OAuth-enabled application  
**Status:** 📋 **CONFIGURATION GUIDE**

---

## Overview

This guide covers Vercel deployment configuration for your OAuth-enabled Next.js application.

---

## Step 1: Vercel Project Setup

### 1.1 Check Existing Projects

**We'll check your Vercel teams for existing projects.**

**If project exists:**
- We'll use the existing project
- Configure environment variables
- Update deployment settings

**If no project exists:**
- We'll guide you to create one
- Or deploy from GitHub

---

## Step 2: Environment Variables

### 2.1 Required Environment Variables

**For Vercel deployment, set these environment variables:**

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://vrawceruzokxitybkufk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2.2 Setting Environment Variables in Vercel

**Via Vercel Dashboard:**
1. Go to your project
2. Settings > Environment Variables
3. Add each variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://vrawceruzokxitybkufk.supabase.co`
   - Environment: Production, Preview, Development
   - Click "Save"

**Via Vercel CLI:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter value when prompted
```

---

## Step 3: Build Configuration

### 3.1 Next.js Build Settings

**Vercel automatically detects Next.js projects, but verify:**

1. **Framework Preset:** Next.js
2. **Build Command:** `npm run build` (or `pnpm build`)
3. **Output Directory:** `.next` (default)
4. **Install Command:** `npm install` (or `pnpm install`)

### 3.2 Root Directory

**If your Next.js app is in `apps/web`:**
- Set Root Directory: `apps/web`
- Vercel will build from that directory

---

## Step 4: OAuth Redirect URLs

### 4.1 Redirect URL Configuration

**OAuth redirect URLs are handled automatically by your code:**
- Production: `https://your-project.vercel.app/api/auth/oauth/callback`
- Preview: `https://your-project-git-branch.vercel.app/api/auth/oauth/callback`
- Development: `http://localhost:3000/api/auth/oauth/callback`

**No additional Vercel configuration needed** - your code handles this!

---

## Step 5: Deployment

### 5.1 Deploy to Vercel

**Option 1: Via GitHub (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-deploys on push

**Option 2: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel
```

### 5.2 Post-Deployment

**After deployment:**
1. Get your production URL: `https://your-project.vercel.app`
2. Test OAuth flow
3. Verify environment variables are set

---

## Step 6: Domain Configuration (Optional)

### 6.1 Custom Domain

**If you have a custom domain:**
1. Go to Vercel Project > Settings > Domains
2. Add your domain
3. Configure DNS as instructed
4. Update OAuth redirect URLs in provider console if needed

---

## Configuration Checklist

### Vercel Setup

- [ ] Vercel project created/identified
- [ ] Environment variables configured
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Build settings verified
- [ ] Root directory set (if needed)
- [ ] Project deployed
- [ ] Production URL obtained

---

## Troubleshooting

### Common Issues

1. **Build fails:**
   - Check environment variables are set
   - Verify build command
   - Check Node.js version

2. **OAuth redirect fails:**
   - Verify redirect URL in provider console
   - Check Vercel deployment URL matches

---

**Last Updated:** 2025-01-27  
**Status:** 📋 **READY FOR DEPLOYMENT**

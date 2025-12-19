# GitHub OAuth Test - Complete Guide

**Date:** 2025-01-27  
**Provider:** GitHub  
**Status:** 🧪 **READY FOR TESTING**

---

## ✅ Configuration Complete

**You've completed:**
- ✅ GitHub OAuth App created
- ✅ GitHub configured in Supabase Dashboard
- ✅ Client ID and Secret set
- ✅ Provider enabled

---

## 🧪 Testing Steps

### Step 1: Start Dev Server

**If server is not running:**
```bash
cd apps/web
npm run dev
```

**Wait for:**
- ✅ "Ready" message
- ✅ Server on `http://localhost:3000`

---

### Step 2: Test OAuth Initiation

**Open browser:**
```
http://localhost:3000/api/auth/oauth?provider=github
```

**Expected:**
- Redirects to GitHub OAuth consent screen
- Or redirects to Supabase OAuth endpoint

---

### Step 3: Complete OAuth Flow

1. **Login with GitHub** (on GitHub's page)
2. **Approve access**
3. **Redirect back** to your app
4. **Session created**
5. **Redirect to dashboard**

---

## 🔍 Verification After Test

**After successful login, I can verify:**
- ✅ GitHub identity in database
- ✅ User created
- ✅ Session active

---

## ⚠️ Common Issues

### "Connection Refused"
- **Issue:** Dev server not running
- **Solution:** Start with `npm run dev`

### "Redirect URI mismatch"
- **Issue:** Callback URL doesn't match
- **Solution:** Verify in GitHub OAuth App:
  ```
  https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
  ```

---

**Last Updated:** 2025-01-27  
**Status:** 🧪 **READY FOR TESTING**

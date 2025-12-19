# GitHub OAuth Testing Guide

**Date:** 2025-01-27  
**Provider:** GitHub  
**Status:** 🧪 **TESTING GUIDE**

---

## 🧪 Testing GitHub OAuth Flow

### Prerequisites

1. ✅ Next.js dev server running on port 3000
2. ✅ GitHub OAuth configured in Supabase Dashboard
3. ✅ GitHub OAuth App created with correct callback URL

---

## Test 1: OAuth Initiation

### Manual Test

1. **Open browser:**
   ```
   http://localhost:3000/api/auth/oauth?provider=github
   ```

2. **Expected Behavior:**
   - Should redirect to GitHub OAuth consent screen
   - URL should contain `github.com/login/oauth/authorize`
   - Or redirect to Supabase OAuth endpoint

3. **If Error:**
   - Check browser console for errors
   - Check Next.js dev server logs
   - Verify GitHub is enabled in Supabase Dashboard

---

## Test 2: OAuth Callback

### Manual Test

**After completing GitHub login:**

1. **Expected Redirect:**
   ```
   http://localhost:3000/api/auth/oauth/callback?code=...&state=...
   ```

2. **Expected Behavior:**
   - Code exchanged for session
   - Session cookie set
   - Redirect to `/dashboard`

3. **If Error:**
   - Check callback URL in GitHub OAuth App
   - Verify it matches: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`
   - Check Supabase logs

---

## Test 3: Session Verification

### After Successful Login

1. **Check Session:**
   - User should be logged in
   - Dashboard should be accessible
   - Session cookie should be set

2. **Verify Database:**
   - Check `auth.identities` for GitHub identity
   - Check `auth.users` for new user
   - Check `auth.sessions` for active session

---

## Automated Testing (Using MCP)

**I can help test using:**
- ✅ Next.js MCP tools (route verification)
- ✅ Supabase MCP tools (database checks)
- ⚠️ Browser automation (requires server running)

---

## Testing Checklist

### Pre-Test ✅

- [x] ✅ GitHub OAuth App created
- [x] ✅ Callback URL configured
- [x] ✅ Client ID configured in Supabase
- [x] ✅ Client Secret configured in Supabase
- [x] ✅ Provider enabled in Dashboard
- [x] ✅ Next.js dev server running

### OAuth Flow Test ⚠️

- [ ] ⚠️ OAuth initiation works
- [ ] ⚠️ Redirects to GitHub
- [ ] ⚠️ User can login
- [ ] ⚠️ Callback receives code
- [ ] ⚠️ Session created
- [ ] ⚠️ User redirected to dashboard

### Post-Test ✅

- [ ] ⚠️ GitHub identity in database
- [ ] ⚠️ User created in database
- [ ] ⚠️ Session active
- [ ] ⚠️ Dashboard accessible

---

## Troubleshooting

### "Connection Refused"
- **Issue:** Dev server not running
- **Solution:** Start dev server: `npm run dev`

### "Redirect URI mismatch"
- **Issue:** Callback URL doesn't match
- **Solution:** Verify in GitHub OAuth App:
  ```
  https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
  ```

### "Invalid client"
- **Issue:** Client ID/Secret incorrect
- **Solution:** Verify in Supabase Dashboard

---

## Quick Test Commands

### Check Server Status
```bash
# Check if server is running
netstat -ano | findstr ":3000"
```

### Test OAuth Endpoint
```bash
# Test OAuth initiation (should redirect)
curl -L -I "http://localhost:3000/api/auth/oauth?provider=github"
```

---

**Last Updated:** 2025-01-27  
**Status:** 🧪 **READY FOR TESTING**

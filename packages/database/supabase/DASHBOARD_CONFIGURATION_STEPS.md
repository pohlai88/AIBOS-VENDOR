# Supabase Dashboard OAuth Configuration Steps

**Date:** 2025-01-27  
**Status:** 📋 **DASHBOARD CONFIGURATION GUIDE**

---

## 🎯 Dashboard Configuration Steps

Since you've completed the provider setup (Google/Azure/GitHub), now we need to configure it in the Supabase Dashboard.

---

## Step 1: Access Supabase Dashboard

**Go to Authentication Providers:**
```
https://supabase.com/dashboard/project/vrawceruzokxitybkufk/auth/providers
```

**Direct Link:**
- Project: `vrawceruzokxitybkufk`
- Section: Authentication > Providers

---

## Step 2: Enable Your OAuth Provider

### For Google OAuth:

1. **Find "Google" in the provider list**
2. **Toggle the switch to "Enable"**
3. **Enter your credentials:**
   - **Client ID:** Paste from Google Cloud Console
   - **Client Secret:** Paste from Google Cloud Console
4. **Click "Save"**

### For Azure AD:

1. **Find "Azure" in the provider list**
2. **Toggle the switch to "Enable"**
3. **Enter your credentials:**
   - **Client ID:** Application (client) ID from Azure Portal
   - **Client Secret:** Secret value from Azure Portal
4. **Click "Save"**

### For GitHub:

1. **Find "GitHub" in the provider list**
2. **Toggle the switch to "Enable"**
3. **Enter your credentials:**
   - **Client ID:** From GitHub OAuth App
   - **Client Secret:** From GitHub OAuth App
4. **Click "Save"**

---

## Step 3: Verify Configuration

**After saving, verify:**
- ✅ Status shows "Enabled"
- ✅ Client ID is visible (masked)
- ✅ No error messages

---

## Step 4: Test Configuration

**I can help verify the configuration using Supabase MCP tools!**

**What I'll check:**
- ✅ OAuth clients in database
- ✅ Provider configuration
- ✅ Security status
- ✅ Auth logs

---

## 📋 Configuration Checklist

**Dashboard Configuration:**
- [ ] Opened Supabase Dashboard
- [ ] Navigated to Authentication > Providers
- [ ] Found your provider (Google/Azure/GitHub)
- [ ] Toggled provider to "Enable"
- [ ] Pasted Client ID
- [ ] Pasted Client Secret
- [ ] Clicked "Save"
- [ ] Verified status shows "Enabled"
- [ ] No error messages

---

## 🔍 Verification

**After configuration, I'll verify using Supabase MCP:**
1. Check OAuth clients table
2. Verify provider configuration
3. Check security status
4. Review auth logs

---

## ⚠️ Common Issues

### "Invalid Client ID"
- Double-check Client ID from provider console
- Ensure no extra spaces
- Verify it's the correct credential

### "Invalid Client Secret"
- Double-check Client Secret
- Ensure it's the latest secret (if regenerated)
- Verify no extra spaces

### "Provider not saving"
- Check internet connection
- Refresh the page
- Try again

---

## ✅ Next Steps After Dashboard Configuration

1. **Verify configuration** (I'll help with this)
2. **Test OAuth flow locally**
3. **Configure Vercel deployment**
4. **Test production OAuth flow**

---

**Once you've configured the provider in the dashboard, let me know and I'll verify it using Supabase MCP tools!**

---

**Last Updated:** 2025-01-27  
**Status:** 📋 **READY FOR VERIFICATION**

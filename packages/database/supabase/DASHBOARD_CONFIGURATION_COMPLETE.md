# Supabase Dashboard OAuth Configuration - Complete Guide

**Date:** 2025-01-27  
**Status:** 📋 **DASHBOARD CONFIGURATION**

---

## 🎯 Quick Access

**Direct Link to Supabase Dashboard:**
```
https://supabase.com/dashboard/project/vrawceruzokxitybkufk/auth/providers
```

**Or navigate:**
1. Go to: https://supabase.com/dashboard
2. Select project: `vrawceruzokxitybkufk`
3. Click: **Authentication** (left sidebar)
4. Click: **Providers** (submenu)

---

## Step-by-Step Configuration

### Step 1: Open Providers Page

1. **Go to Supabase Dashboard**
2. **Select your project:** `vrawceruzokxitybkufk`
3. **Click "Authentication"** in the left sidebar
4. **Click "Providers"** in the submenu

**You should see a list of OAuth providers:**
- Google
- GitHub
- Azure
- Apple
- Facebook
- etc.

---

### Step 2: Enable Your Provider

**Which provider did you set up?** (Google/Azure/GitHub/Other)

#### For Google:

1. **Find "Google" in the list**
2. **Click the toggle switch** to enable it
3. **Enter your credentials:**
   - **Client ID (for Google OAuth):** 
     - Paste your Google Client ID here
   - **Client Secret (for Google OAuth):**
     - Paste your Google Client Secret here
4. **Click "Save"** button

#### For Azure AD:

1. **Find "Azure" in the list**
2. **Click the toggle switch** to enable it
3. **Enter your credentials:**
   - **Client ID (for Azure AD OAuth):**
     - Paste your Azure Application (client) ID
   - **Client Secret (for Azure AD OAuth):**
     - Paste your Azure Client Secret
4. **Click "Save"** button

#### For GitHub:

1. **Find "GitHub" in the list**
2. **Click the toggle switch** to enable it
3. **Enter your credentials:**
   - **Client ID (for GitHub OAuth):**
     - Paste your GitHub Client ID
   - **Client Secret (for GitHub OAuth):**
     - Paste your GitHub Client Secret
4. **Click "Save"** button

---

### Step 3: Verify Configuration

**After clicking "Save", check:**

✅ **Status shows "Enabled"**  
✅ **Client ID is visible** (masked/partially hidden)  
✅ **No error messages**  
✅ **Green checkmark or success message**

---

### Step 4: Test Configuration

**Once configured, I can verify it using Supabase MCP tools!**

**What I'll check:**
- ✅ OAuth provider configuration
- ✅ Database records
- ✅ Security status
- ✅ Ready for testing

---

## 📋 Configuration Checklist

**Before you start:**
- [ ] Have your Client ID ready
- [ ] Have your Client Secret ready
- [ ] Supabase Dashboard open
- [ ] Navigated to Authentication > Providers

**Configuration steps:**
- [ ] Found your provider in the list
- [ ] Toggled provider to "Enable"
- [ ] Pasted Client ID
- [ ] Pasted Client Secret
- [ ] Clicked "Save"
- [ ] Verified status shows "Enabled"
- [ ] No error messages

---

## ⚠️ Common Issues & Solutions

### Issue: "Invalid Client ID"
**Solution:**
- Double-check you copied the correct Client ID
- Ensure no extra spaces before/after
- Verify it's from the correct provider console

### Issue: "Invalid Client Secret"
**Solution:**
- Double-check you copied the correct Client Secret
- If you regenerated the secret, use the NEW one
- Ensure no extra spaces
- Make sure you copied the VALUE, not the ID

### Issue: "Provider not saving"
**Solution:**
- Check your internet connection
- Refresh the page and try again
- Clear browser cache if needed
- Try a different browser

### Issue: "Redirect URI mismatch" (later)
**Solution:**
- This happens during testing, not configuration
- Verify redirect URI in provider console matches:
  ```
  https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
  ```

---

## ✅ After Configuration

**Once you've saved the configuration:**

1. **Tell me which provider you configured** (Google/Azure/GitHub)
2. **I'll verify it using Supabase MCP tools**
3. **Then we'll test the OAuth flow**

---

## 🔍 Verification (I'll Do This)

**After you configure, I'll verify:**
- ✅ Provider is enabled in database
- ✅ Configuration is correct
- ✅ Security status
- ✅ Ready for testing

---

## 📚 Next Steps

**After dashboard configuration:**
1. ✅ **Verify configuration** (I'll help)
2. ✅ **Test OAuth flow locally**
3. ✅ **Configure Vercel deployment**
4. ✅ **Test production OAuth**

---

**Ready to configure?**

1. **Open the Supabase Dashboard link above**
2. **Follow the steps for your provider**
3. **Save the configuration**
4. **Let me know when done, and I'll verify it!**

---

**Last Updated:** 2025-01-27  
**Status:** 📋 **READY FOR YOUR CONFIGURATION**

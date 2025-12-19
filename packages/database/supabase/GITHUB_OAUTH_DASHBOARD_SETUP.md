# GitHub OAuth Dashboard Configuration

**Date:** 2025-01-27  
**Provider:** GitHub  
**Status:** 📋 **DASHBOARD CONFIGURATION**

---

## 🎯 Quick Access

**Direct Link to Supabase Dashboard:**
```
https://supabase.com/dashboard/project/vrawceruzokxitybkufk/auth/providers
```

---

## Step-by-Step: Configure GitHub OAuth

### Step 1: Open Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard/project/vrawceruzokxitybkufk/auth/providers
2. **Or navigate:**
   - Supabase Dashboard → Project `vrawceruzokxitybkufk`
   - Click **Authentication** (left sidebar)
   - Click **Providers** (submenu)

---

### Step 2: Find GitHub Provider

**In the provider list, find "GitHub"**

You should see:
- GitHub
- Toggle switch (OFF by default)
- Fields for Client ID and Client Secret

---

### Step 3: Enable GitHub Provider

1. **Toggle the switch** to enable GitHub
2. **Enter your GitHub credentials:**

   **Client ID (for GitHub OAuth):**
   - Paste your GitHub Client ID here
   - This is from your GitHub OAuth App

   **Client Secret (for GitHub OAuth):**
   - Paste your GitHub Client Secret here
   - This is from your GitHub OAuth App

3. **Click "Save"** button

---

### Step 4: Verify Configuration

**After clicking "Save", check:**

✅ **Status shows "Enabled"**  
✅ **Client ID is visible** (masked/partially hidden)  
✅ **No error messages**  
✅ **Green checkmark or success message**

---

## 📋 GitHub OAuth App Setup (If Not Done)

**If you haven't created the GitHub OAuth App yet:**

### 1. Go to GitHub Settings

```
https://github.com/settings/developers
```

### 2. Create OAuth App

1. Click **"New OAuth App"** (or "OAuth Apps" → "New OAuth App")
2. Fill in the form:
   - **Application name:** `Vendor Portal` (or your app name)
   - **Homepage URL:** 
     ```
     https://your-project.vercel.app
     ```
     (Or use `http://localhost:3000` for development)
   - **Authorization callback URL:** ⚠️ **IMPORTANT - Must be exact:**
     ```
     https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
     ```
3. Click **"Register application"**

### 3. Get Credentials

**After creating the app:**
- **Client ID** - Visible on the page (copy this)
- **Client Secret** - Click **"Generate a new client secret"**
  - ⚠️ **IMPORTANT:** Copy the secret immediately (you won't see it again!)
  - Save it securely

---

## ✅ Configuration Checklist

**Before Dashboard Configuration:**
- [ ] GitHub OAuth App created
- [ ] Callback URL set: `https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback`
- [ ] Client ID copied
- [ ] Client Secret copied and saved securely

**Dashboard Configuration:**
- [ ] Opened Supabase Dashboard
- [ ] Navigated to Authentication > Providers
- [ ] Found "GitHub" in the list
- [ ] Toggled GitHub to "Enable"
- [ ] Pasted Client ID
- [ ] Pasted Client Secret
- [ ] Clicked "Save"
- [ ] Verified status shows "Enabled"
- [ ] No error messages

---

## 🔍 Verification

**After you configure GitHub in the dashboard, I'll verify it using Supabase MCP tools!**

**What I'll check:**
- ✅ GitHub provider is enabled
- ✅ Configuration is correct
- ✅ Database records
- ✅ Security status
- ✅ Ready for testing

---

## ⚠️ Common Issues

### "Invalid Client ID"
- Double-check you copied the correct Client ID from GitHub
- Ensure no extra spaces before/after
- Verify it's from the correct OAuth App

### "Invalid Client Secret"
- Double-check you copied the correct Client Secret
- If you regenerated the secret, use the NEW one
- Ensure no extra spaces
- Make sure you copied the VALUE, not the ID

### "Redirect URI mismatch" (during testing)
- Verify callback URL in GitHub OAuth App matches exactly:
  ```
  https://vrawceruzokxitybkufk.supabase.co/auth/v1/callback
  ```
- No trailing slashes
- Exact match required

---

## 🚀 After Configuration

**Once you've saved the GitHub configuration:**

1. **Tell me when it's done**
2. **I'll verify it using Supabase MCP tools**
3. **Then we'll test the OAuth flow**

---

## 📚 Next Steps

**After dashboard configuration:**
1. ✅ **Verify configuration** (I'll help with this)
2. ✅ **Test OAuth flow locally**
3. ✅ **Configure Vercel deployment**
4. ✅ **Test production OAuth flow**

---

**Ready to configure?**

1. **Open the Supabase Dashboard link above**
2. **Find "GitHub" in the provider list**
3. **Enable it and paste your credentials**
4. **Click "Save"**
5. **Let me know when done, and I'll verify it!**

---

**Last Updated:** 2025-01-27  
**Status:** 📋 **READY FOR YOUR CONFIGURATION**

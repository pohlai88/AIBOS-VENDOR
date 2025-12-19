# Remaining Storage Policies - Quick Copy

**Status:** Documents bucket ✅ Complete | Message Attachments: 2 remaining

---

## 📋 Copy-Paste Ready SQL

### Policy 1: Upload Message Attachments (INSERT)

**Policy name:** `Authenticated users can upload message attachments`  
**Operation:** `INSERT`  
**Roles:** `authenticated`  
**WITH CHECK:**
```
bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
```

---

### Policy 2: View Message Attachments (SELECT)

**Policy name:** `Users can view message attachments`  
**Operation:** `SELECT`  
**Roles:** `authenticated`  
**USING:**
```
bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
```

---

## 🎯 Dashboard Steps

1. **Storage** → **Policies** → Select **`message-attachments`** bucket
2. Click **"New Policy"** → **"Create policy from scratch"**
3. Fill form with Policy 1 details above → **"Review"** → **"Save policy"**
4. Click **"New Policy"** again → Fill form with Policy 2 details → **"Save policy"**

---

## ✅ Complete!

After creating these 2 policies, you'll have:
- ✅ 4 policies for `documents` bucket
- ✅ 2 policies for `message-attachments` bucket
- **Total: 6 policies** ✅

---

*Quick reference: 2025-01-27*

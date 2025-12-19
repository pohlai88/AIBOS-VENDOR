# Message Attachments Bucket - RLS Policies SQL

**Remaining Policies: 2**

---

## 📋 Policy 1: Upload (INSERT)

### Dashboard Form Fields:

- **Policy name**: `Authenticated users can upload message attachments`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: Leave empty
- **WITH CHECK expression**: Copy-paste this SQL:

```sql
bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
```

---

## 📋 Policy 2: View (SELECT)

### Dashboard Form Fields:

- **Policy name**: `Users can view message attachments`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: Copy-paste this SQL:

```sql
bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
```

- **WITH CHECK expression**: Leave empty

---

## 🚀 Quick Steps

1. Go to **Storage** → **Policies**
2. Select bucket: **`message-attachments`**
3. Click **"New Policy"**
4. Choose **"Create policy from scratch"**
5. Fill in the form using the details above
6. Click **"Review"** → **"Save policy"**
7. Repeat for the second policy

---

## ✅ Verification

After creating both policies, verify in SQL Editor:

```sql
SELECT 
  policyname,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'a' THEN 'INSERT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = 'd' THEN 'DELETE'
  END as operation
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%message attachments%'
ORDER BY policyname;
```

**Expected Result:**
- 2 policies for `message-attachments` bucket
- 1 INSERT policy
- 1 SELECT policy

---

**Total Remaining: 2 policies**

*Created: 2025-01-27*

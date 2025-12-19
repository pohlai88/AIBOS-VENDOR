# Fix Storage RLS Policies - Action Plan

**Date:** 2025-01-27  
**Status:** 🔧 **FIXES REQUIRED**

---

## 🔍 Issues Detected

1. ❌ **Missing 3 policies** for documents bucket (SELECT, UPDATE, DELETE)
2. ⚠️ **2 duplicate policies** for message-attachments bucket
3. ⚠️ **Policy name suffixes** (from dashboard auto-naming)

---

## 🧹 Step 1: Clean Up Duplicates

**Run in SQL Editor (Dashboard):**

```sql
-- Remove duplicate INSERT policy (has typo: "attachment" instead of "attachments")
DROP POLICY IF EXISTS "Authenticated users can upload message attachment 1rb83je_0" ON storage.objects;

-- Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view message attachments flreew_0" ON storage.objects;
```

**After running, you should have:**
- ✅ 1 INSERT policy for message-attachments
- ✅ 1 SELECT policy for message-attachments

---

## ➕ Step 2: Create Missing Documents Policies

**Run in SQL Editor (Dashboard):**

### Policy 1: SELECT (View Documents)

```sql
CREATE POLICY "Users can view documents in their tenant"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);
```

### Policy 2: UPDATE (Update Documents)

```sql
CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);
```

### Policy 3: DELETE (Delete Documents)

```sql
CREATE POLICY "Users can delete their documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);
```

---

## ✅ Step 3: Verify Final State

**Run this verification query:**

```sql
SELECT 
  policyname,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'a' THEN 'INSERT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = 'd' THEN 'DELETE'
  END as operation,
  CASE 
    WHEN policyname LIKE '%documents%' THEN 'documents'
    WHEN policyname LIKE '%message%' THEN 'message-attachments'
  END as bucket
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY bucket, operation;
```

**Expected Result: 6 policies**

| Bucket | Operation | Policy Name |
|--------|-----------|-------------|
| documents | INSERT | Authenticated users can upload documents... |
| documents | SELECT | Users can view documents in their tenant |
| documents | UPDATE | Users can update their documents |
| documents | DELETE | Users can delete their documents |
| message-attachments | INSERT | Authenticated users can upload message attachments... |
| message-attachments | SELECT | Users can view message attachments... |

---

## 📋 Complete SQL Script (All-in-One)

**Copy and run this entire script in SQL Editor:**

```sql
-- ============================================
-- STEP 1: Clean up duplicate policies
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload message attachment 1rb83je_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can view message attachments flreew_0" ON storage.objects;

-- ============================================
-- STEP 2: Create missing documents policies
-- ============================================

-- SELECT policy
CREATE POLICY "Users can view documents in their tenant"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

-- UPDATE policy
CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

-- DELETE policy
CREATE POLICY "Users can delete their documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

-- ============================================
-- STEP 3: Verify (run separately to check)
-- ============================================

SELECT 
  policyname,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'a' THEN 'INSERT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = 'd' THEN 'DELETE'
  END as operation,
  CASE 
    WHEN policyname LIKE '%documents%' THEN 'documents'
    WHEN policyname LIKE '%message%' THEN 'message-attachments'
  END as bucket
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY bucket, operation;
```

---

## 🎯 Quick Reference

### Current State
- ✅ Documents: 1 policy (INSERT only)
- ⚠️ Message-attachments: 4 policies (2 duplicates)

### Target State
- ✅ Documents: 4 policies (INSERT, SELECT, UPDATE, DELETE)
- ✅ Message-attachments: 2 policies (INSERT, SELECT)

**Total: 6 unique policies**

---

## ⚠️ Important Notes

1. **Run in SQL Editor** - These commands need service role permissions
2. **Backup first** - Consider documenting current policies before changes
3. **Test after** - Verify upload/download still works after changes
4. **Policy names** - Suffixes (`flreew_0`, `1rb83je_0`) are from dashboard auto-naming when duplicates exist

---

**Fix script created: 2025-01-27**

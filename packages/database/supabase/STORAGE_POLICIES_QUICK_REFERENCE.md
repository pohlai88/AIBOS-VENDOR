# Storage RLS Policies - Quick Reference

**Copy-paste ready SQL for Dashboard**

---

## 📋 Documents Bucket Policies

### Policy 1: Upload (INSERT)

**Policy name:** `Authenticated users can upload documents`  
**Operation:** `INSERT`  
**Roles:** `authenticated`  
**WITH CHECK:**
```sql
bucket_id = 'documents' AND auth.uid() IS NOT NULL
```

### Policy 2: View (SELECT)

**Policy name:** `Users can view documents in their tenant`  
**Operation:** `SELECT`  
**Roles:** `authenticated`  
**USING:**
```sql
bucket_id = 'documents' AND auth.uid() IS NOT NULL
```

### Policy 3: Update (UPDATE)

**Policy name:** `Users can update their documents`  
**Operation:** `UPDATE`  
**Roles:** `authenticated`  
**USING:**
```sql
bucket_id = 'documents' AND auth.uid() IS NOT NULL
```
**WITH CHECK:**
```sql
bucket_id = 'documents' AND auth.uid() IS NOT NULL
```

### Policy 4: Delete (DELETE)

**Policy name:** `Users can delete their documents`  
**Operation:** `DELETE`  
**Roles:** `authenticated`  
**USING:**
```sql
bucket_id = 'documents' AND auth.uid() IS NOT NULL
```

---

## 📋 Message Attachments Bucket Policies

### Policy 5: Upload (INSERT)

**Policy name:** `Authenticated users can upload message attachments`  
**Operation:** `INSERT`  
**Roles:** `authenticated`  
**WITH CHECK:**
```sql
bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
```

### Policy 6: View (SELECT)

**Policy name:** `Users can view message attachments`  
**Operation:** `SELECT`  
**Roles:** `authenticated`  
**USING:**
```sql
bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
```

---

## 🎯 Dashboard Steps

1. **Storage** → **Policies**
2. Select bucket (`documents` or `message-attachments`)
3. Click **"New Policy"**
4. Choose **"Create policy from scratch"**
5. Fill form with details above
6. Click **"Review"** → **"Save policy"**
7. Repeat for each policy

---

**Total: 6 policies to create**

*Quick reference: 2025-01-27*

# Storage Setup Checklist

**Use this checklist to track your progress**

---

## ✅ Completed (Via Supabase MCP)

- [x] **Documents bucket** created (private, 50MB)
- [x] **Message attachments bucket** created (private, 10MB)
- [x] **Public assets bucket** created (public, 5MB)
- [x] **Next.js integration code** complete
- [x] **Storage helper functions** created
- [x] **API routes** implemented

---

## 📋 To Do (Via Dashboard)

### Documents Bucket Policies

- [ ] **Policy 1**: Upload (INSERT)
  - Name: `Authenticated users can upload documents`
  - WITH CHECK: `bucket_id = 'documents' AND auth.uid() IS NOT NULL`

- [ ] **Policy 2**: View (SELECT)
  - Name: `Users can view documents in their tenant`
  - USING: `bucket_id = 'documents' AND auth.uid() IS NOT NULL`

- [ ] **Policy 3**: Update (UPDATE)
  - Name: `Users can update their documents`
  - USING: `bucket_id = 'documents' AND auth.uid() IS NOT NULL`
  - WITH CHECK: `bucket_id = 'documents' AND auth.uid() IS NOT NULL`

- [ ] **Policy 4**: Delete (DELETE)
  - Name: `Users can delete their documents`
  - USING: `bucket_id = 'documents' AND auth.uid() IS NOT NULL`

### Message Attachments Bucket Policies

- [ ] **Policy 5**: Upload (INSERT)
  - Name: `Authenticated users can upload message attachments`
  - WITH CHECK: `bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL`

- [ ] **Policy 6**: View (SELECT)
  - Name: `Users can view message attachments`
  - USING: `bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL`

---

## 🧪 Testing Checklist

After creating all policies:

- [ ] Test file upload via `/api/storage/upload`
- [ ] Test signed URL generation via `/api/storage/signed-url`
- [ ] Test document download via `/api/documents/[id]/download`
- [ ] Verify tenant isolation (users can't access other tenant files)
- [ ] Check error handling for unauthorized access

---

## 📚 Documentation

- [x] `STORAGE_CONFIGURATION.md` - Complete guide
- [x] `DASHBOARD_RLS_POLICIES_GUIDE.md` - Step-by-step dashboard guide
- [x] `STORAGE_POLICIES_QUICK_REFERENCE.md` - Quick SQL reference
- [x] `STORAGE_SETUP_CHECKLIST.md` - This checklist

---

## ✅ Completion Status

**Progress: 95%**

- ✅ Buckets: 100% (3/3 created)
- ✅ Code: 100% (all integration complete)
- 📋 Policies: 0% (0/6 created - need dashboard)

**Once all 6 policies are created: 100% Complete!**

---

*Checklist created: 2025-01-27*

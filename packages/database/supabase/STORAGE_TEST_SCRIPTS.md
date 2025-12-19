# Storage System - Test Scripts

**Date:** 2025-01-27  
**Purpose:** Verify all security layers are working correctly

---

## Test Script: Constraint Violation

### Test 1: File Size Violation

**Goal:** Verify hard database constraint catches oversized files

**cURL Command:**
```bash
# Create a 60MB test file (exceeds 50MB limit for documents bucket)
dd if=/dev/zero of=test_large.bin bs=1M count=60

# Attempt upload
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@test_large.bin" \
  -F "bucket=documents" \
  -F "category=test"

# Expected Response:
# {
#   "ok": false,
#   "error": {
#     "code": "PAYLOAD_TOO_LARGE",
#     "kind": "payload_too_large",
#     "message": "File size exceeds the maximum allowed size",
#     "requestId": "..."
#   }
# }
# Status: 413
```

**Verify:**
- ✅ Status code: `413`
- ✅ Error code: `PAYLOAD_TOO_LARGE`
- ✅ Message: User-friendly, no DB internals
- ✅ RequestId: Present

---

### Test 2: MIME Type Violation

**Goal:** Verify hard database constraint catches invalid file types

**cURL Command:**
```bash
# Create a fake .exe file (not allowed in public-assets)
echo "fake executable" > test.exe

# Attempt upload to public-assets (images only)
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@test.exe" \
  -F "bucket=public-assets" \
  -F "category=avatar"

# Expected Response:
# {
#   "ok": false,
#   "error": {
#     "code": "UNSUPPORTED_MEDIA_TYPE",
#     "kind": "unsupported_media_type",
#     "message": "This file type is not allowed for this bucket",
#     "requestId": "..."
#   }
# }
# Status: 415
```

**Verify:**
- ✅ Status code: `415`
- ✅ Error code: `UNSUPPORTED_MEDIA_TYPE`
- ✅ Message: User-friendly
- ✅ RequestId: Present

---

## Test Script: RLS Policy Violation

### Test 3: Cross-Tenant Upload

**Goal:** Verify RLS policies prevent cross-tenant access

**Setup:**
1. Create user in Tenant A
2. Attempt to upload to Tenant B's folder

**cURL Command:**
```bash
# Upload with Tenant B's path (user is in Tenant A)
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Cookie: tenant-a-session-cookie" \
  -F "file=@test.pdf" \
  -F "bucket=documents" \
  -F "category=test"
  # Path will be generated with Tenant A's ID, but if you manually specify Tenant B path...

# Expected Response:
# {
#   "ok": false,
#   "error": {
#     "code": "PERMISSION_DENIED",
#     "kind": "permission_denied",
#     "message": "You do not have permission to upload to this location",
#     "requestId": "..."
#   }
# }
# Status: 403
```

**Verify:**
- ✅ Status code: `403`
- ✅ Error code: `PERMISSION_DENIED`
- ✅ Message: Generic (no policy details exposed)
- ✅ RequestId: Present
- ✅ **No file created in storage**
- ✅ **No metadata row created**

---

## Test Script: Success Path

### Test 4: Valid Upload

**Goal:** Verify successful upload and trigger execution

**cURL Command:**
```bash
# Upload valid PDF file
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@test.pdf" \
  -F "bucket=documents" \
  -F "category=invoice"

# Expected Response:
# {
#   "ok": true,
#   "data": {
#     "fileUrl": "https://...",
#     "fileName": "...",
#     "path": "...",
#     "bucket": "documents",
#     "size": 12345,
#     "mimeType": "application/pdf",
#     "metadata": {}
#   },
#   "requestId": "..."
# }
# Status: 200
```

**Verify:**
- ✅ Status code: `200`
- ✅ File URL is signed URL (for private buckets)
- ✅ RequestId: Present
- ✅ **Trigger fired:** Check app table for new record
  ```sql
  SELECT * FROM documents WHERE file_url = '...';
  ```

---

## Test Script: Error Handling

### Test 5: Non-JSON Response

**Goal:** Verify client handles non-JSON gracefully

**Setup:**
- Simulate WAF/proxy returning HTML error page

**Expected:**
- ✅ Client doesn't crash
- ✅ User-friendly error message
- ✅ RequestId preserved if available

---

### Test 6: Abort Handling

**Goal:** Verify abort is handled gracefully

**JavaScript Test:**
```typescript
const { uploadFile } = useStorage();

const controller = new AbortController();

// Start upload
const uploadPromise = uploadFile("documents", file, {
  onProgress: (p) => console.log(`${p}%`),
});

// Abort after 1 second
setTimeout(() => controller.abort(), 1000);

try {
  await uploadPromise;
} catch (error) {
  // Expected: "Upload was cancelled."
  console.log(error.message);
}
```

**Verify:**
- ✅ Error message: "Upload was cancelled."
- ✅ Not treated as failure
- ✅ No error state set

---

## Automated Test Suite

### Complete Test Script

```bash
#!/bin/bash
# storage_test_suite.sh

BASE_URL="http://localhost:3000"
SESSION_COOKIE="your-session-cookie"

echo "=== Storage System Test Suite ==="

# Test 1: File Size Violation
echo "Test 1: File Size Violation"
dd if=/dev/zero of=test_large.bin bs=1M count=60 2>/dev/null
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/storage/upload" \
  -H "Cookie: $SESSION_COOKIE" \
  -F "file=@test_large.bin" \
  -F "bucket=documents")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "413" ]; then
  echo "✅ PASS: File size violation caught"
else
  echo "❌ FAIL: Expected 413, got $HTTP_CODE"
fi
rm test_large.bin

# Test 2: MIME Type Violation
echo "Test 2: MIME Type Violation"
echo "fake" > test.exe
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/storage/upload" \
  -H "Cookie: $SESSION_COOKIE" \
  -F "file=@test.exe" \
  -F "bucket=public-assets")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "415" ]; then
  echo "✅ PASS: MIME type violation caught"
else
  echo "❌ FAIL: Expected 415, got $HTTP_CODE"
fi
rm test.exe

# Test 3: Valid Upload
echo "Test 3: Valid Upload"
echo "test content" > test.pdf
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/storage/upload" \
  -H "Cookie: $SESSION_COOKIE" \
  -F "file=@test.pdf" \
  -F "bucket=documents")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS: Valid upload succeeded"
else
  echo "❌ FAIL: Expected 200, got $HTTP_CODE"
fi
rm test.pdf

echo "=== Test Suite Complete ==="
```

---

## Database Verification Queries

### After Running Tests

**Check Storage Objects:**
```sql
-- Verify only valid files were uploaded
SELECT 
  bucket_id,
  name,
  (metadata->>'size')::bigint as size,
  metadata->>'mimetype' as mime_type,
  created_at
FROM storage.objects
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Check Anomalies:**
```sql
-- Should return no anomalies after cleanup
SELECT * FROM check_storage_anomalies();
```

**Check Trigger Execution:**
```sql
-- Verify documents were synced (if documents table exists)
SELECT COUNT(*) FROM documents
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## Expected Test Results

| Test | Expected Status | Expected Code | Expected Message |
|------|----------------|---------------|------------------|
| Size Violation | 413 | `PAYLOAD_TOO_LARGE` | "File size exceeds..." |
| MIME Violation | 415 | `UNSUPPORTED_MEDIA_TYPE` | "This file type is not allowed..." |
| RLS Violation | 403 | `PERMISSION_DENIED` | "You do not have permission..." |
| Valid Upload | 200 | - | Success response |
| Abort | - | - | "Upload was cancelled." |

---

*Test Scripts created: 2025-01-27*

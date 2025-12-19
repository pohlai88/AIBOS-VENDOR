# Storage Error Handling Guide

**Date:** 2025-01-27  
**Status:** ✅ **Enterprise-Grade Error Handling Implemented**

---

## Overview

The storage system now includes comprehensive error handling that translates database-level constraint violations and RLS policy errors into user-friendly messages. This ensures users see helpful error messages even when database constraints are enforced.

---

## Error Handling Architecture

### Defense-in-Depth Error Detection

The error handling system checks for errors at multiple levels:

1. **Application Layer** - Frontend validation (file size, type)
2. **API Layer** - Server-side validation
3. **Database Layer** - Hard constraints (file size, MIME type limits)
4. **RLS Layer** - Row Level Security policies

### Error Flow

```
Database Constraint Violation
    ↓
Supabase Storage API
    ↓
Next.js API Route (/api/storage/upload)
    ↓
useStorage Hook (handleUploadError)
    ↓
User-Friendly Error Message
```

---

## Postgres Error Codes Handled

### 1. Check Constraint Violations (23514)

**When it occurs:**
- File size exceeds database limit (e.g., > 50MB for documents bucket)
- File type not in allowed MIME types list
- Other check constraint violations

**User Message:**
- Size violation: "Upload failed: File size exceeds the strict database limit. Please choose a smaller file."
- Type violation: "Upload failed: This file type is strictly prohibited by the server. Please check the allowed file types for this bucket."

**Example:**
```typescript
// Database rejects file > 50MB
// Error code: 23514
// Message: "Upload failed: File size exceeds the strict database limit."
```

### 2. RLS Policy Violations (42501)

**When it occurs:**
- User doesn't have permission to upload to bucket
- RLS policy denies access based on tenant/organization
- Insufficient privileges

**User Message:**
"Access denied: You do not have permission to upload to this location. Please contact your administrator."

**Example:**
```typescript
// User tries to upload to bucket they don't have access to
// Error code: 42501
// Message: "Access denied: You do not have permission to upload to this location."
```

---

## Implementation Details

### useStorage Hook Error Handler

The `handleUploadError` function in `apps/web/src/hooks/useStorage.ts`:

1. **Extracts error details** from nested Supabase/Postgres errors
2. **Checks multiple error sources** (error.code, originalError.code, errorMessage)
3. **Translates Postgres codes** to user-friendly messages
4. **Handles edge cases** (network errors, auth errors, validation errors)

### API Route Error Preservation

The upload route (`apps/web/src/app/api/storage/upload/route.ts`):

1. **Preserves Postgres error codes** in response
2. **Extracts nested errors** from Supabase error objects
3. **Returns appropriate HTTP status codes**:
   - 400 for constraint violations
   - 403 for RLS violations
   - 500 for other errors

---

## Error Handling Examples

### Example 1: File Size Violation

```typescript
// User uploads 60MB file to documents bucket (limit: 50MB)
// Frontend validation might be bypassed or incorrect

try {
  await uploadFile("documents", largeFile);
} catch (error) {
  // Error caught by handleUploadError
  // Detects: errorCode === "23514" or errorMessage includes "file_size_limit"
  // Returns: "Upload failed: File size exceeds the strict database limit."
  console.error(error.message);
}
```

### Example 2: MIME Type Violation

```typescript
// User uploads .exe file (not in allowed types)
// Database constraint rejects it

try {
  await uploadFile("documents", executableFile);
} catch (error) {
  // Error caught by handleUploadError
  // Detects: errorMessage includes "allowed_mime_types"
  // Returns: "Upload failed: This file type is strictly prohibited by the server."
  console.error(error.message);
}
```

### Example 3: RLS Policy Violation

```typescript
// User tries to upload to bucket they don't have access to
// RLS policy denies access

try {
  await uploadFile("restricted-bucket", file);
} catch (error) {
  // Error caught by handleUploadError
  // Detects: errorCode === "42501" or errorMessage includes "policy"
  // Returns: "Access denied: You do not have permission to upload to this location."
  console.error(error.message);
}
```

---

## Monitoring Storage Health

### Check for Anomalies

```sql
-- Run in Supabase SQL Editor
SELECT * FROM check_storage_anomalies();
```

**Returns:**
- Files exceeding bucket limits
- Files with invalid MIME types
- Orphaned files (not referenced in database)

### View Storage Usage

```sql
-- Run in Supabase SQL Editor
SELECT * FROM get_storage_usage_report();
```

**Returns:**
- File count per bucket
- Total size per bucket
- Oldest/newest files

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ✅ GOOD: Handle errors with user-friendly messages
try {
  const result = await uploadFile("documents", file);
  showSuccess("File uploaded successfully!");
} catch (error) {
  // Error is already user-friendly from handleUploadError
  showError(error.message);
}
```

### 2. Show Specific Error Messages

```typescript
// ✅ GOOD: Use error.message (already user-friendly)
catch (error) {
  toast.error(error.message); // Shows specific message
}

// ❌ BAD: Generic error message
catch (error) {
  toast.error("Upload failed"); // Not helpful
}
```

### 3. Log Errors for Debugging

```typescript
// ✅ GOOD: Log full error details for debugging
catch (error) {
  console.error("[Upload Error]", {
    message: error.message,
    code: error.code,
    originalError: error.originalError,
  });
  showError(error.message); // Show user-friendly message
}
```

---

## Error Codes Reference

| Code | Type | HTTP Status | User Message |
|------|------|-------------|--------------|
| `23514` | Check Constraint | 400 | "File size/type exceeds database limit" |
| `42501` | RLS Policy | 403 | "Access denied: Permission required" |
| `401` | Authentication | 401 | "Authentication required" |
| `NETWORK_ERROR` | Network | - | "Network error: Check connection" |
| `FILE_VALIDATION_ERROR` | Validation | 400 | "File validation error" |

---

## Testing Error Handling

### Test Constraint Violations

1. **Size Violation:**
   - Upload file > 50MB to documents bucket
   - Should see: "File size exceeds the strict database limit"

2. **Type Violation:**
   - Upload .exe file to documents bucket
   - Should see: "This file type is strictly prohibited"

3. **RLS Violation:**
   - Try to upload to bucket without permission
   - Should see: "Access denied: You do not have permission"

---

## Troubleshooting

### Error Not Showing User-Friendly Message

**Check:**
1. Error code is being preserved in API route
2. `handleUploadError` is being called
3. Error object structure matches expected format

**Debug:**
```typescript
catch (error) {
  console.log("Error structure:", {
    code: error.code,
    message: error.message,
    originalError: error.originalError,
  });
}
```

### Postgres Error Not Detected

**Check:**
1. Error code is numeric (23514) vs string ("23514")
2. Error is nested in `originalError` property
3. Error message includes constraint keywords

**Solution:**
The error handler checks both numeric and string codes, and multiple error sources.

---

**Last Updated:** 2025-01-27  
**Status:** ✅ **Enterprise-Grade Error Handling Complete**

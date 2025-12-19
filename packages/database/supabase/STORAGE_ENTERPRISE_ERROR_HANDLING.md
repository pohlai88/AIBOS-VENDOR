# Storage Enterprise Error Handling - Final Implementation

**Date:** 2025-01-27  
**Status:** ✅ **ENTERPRISE-GRADE ERROR HANDLING COMPLETE**

---

## Executive Summary

The storage system now implements **enterprise-grade error handling** with:
- ✅ Consistent JSON error envelope
- ✅ Request ID / Correlation ID tracking
- ✅ Proper HTTP status code mapping
- ✅ Security-conscious error messages (no DB internals exposed)
- ✅ Comprehensive RLS/permission error detection
- ✅ Robust client-side error handling (non-JSON, aborts, offline)

---

## Error Response Envelope

### Standard Format

**Success Response:**
```json
{
  "ok": true,
  "data": {
    "fileUrl": "...",
    "fileName": "...",
    "path": "...",
    "bucket": "...",
    "size": 12345,
    "mimeType": "application/pdf",
    "metadata": {}
  },
  "requestId": "1706284800000-a1b2c3d4"
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "kind": "constraint_violation",
    "message": "File size exceeds the strict database limit",
    "requestId": "1706284800000-a1b2c3d4"
  }
}
```

---

## HTTP Status Code Mapping

| Status | Error Kind | Use Case | Example |
|--------|------------|----------|---------|
| **400** | `constraint_violation` | DB check constraint (23514) | File size/type violation |
| **401** | `authentication_required` | Not authenticated | Missing/invalid session |
| **403** | `permission_denied` | RLS policy violation (42501) | Insufficient permissions |
| **409** | `conflict` | Unique violation (23505) | Duplicate file path |
| **413** | `payload_too_large` | Pre-DB size check | File too large |
| **415** | `unsupported_media_type` | MIME type violation | Invalid file type |
| **500** | `internal_error` | Server/infrastructure error | Unexpected failure |

---

## Error Code Mapping

### Server-Side (Logged, Not Exposed)

**Postgres Error Codes:**
- `23514` → Check constraint violation
- `23505` → Unique constraint violation
- `42501` → Insufficient privilege (RLS)

**Internal Constraint Names (Server Logs Only):**
- `file_size_limit` → Mapped to `CONSTRAINT_VIOLATION`
- `allowed_mime_types` → Mapped to `UNSUPPORTED_MEDIA_TYPE`

### Client-Side (Exposed in API)

**Safe Error Codes:**
- `CONSTRAINT_VIOLATION` → Generic constraint error
- `PERMISSION_DENIED` → RLS/policy violation
- `AUTHENTICATION_REQUIRED` → Auth error
- `CONFLICT` → Duplicate/unique violation
- `PAYLOAD_TOO_LARGE` → File too large
- `UNSUPPORTED_MEDIA_TYPE` → Invalid MIME type
- `FILE_VALIDATION_ERROR` → API validation error
- `FILE_REQUIRED` → Missing file

---

## RLS / Permission Error Detection

### Comprehensive Pattern Matching

The system detects RLS/permission errors through:

1. **Postgres Error Code:** `42501`
2. **Message Patterns:**
   - `"row-level security policy"`
   - `"permission denied"`
   - `"policy"`
   - `"RLS"`
   - `"access denied"`
   - `"insufficient privilege"`

3. **Storage Layer Errors:**
   - Non-Postgres errors from Supabase Storage
   - May not have SQLSTATE codes
   - Detected via message patterns

**Result:** All permission errors map to `403` with `PERMISSION_DENIED` code.

---

## Security: No DB Internals Exposed

### Server-Side Logs (Full Details)

```typescript
logError("[Storage Upload Error]", uploadError, {
  userId: user.id,
  bucket,
  fileName,
  requestId,
  // Server-side only:
  originalError: originalError,
  errorCode: originalError?.code,
  constraintName: errorMessage?.match(/constraint "([^"]+)"/)?.[1],
});
```

### Client-Side Response (Sanitized)

```json
{
  "ok": false,
  "error": {
    "code": "CONSTRAINT_VIOLATION",  // Safe code, not "23514"
    "kind": "constraint_violation",
    "message": "File size exceeds the strict database limit",  // Friendly, no constraint names
    "requestId": "1706284800000-a1b2c3d4"
  }
}
```

**Key Points:**
- ✅ No Postgres error codes exposed (`23514` → `CONSTRAINT_VIOLATION`)
- ✅ No constraint names exposed (`file_size_limit` → generic message)
- ✅ No table/schema names exposed
- ✅ Request ID for correlation (debugging without exposing internals)

---

## Client-Side Error Handling

### Robust Error Parsing

The `useStorage` hook handles:

1. **API Error Envelope** (new format)
   ```typescript
   { ok: false, error: { code, kind, message, requestId } }
   ```

2. **Legacy Format** (backward compatibility)
   ```typescript
   { success: false, error: "...", code: "..." }
   ```

3. **Non-JSON Responses**
   - HTML error pages (WAF, proxy)
   - Plain text errors
   - Empty responses

4. **Network Errors**
   - Abort errors (user cancellation)
   - Offline detection (`navigator.onLine`)
   - Timeout errors

5. **Error Kinds** (from API envelope)
   - `constraint_violation`
   - `permission_denied`
   - `authentication_required`
   - `validation_error`
   - `conflict`
   - `payload_too_large`
   - `unsupported_media_type`
   - `service_unavailable`
   - `internal_error`

---

## Request ID / Correlation ID

### Generation

**Format:** `{timestamp}-{random}` (e.g., `1706284800000-a1b2c3d4`)

**Usage:**
- Generated at request start
- Included in all responses (success + error)
- Logged server-side with full error details
- Returned to client for user support

### Benefits

1. **Debugging:** Single ID correlates client error with server logs
2. **Support:** Users can provide requestId for issue tracking
3. **Monitoring:** Track error rates by requestId patterns
4. **Tracing:** Follow request through entire stack

---

## Error Message Examples

### Constraint Violation (23514)

**Server Log:**
```
Error: violates check constraint "file_size_limit"
Code: 23514
Constraint: file_size_limit
```

**Client Response:**
```json
{
  "ok": false,
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "kind": "constraint_violation",
    "message": "File size exceeds the strict database limit",
    "requestId": "1706284800000-a1b2c3d4"
  }
}
```

**User Message:**
```
"Upload failed: File size exceeds the limit. Please choose a smaller file."
```

---

### RLS Policy Violation (42501)

**Server Log:**
```
Error: new row violates row-level security policy "Users can upload documents"
Code: 42501
```

**Client Response:**
```json
{
  "ok": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "kind": "permission_denied",
    "message": "You do not have permission to upload to this location",
    "requestId": "1706284800000-a1b2c3d4"
  }
}
```

**User Message:**
```
"Access denied: You do not have permission to upload to this location. Please contact your administrator."
```

---

### MIME Type Violation

**Server Log:**
```
Error: violates check constraint "allowed_mime_types"
Code: 23514
Constraint: allowed_mime_types
```

**Client Response:**
```json
{
  "ok": false,
  "error": {
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "kind": "unsupported_media_type",
    "message": "This file type is not allowed for this bucket",
    "requestId": "1706284800000-a1b2c3d4"
  }
}
```

**User Message:**
```
"Upload failed: This file type is not allowed. Please check the allowed file types for this bucket."
```

---

## Testing Recommendations

### 1. Constraint Violation Test

**Test:** Upload file exceeding bucket size limit

**Expected:**
- Status: `400`
- Code: `CONSTRAINT_VIOLATION`
- Kind: `constraint_violation`
- Message: Friendly, no constraint names
- RequestId: Present

### 2. RLS Policy Test

**Test:** Upload with wrong tenant user

**Expected:**
- Status: `403`
- Code: `PERMISSION_DENIED`
- Kind: `permission_denied`
- Message: Generic permission error
- RequestId: Present
- **No metadata row created**

### 3. Non-JSON Response Test

**Test:** Simulate WAF/proxy HTML response

**Expected:**
- Client handles gracefully
- User-friendly error message
- No crash

### 4. Abort Test

**Test:** User cancels upload

**Expected:**
- Error: "Upload was cancelled."
- Not treated as failure
- No error state set

---

## Implementation Files

### Updated Files

1. **`lib/request-id.ts`** (NEW)
   - Request ID generation
   - Request ID extraction from headers

2. **`lib/api-utils.ts`** (UPDATED)
   - Enhanced error envelope with `ok`, `kind`, `requestId`
   - Error kind mapping
   - Consistent response structure

3. **`app/api/storage/upload/route.ts`** (UPDATED)
   - Request ID generation
   - Comprehensive error detection
   - Constraint name mapping (server-only)
   - Proper HTTP status codes
   - Pre-DB size check (413)

4. **`hooks/useStorage.ts`** (UPDATED)
   - Enterprise error parsing
   - Non-JSON handling
   - Abort/offline/timeout handling
   - Error kind support
   - Request ID preservation

---

## Summary

✅ **Enterprise-Grade Error Handling Complete**

**Features:**
- ✅ Consistent JSON envelope (`ok`, `error.kind`, `error.requestId`)
- ✅ Proper HTTP status codes (400, 401, 403, 409, 413, 415, 500)
- ✅ Security-conscious (no DB internals exposed)
- ✅ Comprehensive RLS detection (code + message patterns)
- ✅ Request ID correlation
- ✅ Robust client handling (non-JSON, aborts, offline)
- ✅ Backward compatible (legacy format support)

**Status:** ✅ **PRODUCTION-READY**

---

*Implementation completed: 2025-01-27*

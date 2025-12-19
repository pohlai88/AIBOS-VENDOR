# Error Handling Test Plan

**Purpose:** Verify enterprise error handling works correctly under production conditions  
**Status:** Ready for implementation

---

## Test 1: Route Handler Contract Test

### Objective
Verify every error path returns consistent envelope format with request ID.

### Test Cases

#### 1.1 Success Response Format
```typescript
// Test: Success response includes requestId in JSON and header
const response = await POST("/api/storage/upload", formData);
expect(response.headers.get("x-request-id")).toBeDefined();
expect(response.json()).toMatchObject({
  ok: true,
  data: expect.any(Object),
  requestId: expect.any(String),
});
```

#### 1.2 Error Response Format
```typescript
// Test: Error response includes requestId in JSON and header
const response = await POST("/api/storage/upload", invalidFile);
expect(response.headers.get("x-request-id")).toBeDefined();
expect(response.json()).toMatchObject({
  ok: false,
  error: {
    code: expect.any(String),
    kind: expect.any(String),
    message: expect.any(String),
    requestId: expect.any(String),
  },
});
```

#### 1.3 Request ID Propagation
```typescript
// Test: Incoming request ID is reused
const incomingId = "test-request-id-123";
const response = await POST("/api/storage/upload", formData, {
  headers: { "x-request-id": incomingId },
});
expect(response.headers.get("x-request-id")).toBe(incomingId);
expect(response.json().requestId).toBe(incomingId);
```

---

## Test 2: useStorage Parser Test

### Objective
Verify error parser handles all formats and never crashes.

### Test Cases

#### 2.1 JSON Envelope Format
```typescript
// Test: Handles new envelope format
const error = {
  ok: false,
  error: {
    code: "CONSTRAINT_VIOLATION",
    kind: "constraint_violation",
    message: "File size exceeds limit",
    requestId: "test-id",
  },
};
const result = handleUploadError(error);
expect(result.message).toContain("File size");
expect(result.requestId).toBe("test-id");
```

#### 2.2 Legacy Format
```typescript
// Test: Handles legacy format
const error = {
  success: false,
  error: "File too large",
  code: "FILE_VALIDATION_ERROR",
};
const result = handleUploadError(error);
expect(result.message).toBeDefined();
```

#### 2.3 Non-JSON Response
```typescript
// Test: Handles HTML/text responses
const error = {
  message: "<html><body>Error</body></html>",
};
const result = handleUploadError(error);
expect(result.message).toBeDefined();
expect(result.message).not.toContain("<html>");
```

#### 2.4 AbortError
```typescript
// Test: Handles abort errors
const error = {
  name: "AbortError",
  message: "Upload aborted",
};
const result = handleUploadError(error);
expect(result.message).toContain("aborted");
```

#### 2.5 Network Error
```typescript
// Test: Handles network errors
const error = {
  message: "Network error during upload",
  code: "NETWORK_ERROR",
};
const result = handleUploadError(error);
expect(result.message).toContain("Network");
```

#### 2.6 Offline Error
```typescript
// Test: Handles offline errors
const error = new Error("Failed to fetch");
const result = handleUploadError(error);
expect(result.message).toBeDefined();
```

---

## Test 3: Error Classification Test

### Objective
Verify errors are classified correctly and conservatively.

### Test Cases

#### 3.1 Constraint Violation (23514)
```typescript
// Test: DB constraint violation → 400 CONSTRAINT_VIOLATION
const error = {
  code: "23514",
  message: "violates check constraint file_size_limit",
};
const result = handleUploadError(error);
expect(result.message).toContain("File size exceeds");
```

#### 3.2 RLS Policy (42501) - Conservative
```typescript
// Test: RLS error with code → 403 PERMISSION_DENIED
const error = {
  code: "42501",
  message: "row-level security policy violation",
};
const result = handleUploadError(error);
expect(result.message).toContain("permission");
```

#### 3.3 RLS Policy (Ambiguous) - Safe Fallback
```typescript
// Test: Generic "policy" mention without code → generic error
const error = {
  message: "policy violation",
  // No code
};
const result = handleUploadError(error);
// Should NOT be classified as permission denied
expect(result.message).not.toContain("permission");
```

#### 3.4 Unique Constraint (23505)
```typescript
// Test: Unique constraint → 409 CONFLICT
const error = {
  code: "23505",
  message: "unique constraint violation",
};
const result = handleUploadError(error);
expect(result.message).toContain("already exists");
```

---

## Test 4: Information Leak Prevention

### Objective
Verify no sensitive information leaks to client.

### Test Cases

#### 4.1 No Constraint Names
```typescript
// Test: Constraint names not exposed
const error = {
  code: "23514",
  message: 'violates check constraint "storage_file_size_limit"',
};
const result = handleUploadError(error);
expect(result.message).not.toContain("storage_file_size_limit");
```

#### 4.2 No SQLSTATE Codes
```typescript
// Test: SQLSTATE codes not exposed
const error = {
  code: "23514",
  message: "PostgreSQL error 23514",
};
const result = handleUploadError(error);
expect(result.message).not.toContain("23514");
```

#### 4.3 No Stack Traces
```typescript
// Test: Stack traces not exposed
const error = {
  message: "Error",
  stack: "Error: ...\n  at ...",
};
const result = handleUploadError(error);
expect(result.message).not.toContain("at ");
```

---

## Test 5: Request ID Correlation

### Objective
Verify request IDs enable end-to-end correlation.

### Test Cases

#### 5.1 Request ID in Logs
```typescript
// Test: Server logs include requestId
// Verify logError is called with requestId
// (Manual verification in logs)
```

#### 5.2 Request ID in Response
```typescript
// Test: Response includes requestId
const response = await POST("/api/storage/upload", formData);
const requestId = response.json().requestId;
expect(requestId).toBeDefined();
expect(response.headers.get("x-request-id")).toBe(requestId);
```

#### 5.3 Request ID Propagation
```typescript
// Test: Request ID propagates through middleware → route → response
const incomingId = "propagated-id";
const response = await POST("/api/storage/upload", formData, {
  headers: { "x-request-id": incomingId },
});
expect(response.json().requestId).toBe(incomingId);
```

---

## Implementation Notes

### Test Framework
- Use Jest/Vitest for unit tests
- Use Playwright for E2E tests
- Mock Supabase errors for consistent testing

### Test Data
- Create test files of various sizes
- Create test files with invalid MIME types
- Simulate network errors
- Simulate database constraint violations

### Coverage Goals
- ✅ 100% error paths covered
- ✅ 100% error formats handled
- ✅ 100% classification rules tested
- ✅ 100% information leak prevention verified

---

**Last Updated:** 2025-01-27  
**Status:** Ready for test implementation

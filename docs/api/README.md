# API Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Purpose:** Complete API reference for the AI-BOS Vendor Portal REST API  
**Status:** Active - Maintained with API changes

---

## Overview

The AI-BOS Vendor Portal API provides RESTful endpoints for managing documents, payments, statements, and messages.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except `/api/auth/*`) require authentication via Supabase session cookies.

### Headers

```
Authorization: Bearer <token>
```

## API Versioning

The API supports versioning via URL path:

- **v1**: `/api/v1/*` (Current stable version)
- **v2**: `/api/v2/*` (Future version)

Version can also be specified via `Accept` header:
```
Accept: application/json; version=1
```

## Rate Limiting

- **Public endpoints**: 60 requests/minute
- **Authenticated endpoints**: 200 requests/minute
- **Admin endpoints**: 500 requests/minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/profile` - Update user profile
- `POST /api/auth/password` - Change password
- `GET /api/auth/preferences` - Get user preferences
- `POST /api/auth/preferences` - Update user preferences

### Documents

- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Upload document
- `GET /api/v1/documents/:id` - Get document
- `DELETE /api/v1/documents/:id` - Delete document
- `GET /api/v1/documents/:id/download` - Download document

### Payments

- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/:id` - Get payment
- `PATCH /api/v1/payments/:id` - Update payment
- `GET /api/v1/payments/export` - Export payments (CSV)

### Statements

- `GET /api/v1/statements` - List statements
- `GET /api/v1/statements/:id` - Get statement
- `GET /api/v1/statements/:id/export` - Export statement (CSV)

### Messages

- `GET /api/v1/messages` - List messages/threads
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/threads` - List message threads

### Webhooks

- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `PATCH /api/webhooks/:id` - Update webhook
- `DELETE /api/webhooks/:id` - Delete webhook

### GDPR

- `GET /api/gdpr/export` - Export user data
- `POST /api/gdpr/delete` - Delete user account
- `GET /api/gdpr/consent` - Get consent status
- `POST /api/gdpr/consent` - Record consent

### Health & Status

- `GET /api/health` - Health check
- `GET /api/status` - System status

## Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Pagination

List endpoints support pagination:

```
GET /api/v1/documents?page=1&limit=10
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## Filtering & Sorting

Most list endpoints support filtering and sorting:

```
GET /api/v1/documents?category=invoice&sortBy=created_at&sortOrder=desc
```

## Webhooks

Webhooks are delivered via HTTP POST to configured URLs with:

- `X-Webhook-Signature`: HMAC-SHA256 signature
- `X-Webhook-Event`: Event type
- `X-Webhook-Id`: Unique event ID

### Events

- `document.uploaded`
- `document.deleted`
- `payment.completed`
- `payment.failed`
- `message.sent`
- `user.created`
- `user.updated`

## Examples

### Upload Document

```bash
curl -X POST https://api.example.com/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "name=Invoice Q1" \
  -F "category=invoice"
```

### Create Payment

```bash
curl -X POST https://api.example.com/api/v1/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "vendor-uuid",
    "amount": 1000.00,
    "currency": "USD",
    "status": "pending",
    "method": "bank_transfer",
    "dueDate": "2025-02-01"
  }'
```

## OpenAPI Specification

Full OpenAPI/Swagger specification available at:
- `/api/docs` (when implemented)
- `/api/openapi.json` (when implemented)

## Support

For API support, contact: support@example.com

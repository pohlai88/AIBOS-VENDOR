# API Version 1 Documentation

## Overview

This is version 1 of the AI-BOS Vendor Portal API. All endpoints under `/api/v1/` follow the v1 specification.

## Versioning Strategy

- **URL-based versioning**: `/api/v1/documents`
- **Header-based versioning**: `Accept: application/json; version=1`

## Endpoints

### Documents
- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Create document
- `GET /api/v1/documents/:id` - Get document
- `PATCH /api/v1/documents/:id` - Update document
- `DELETE /api/v1/documents/:id` - Delete document

### Payments
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/:id` - Get payment
- `PATCH /api/v1/payments/:id` - Update payment

### Statements
- `GET /api/v1/statements` - List statements
- `GET /api/v1/statements/:id` - Get statement

### Messages
- `GET /api/v1/messages` - List messages/threads
- `POST /api/v1/messages` - Send message

## Response Format

All responses include:
- `version`: API version used
- Standard HTTP status codes
- Version headers (see below)

## Version Headers

Responses include:
- `API-Version`: Current API version
- `Deprecated`: "true" if version is deprecated
- `Deprecation-Date`: Date when version was deprecated
- `Sunset-Date`: Date when version will be sunset
- `Link`: Migration guide URL (if deprecated)

## Migration

When migrating to v2:
1. Check `Deprecated` header
2. Review migration guide in `Link` header
3. Update client to use v2 endpoints
4. Test thoroughly before sunset date

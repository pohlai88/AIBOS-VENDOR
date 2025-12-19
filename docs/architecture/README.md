# Architecture Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Purpose:** System architecture, design patterns, and technology stack documentation  
**Status:** Active - Updated with Next.js 16 and React 19

---

## System Overview

The AI-BOS Vendor Portal is a Next.js 16 application built with React 19, TypeScript, and Supabase.

## Architecture Diagram

```
┌─────────────────┐
│   Client (Web)  │
│   Next.js 16    │
│   React 19      │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────────────────────┐
│      Next.js Server             │
│  ┌──────────────────────────┐  │
│  │  API Routes               │  │
│  │  - /api/documents         │  │
│  │  - /api/payments          │  │
│  │  - /api/messages          │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  Middleware              │  │
│  │  - Rate Limiting         │  │
│  │  - Authentication        │  │
│  │  - Audit Logging         │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
         │
┌────────▼────────────────────────┐
│      Supabase                    │
│  ┌──────────────────────────┐  │
│  │  PostgreSQL Database      │  │
│  │  - Row Level Security     │  │
│  │  - Real-time Subscriptions│  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  Storage                  │  │
│  │  - Document Files         │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  Auth                     │  │
│  │  - User Management        │  │
│  │  - Sessions               │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
         │
         │
┌────────▼────────────────────────┐
│   External Services              │
│  ┌──────────────────────────┐  │
│  │  Resend (Email)           │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  Upstash Redis (Rate Limit)│  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  Sentry (Monitoring)      │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useCallback, useMemo)
- **Forms**: react-hook-form + zod

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Rate Limiting**: Upstash Redis
- **Error Tracking**: Sentry
- **Email**: Resend
- **CI/CD**: GitHub Actions

## Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── (auth)/       # Auth pages
│   │   └── (protected)/  # Protected pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json

packages/
├── ui/                   # Shared UI components
├── shared/               # Shared utilities
├── database/             # Database schemas
└── config/               # Shared configuration
```

## Data Flow

### Authentication Flow

1. User submits login credentials
2. Next.js API route calls Supabase Auth
3. Supabase validates credentials
4. Session cookie set
5. Middleware validates session on subsequent requests

### Document Upload Flow

1. User uploads file via form
2. Client sends multipart/form-data to `/api/documents`
3. Server validates authentication
4. File uploaded to Supabase Storage
5. Document record created in database
6. Cache invalidated
7. Webhook triggered (if configured)
8. Email notification sent (if enabled)
9. Response returned to client

### Real-time Updates

1. Supabase Realtime subscription established
2. Database changes trigger events
3. Client receives updates via WebSocket
4. UI updates automatically
5. Optimistic updates for better UX

## Security Architecture

### Authentication & Authorization

- **Authentication**: Supabase Auth (JWT-based)
- **Authorization**: Row Level Security (RLS) policies
- **Session Management**: HTTP-only cookies
- **2FA**: TOTP-based (when implemented)
- **SSO/SAML**: Supported (when configured)

### Security Headers

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### Rate Limiting

- Distributed rate limiting via Upstash Redis
- Tiered limits (public, authenticated, admin)
- Automatic DDoS protection

### Audit Logging

- All user actions logged
- API requests/responses tracked
- Security events monitored
- Compliance-ready format

## Database Schema

### Core Tables

- `organizations` - Companies and vendors
- `users` - User accounts
- `documents` - Document metadata
- `payments` - Payment records
- `statements` - Financial statements
- `messages` - Message threads and content
- `audit_logs` - Audit trail
- `webhooks` - Webhook configurations

### Relationships

- Users belong to Organizations
- Documents belong to Organizations
- Payments link Organizations and Vendors
- Messages link Organizations and Vendors

## Caching Strategy

### Next.js Caching

- **Route Handlers**: `revalidate` with tags
- **Server Components**: `revalidate` with tags
- **Static Assets**: Long-term caching
- **API Responses**: Tag-based invalidation

### Cache Tags

- `documents` - Document-related data
- `payments` - Payment data
- `statements` - Statement data
- `messages` - Message data

## Monitoring & Observability

### Error Tracking

- Sentry integration
- Error boundaries
- Centralized logging
- Performance monitoring

### Health Checks

- `/api/health` - Simple health check
- `/api/status` - Detailed system status
- Dependency health monitoring

### Logging

- Centralized logger
- Structured logging
- External log shipping (CloudWatch, Datadog)
- Audit logging

## Deployment

### Environments

- **Development**: Local with Supabase
- **Staging**: Vercel preview deployments
- **Production**: Vercel production

### CI/CD Pipeline

1. Code pushed to GitHub
2. GitHub Actions runs:
   - Linting
   - Type checking
   - Tests
   - Build
3. Deploy to Vercel
4. Run health checks
5. Monitor deployment

## Scalability

### Horizontal Scaling

- Stateless API routes
- Database connection pooling
- CDN for static assets
- Edge functions for global distribution

### Performance Optimization

- React.memo for component optimization
- Database query optimization
- Image optimization
- Code splitting
- Bundle optimization

## Compliance

### GDPR

- Data export functionality
- Right to be forgotten
- Consent management
- Privacy policy tracking

### Data Retention

- Configurable retention policies
- Automated cleanup jobs
- Audit log retention (7 years)

## Disaster Recovery

- Daily automated backups
- Point-in-time recovery (Supabase Pro)
- Cross-region replication
- Backup verification
- Recovery procedures documented

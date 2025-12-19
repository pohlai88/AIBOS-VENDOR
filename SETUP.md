# Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Supabase account

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [Supabase Dashboard](https://app.supabase.com)
2. Note your project URL and anon key
3. Run the database migrations:

```bash
# Using Supabase CLI (recommended)
supabase link --project-ref your-project-ref
supabase db push

# Or manually run the SQL files in packages/database/supabase/migrations/
# in the Supabase SQL Editor
```

4. Set up storage buckets (see packages/database/supabase/README.md)

### 3. Configure Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

- `apps/web` - Next.js frontend application (with built-in API routes)
- `packages/ui` - Shared UI components
- `packages/database` - Database schemas and types
- `packages/shared` - Shared utilities and types
- `packages/config` - Shared configuration

## Features

- ✅ Authentication with Supabase Auth
- ✅ Document management with upload/download
- ✅ Financial statements with export
- ✅ Payment tracking and history
- ✅ Real-time messaging
- ✅ Role-based access control
- ✅ Row Level Security (RLS) policies

## Testing

```bash
pnpm test
```

## Building for Production

```bash
pnpm build
```

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Verify your environment variables are set correctly
2. **RLS policy errors**: Ensure migrations have been run and policies are active
3. **Storage upload errors**: Verify storage buckets are created and policies are set


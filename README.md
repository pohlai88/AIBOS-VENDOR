# AI-BOS Vendor Portal

A vendor login platform built with Next.js, TypeScript, and Supabase that enables vendors to access their documents, statements, payments, and messaging with hybrid access (vendor-specific data + shared company documents).

## Architecture

This is a monorepo built with:
- **Turborepo** - Task runner and build system
- **pnpm** - Package manager with workspaces
- **Next.js 16** - Frontend framework with React Server Components
- **React 19** - UI library
- **Supabase** - Database and authentication
- **TypeScript 5.7** - Type safety throughout

## Project Structure

```
AI-BOS-Vendor/
├── apps/
│   └── web/          # Next.js frontend application (with built-in API routes)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── database/     # Database schemas, migrations, types
│   ├── shared/       # Shared utilities and types
│   └── config/       # Shared configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Supabase account and project

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Fill in your Supabase credentials in `apps/web/.env.local`.

3. Run database migrations:
```bash
# Set up Supabase migrations (see packages/database/supabase/migrations/)
```

4. Start development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests across all packages
- `pnpm type-check` - Type check all packages

## Features

- **Authentication & Authorization** - Supabase Auth with role-based access control
- **Document Management** - Upload, download, and manage documents with access control
- **Financial Statements** - View vendor-specific and shared financial statements
- **Payment Management** - Track payments, history, and status
- **Messaging System** - Real-time messaging between company and vendors

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript 5.7, Tailwind CSS
- Backend: Next.js API routes (built-in server-side API)
- Database: Supabase (PostgreSQL with Row Level Security)
- Authentication: Supabase Auth
- Styling: Tailwind CSS with dark theme first approach
- Accessibility: WCAG 2.2 AAA compliance

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- 📚 **[Documentation Index](./docs/README.md)** - Complete documentation guide
- 🏗️ **[Architecture](./docs/architecture/README.md)** - System architecture and design
- 🔌 **[API Documentation](./docs/api/README.md)** - API endpoints and usage
- 🔒 **[Security](./docs/security/README.md)** - Security measures and best practices
- 📊 **[Implementation History](./docs/IMPLEMENTATION_HISTORY.md)** - Consolidated implementation records
- ⚡ **[Optimization Report](./docs/OPTIMIZATION_REPORT.md)** - Performance optimizations

## Design System

This project uses a comprehensive design system built on Figma standards with full light/dark theme support.

**Documentation:**
- 📋 **[Design System Evaluation & Improvements](./DESIGN_SYSTEM_EVALUATION_AND_IMPROVEMENTS.md)** - SSOT for design system refinement
- 📚 **[Design System Reference](./packages/ui/DESIGN_SYSTEM.md)** - Complete component and token documentation
- 📑 **[Documentation Index](./DESIGN_SYSTEM_DOCUMENTATION_INDEX.md)** - Quick reference guide

**Key Features:**
- Full light/dark theme support with system preference detection
- WCAG 2.2 AAA accessibility compliance
- Token-based architecture (colors, spacing, typography, etc.)
- Comprehensive component library (Button, Input, Card, Modal, Table, Select, Checkbox, Switch)
- Theme-aware components that automatically adapt

## License

Private - All rights reserved


# Next.js 16 Best Practices Configuration Guide

This document outlines best practices for Next.js 16 development in the AI-BOS Vendor Portal, covering frontend, backend (API routes), and component architecture.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [API Route Handlers](#api-route-handlers)
3. [Data Fetching Patterns](#data-fetching-patterns)
4. [Caching Strategies](#caching-strategies)
5. [Error Handling](#error-handling)
6. [Loading States & Streaming](#loading-states--streaming)
7. [Type Safety](#type-safety)
8. [Performance Optimizations](#performance-optimizations)
9. [File Structure Conventions](#file-structure-conventions)

---

## Component Architecture

### Server Components (Default)

**Use Server Components for:**
- Data fetching from databases or APIs
- Accessing backend-only resources (API keys, secrets)
- Reducing JavaScript bundle size
- Improving First Contentful Paint (FCP)
- Static content rendering

**Best Practices:**
```tsx
// ✅ GOOD: Server Component fetching data
// app/documents/page.tsx
import { Suspense } from 'react'
import { DocumentsListClient } from '@/components/documents/DocumentsListClient'

async function fetchDocuments() {
  const response = await fetch(`${getAppUrl()}/api/documents`, {
    next: { revalidate: 60, tags: ['documents'] }
  })
  return response.json()
}

export default async function DocumentsPage() {
  const data = await fetchDocuments()
  
  return (
    <Suspense fallback={<DocumentsSkeleton />}>
      <DocumentsListClient initialDocuments={data.documents} />
    </Suspense>
  )
}
```

**Key Points:**
- Server Components are async by default
- Can directly access databases, file system, and environment variables
- Cannot use hooks (`useState`, `useEffect`, etc.)
- Cannot use browser APIs (`window`, `localStorage`, etc.)
- Props must be serializable

### Client Components

**Use Client Components for:**
- Interactivity (onClick, onChange, etc.)
- State management (`useState`, `useReducer`)
- Lifecycle effects (`useEffect`, `useLayoutEffect`)
- Browser APIs (`localStorage`, `window`, `navigator`, etc.)
- Custom hooks
- Third-party libraries that require client-side JavaScript

**Best Practices:**
```tsx
// ✅ GOOD: Client Component with interactivity
// components/documents/DocumentsListClient.tsx
'use client'

import { useState, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'

export const DocumentsListClient = memo(function DocumentsListClient({
  initialDocuments,
}: {
  initialDocuments: Document[]
}) {
  const router = useRouter()
  const [documents, setDocuments] = useState(initialDocuments)

  const handleDelete = useCallback(async (id: string) => {
    // Optimistic update
    const previous = documents
    setDocuments(prev => prev.filter(doc => doc.id !== id))

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        setDocuments(previous) // Revert on error
      } else {
        router.refresh() // Refresh server data
      }
    } catch (error) {
      setDocuments(previous) // Revert on error
    }
  }, [documents, router])

  return (
    // Component JSX
  )
})
```

**Key Points:**
- Must have `'use client'` directive at the top
- Creates a boundary - all imported components become client components
- Keep client components small and focused
- Use `memo()` for expensive components
- Prefer passing data from Server Components as props

### Component Composition Pattern

**Recommended Pattern: Server Component + Client Component**

```tsx
// ✅ GOOD: Server Component fetches, Client Component renders
// components/documents/DocumentsList.tsx (Server Component)
import { DocumentsListClient } from './DocumentsListClient'
import { Suspense } from 'react'

export async function DocumentsList({ searchParams }: Props) {
  const data = await fetchDocuments(searchParams)
  
  return (
    <Suspense fallback={<Skeleton />}>
      <DocumentsListClient initialDocuments={data.documents} />
    </Suspense>
  )
}

// components/documents/DocumentsListClient.tsx (Client Component)
'use client'
export function DocumentsListClient({ initialDocuments }: Props) {
  // Interactive logic here
}
```

---

## API Route Handlers

### Route Handler Structure

**Best Practices:**
```tsx
// ✅ GOOD: Well-structured API route
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/errors'

// Route segment config
export const dynamic = 'force-dynamic' // For authenticated routes
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    
    // Data fetching logic
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', user.tenantId)
    
    if (error) {
      return createErrorResponse(
        new Error('Failed to fetch documents'),
        400,
        'DOCUMENTS_FETCH_ERROR'
      )
    }
    
    return createSuccessResponse({ documents: data })
  } catch (error) {
    return createErrorResponse(
      new Error('Internal server error'),
      500,
      'INTERNAL_ERROR'
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const formData = await request.formData()
    
    // Validation
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }
    
    // Processing logic
    // ...
    
    return createSuccessResponse({ document })
  } catch (error) {
    return createErrorResponse(
      new Error('Failed to create document'),
      500,
      'CREATE_ERROR'
    )
  }
}
```

### Route Handler Best Practices

1. **Always use route segment config:**
   ```tsx
   export const dynamic = 'force-dynamic' // For authenticated routes
   export const revalidate = 60 // ISR revalidation
   ```

2. **Consistent error handling:**
   ```tsx
   // Use helper functions for consistent responses
   import { createErrorResponse, createSuccessResponse } from '@/lib/errors'
   ```

3. **Authentication middleware:**
   ```tsx
   // Always check authentication first
   const user = await requireAuth()
   if (!user) {
     return createErrorResponse(new Error('Unauthorized'), 401, 'UNAUTHORIZED')
   }
   ```

4. **Input validation:**
   ```tsx
   // Validate all inputs
   const searchParams = request.nextUrl.searchParams
   const page = parseInt(searchParams.get('page') || '1', 10)
   if (isNaN(page) || page < 1) {
     return createErrorResponse(new Error('Invalid page'), 400, 'INVALID_INPUT')
   }
   ```

5. **Tenant isolation:**
   ```tsx
   // Always filter by tenant_id for multi-tenant apps
   .eq('tenant_id', user.tenantId)
   ```

---

## Data Fetching Patterns

### Server Component Data Fetching

**Pattern 1: Direct Database Access (Recommended)**
```tsx
// ✅ GOOD: Direct database access in Server Component
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('documents')
    .select('*')
  
  return <DocumentsList documents={data} />
}
```

**Pattern 2: Fetch with Caching**
```tsx
// ✅ GOOD: Fetch with Next.js caching
async function fetchDocuments() {
  const response = await fetch(`${getAppUrl()}/api/documents`, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['documents'], // Tag for on-demand revalidation
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch documents')
  }
  
  return response.json()
}
```

**Pattern 3: Parallel Data Fetching**
```tsx
// ✅ GOOD: Fetch multiple resources in parallel
export default async function DashboardPage() {
  // Start both requests in parallel
  const statsPromise = fetchStats()
  const activityPromise = fetchRecentActivity()
  
  // Await both together
  const [stats, activity] = await Promise.all([
    statsPromise,
    activityPromise,
  ])
  
  return (
    <>
      <Stats data={stats} />
      <Activity data={activity} />
    </>
  )
}
```

**Pattern 4: Sequential with Suspense**
```tsx
// ✅ GOOD: Sequential fetching with Suspense boundaries
export default async function Page({ params }: Props) {
  const { id } = await params
  const user = await getUser(id) // Must complete first
  
  return (
    <>
      <UserProfile user={user} />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts userId={user.id} /> {/* Can stream in */}
      </Suspense>
    </>
  )
}
```

### Client Component Data Fetching

**Pattern 1: Server Actions (Recommended)**
```tsx
// ✅ GOOD: Server Actions for mutations
'use client'

import { useActionState } from 'react'
import { deleteDocument } from '@/app/actions'

export function DeleteButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteDocument, null)
  
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">Delete</button>
    </form>
  )
}
```

**Pattern 2: Fetch with React `use` Hook**
```tsx
// ✅ GOOD: Streaming data with `use` hook
'use client'

import { use } from 'react'

export function Posts({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise)
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

---

## Caching Strategies

### Static Rendering (Default)

```tsx
// ✅ GOOD: Static page with ISR
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Revalidate every hour
  })
  
  return <Content data={await data.json()} />
}
```

### Dynamic Rendering

```tsx
// ✅ GOOD: Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export default async function Page() {
  const user = await getCurrentUser()
  // This page will be rendered on each request
}
```

### On-Demand Revalidation

```tsx
// ✅ GOOD: Revalidate specific routes
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  // ... create document
  
  // Revalidate cached data
  revalidateTag('documents')
  
  return Response.json({ success: true })
}
```

### Request Memoization

```tsx
// ✅ GOOD: Automatic request deduplication
// Multiple calls to the same URL in the same render are deduplicated
export default async function Page() {
  const data1 = await fetch('https://api.example.com/data')
  const data2 = await fetch('https://api.example.com/data') // Deduplicated!
  
  // Both return the same cached result
}
```

---

## Error Handling

### Error Boundaries

```tsx
// ✅ GOOD: Error boundary component
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />
    }

    return this.props.children
  }
}
```

### Error Pages

```tsx
// ✅ GOOD: Route-level error handling
// app/documents/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### API Error Responses

```tsx
// ✅ GOOD: Consistent error responses
// lib/errors.ts
export function createErrorResponse(
  error: Error,
  status: number,
  code: string
) {
  return NextResponse.json(
    {
      error: {
        message: error.message,
        code,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}
```

---

## Loading States & Streaming

### Loading Files

```tsx
// ✅ GOOD: Route-level loading state
// app/documents/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-secondary-700 rounded w-1/4" />
      <div className="h-64 bg-secondary-700 rounded" />
    </div>
  )
}
```

### Suspense Boundaries

```tsx
// ✅ GOOD: Granular Suspense boundaries
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Header /> {/* Renders immediately */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts /> {/* Streams in */}
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments /> {/* Streams in */}
      </Suspense>
    </div>
  )
}
```

### Streaming with React `use`

```tsx
// ✅ GOOD: Streaming data to client
// Server Component
export default function Page() {
  const postsPromise = fetchPosts() // Don't await
  
  return (
    <Suspense fallback={<Loading />}>
      <Posts postsPromise={postsPromise} />
    </Suspense>
  )
}

// Client Component
'use client'
import { use } from 'react'

export function Posts({ postsPromise }: Props) {
  const posts = use(postsPromise) // Resolves promise
  return <PostsList posts={posts} />
}
```

---

## Type Safety

### Route Handler Types

```tsx
// ✅ GOOD: Typed route handlers
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // id is typed as string
}
```

### Server Component Props

```tsx
// ✅ GOOD: Typed Server Component props
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  const search = (await searchParams).search as string | undefined
}
```

### API Response Types

```tsx
// ✅ GOOD: Typed API responses
// types/api.ts
export interface ApiResponse<T> {
  data: T
  error?: {
    message: string
    code: string
  }
}

// Usage
export async function GET(): Promise<NextResponse<ApiResponse<Document[]>>> {
  return NextResponse.json({
    data: documents,
  })
}
```

---

## Performance Optimizations

### Image Optimization

```tsx
// ✅ GOOD: Next.js Image component
import Image from 'next/image'

export function ProductImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority // For above-the-fold images
      placeholder="blur" // With blurDataURL
    />
  )
}
```

### Code Splitting

```tsx
// ✅ GOOD: Dynamic imports for code splitting
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If component requires browser APIs
})
```

### Memoization

```tsx
// ✅ GOOD: Memoize expensive components
'use client'

import { memo, useMemo } from 'react'

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: Props) {
  const processedData = useMemo(() => {
    return expensiveComputation(data)
  }, [data])
  
  return <div>{processedData}</div>
})
```

### Bundle Optimization

```tsx
// ✅ GOOD: Optimize package imports
// next.config.js
experimental: {
  optimizePackageImports: ['@aibos/ui', '@aibos/shared'],
}
```

---

## File Structure Conventions

### Recommended Structure

```
apps/web/src/
├── app/                          # App Router
│   ├── (auth)/                   # Route groups
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (protected)/              # Protected routes
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── documents/
│   │       └── page.tsx
│   ├── api/                      # API routes
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── auth/
│   │       └── login/
│   │           └── route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── loading.tsx               # Root loading
│   └── error.tsx                  # Root error
├── components/                   # Shared components
│   ├── documents/
│   │   ├── DocumentsList.tsx     # Server Component
│   │   └── DocumentsListClient.tsx  # Client Component
│   └── common/
│       └── Pagination.tsx
├── lib/                          # Utilities
│   ├── auth.ts
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   └── errors.ts
└── types/                        # TypeScript types
    └── index.ts
```

### Naming Conventions

- **Pages**: `page.tsx` (lowercase)
- **Layouts**: `layout.tsx` (lowercase)
- **Loading**: `loading.tsx` (lowercase)
- **Errors**: `error.tsx` (lowercase)
- **Components**: PascalCase (e.g., `DocumentsList.tsx`)
- **Client Components**: Add `Client` suffix (e.g., `DocumentsListClient.tsx`)
- **API Routes**: `route.ts` (lowercase)

---

## Summary Checklist

### Component Architecture
- [ ] Use Server Components by default
- [ ] Add `'use client'` only when needed
- [ ] Keep Client Components small and focused
- [ ] Use composition pattern (Server + Client)

### API Routes
- [ ] Always set route segment config
- [ ] Use consistent error handling
- [ ] Validate all inputs
- [ ] Enforce tenant isolation
- [ ] Use helper functions for responses

### Data Fetching
- [ ] Prefer direct database access in Server Components
- [ ] Use `fetch` with caching options
- [ ] Fetch in parallel when possible
- [ ] Use Suspense for streaming

### Performance
- [ ] Use Next.js Image component
- [ ] Implement code splitting
- [ ] Memoize expensive computations
- [ ] Optimize bundle size

### Error Handling
- [ ] Use error boundaries
- [ ] Create error.tsx files
- [ ] Consistent API error responses
- [ ] Log errors appropriately

### Loading States
- [ ] Create loading.tsx files
- [ ] Use Suspense boundaries
- [ ] Provide meaningful skeletons
- [ ] Stream content when possible

---

## Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js MCP Tools](https://nextjs.org/docs/app/building-your-application/configuring/mcp)

---

**Last Updated:** 2025-01-XX
**Next.js Version:** 16.0.10
**React Version:** 19.2.0

---
name: Pages Optimization and App Shell Implementation
overview: Implement comprehensive React/TypeScript optimizations and create a consistent app shell with side navigation for protected pages, matching the landing page design aesthetic and promoting code reusability.
todos:
  - id: app-shell-sidebar
    content: Enhance Sidebar component with Lucide icons, landing page design tokens, NexusIcon/BrandName branding, and proper TypeScript types
    status: completed
  - id: app-shell-header
    content: Enhance Header component with branding, design system typography, and improved styling while maintaining existing functionality
    status: completed
  - id: app-shell-layout
    content: Update ProtectedLayout to ensure proper spacing, responsive behavior, and consistent structure
    status: completed
  - id: public-page-layout
    content: Create PublicPageLayout component for shared header/footer across public pages (privacy, terms, security, docs)
    status: completed
  - id: landing-components
    content: ""
    status: completed
  - id: landing-data
    content: Move landing page data constants to separate data/landing.ts file
    status: completed
  - id: auth-components
    content: Create AuthPageLayout, AuthForm, and FormField components for shared auth page patterns
    status: completed
  - id: auth-hook
    content: Create useAuthForm hook for shared form handling logic across auth pages
    status: completed
  - id: typescript-pages
    content: ""
    status: completed
  - id: refactor-landing
    content: Refactor landing page to use extracted components and data file
    status: completed
  - id: refactor-auth
    content: Refactor all auth pages (login, signup, reset-password) to use shared components and hooks
    status: completed
  - id: refactor-public
    content: Refactor public pages (privacy, terms, security, docs) to use PublicPageLayout
    status: completed
  - id: error-boundaries
    content: Create PageErrorBoundary component and add error boundaries to pages
    status: completed
  - id: error-pages
    content: Enhance error.tsx and not-found.tsx with PublicPageLayout and improved styling
    status: completed
  - id: performance-memo
    content: Add React.memo to static components and memoize expensive computations
    status: completed
  - id: performance-suspense
    content: Enhance Suspense boundaries in protected pages and add loading skeletons
    status: completed
  - id: performance-config
    content: Add route segment config (dynamic, revalidate, fetchCache) to all pages
    status: completed
  - id: performance-split
    content: Implement code splitting with dynamic imports for heavy components
    status: completed
  - id: ux-aria-landing
    content: "Enhance ARIA attributes on landing page: add aria-labels to nav links, aria-current for active sections, proper heading hierarchy"
    status: completed
  - id: ux-aria-shell
    content: "Enhance app shell ARIA: add aria-expanded for mobile sidebar, keyboard shortcuts, improved screen reader support"
    status: completed
  - id: ux-mobile-sidebar
    content: Implement mobile-responsive sidebar with collapsible menu, overlay, and touch-friendly interactions
    status: completed
  - id: ux-loading-states
    content: Create enhanced loading skeletons with shimmer animations and content-aware structures
    status: completed
  - id: ux-transitions
    content: Add smooth page transitions, loading indicators, and micro-interactions with reduced-motion support
    status: completed
  - id: ux-focus-management
    content: "Implement comprehensive focus management: trapping, restoration, skip links, and visible focus indicators"
    status: completed
  - id: ux-keyboard-nav
    content: Add keyboard shortcuts, ensure proper Tab order, and test all keyboard navigation patterns
    status: completed
  - id: ux-screen-reader
    content: "Optimize screen reader support: semantic HTML, ARIA live regions, proper announcements"
    status: completed
  - id: ux-form-validation
    content: Add real-time form validation, field-level errors, success indicators, and improved accessibility
    status: completed
  - id: ux-mobile-optimization
    content: "Optimize all pages for mobile: touch targets, responsive layouts, mobile-specific interactions"
    status: completed
  - id: figma-landing-implementation
    content: "Implement Figma design for landing page: ensure pixel-perfect alignment, exact typography, spacing, colors, and component structure matching Figma specifications"
    status: completed
  - id: figma-aria-implementation
    content: "Add ARIA attributes to landing page per Figma analysis: aria-labels on nav links, aria-current for active sections, proper heading hierarchy (h1→h2→h3)"
    status: completed
  - id: figma-component-extraction
    content: "Extract reusable components from Figma design: Section, LandingButton, StatusBadge, HeroSection, MetricsGrid, FeatureCard matching exact Figma specs"
    status: completed
---

# Pages Optimization and App Shell Implementation Plan

## Overview

This plan implements all optimizations from the report plus creates a unified app shell with side navigation for protected pages. The app shell will match the landing page's institutional-grade design aesthetic while promoting code consistency and reusability.

## Architecture

### Current State

- Sidebar exists but uses emoji icons and doesn't match landing page design
- Header is basic and lacks branding consistency
- Landing page has inline components that should be extracted
- Documentation pages duplicate header/footer code
- Auth pages lack shared components
- TypeScript types are incomplete

### Target State

- Unified app shell with consistent design system
- Shared component library extracted from landing page
- Type-safe components with comprehensive TypeScript definitions
- Optimized performance with Suspense boundaries and code splitting
- Reusable layouts for all page types

## Implementation Phases

### Phase 1: App Shell Enhancement

#### 1.1 Enhanced Sidebar Component

**File:** `apps/web/src/components/layout/Sidebar.tsx`**Changes:**

- Replace emoji icons with Lucide React icons (matching landing page style)
- Update styling to match landing page design tokens
- Add NexusIcon and BrandName in sidebar header
- Use design system colors (`border-border`, `bg-background-elevated`, etc.)
- Implement proper active state styling matching landing page hover effects
- Add TypeScript interfaces for navigation items

**Navigation Items:**

- Dashboard (LayoutDashboard icon)
- Documents (FileText icon)
- Messages (MessageSquare icon)
- Payments (CreditCard icon)
- Statements (BarChart icon)
- Settings (Settings icon)

#### 1.2 Enhanced Header Component

**File:** `apps/web/src/components/layout/Header.tsx`**Changes:**

- Add branding (NexusIcon + BrandName) matching landing page
- Update typography to use `font-serif` for headings, `font-brand` for body
- Use design system tokens consistently
- Improve user info display with better styling
- Maintain existing functionality (ThemeToggle, LocaleSwitcher, NotificationCenter)

#### 1.3 Enhanced ProtectedLayout

**File:** `apps/web/src/components/layout/ProtectedLayout.tsx`**Changes:**

- Ensure proper spacing and layout structure
- Add responsive behavior for mobile (collapsible sidebar)
- Maintain authentication check
- Add loading states

### Phase 2: Shared Component Extraction

#### 2.1 Landing Page Components

**New Files:**

- `apps/web/src/components/landing/Section.tsx` - Reusable section wrapper
- `apps/web/src/components/landing/LandingButton.tsx` - Button component matching landing page
- `apps/web/src/components/landing/StatusBadge.tsx` - Badge component
- `apps/web/src/components/landing/HeroSection.tsx` - Hero section compound component
- `apps/web/src/components/landing/MetricsGrid.tsx` - Metrics display component

**Update:** `apps/web/src/app/page.tsx`

- Replace inline components with extracted components
- Move data constants to `apps/web/src/data/landing.ts`

#### 2.2 Public Page Layout

**New File:** `apps/web/src/components/layout/PublicPageLayout.tsx`**Purpose:** Shared layout for public pages (privacy, terms, security, docs)**Features:**

- Consistent header with NexusIcon + BrandName
- Back navigation link
- Footer matching landing page
- Responsive design

**Usage:** Replace duplicate header/footer code in:

- `apps/web/src/app/privacy/page.tsx`
- `apps/web/src/app/terms/page.tsx`
- `apps/web/src/app/security/page.tsx`
- `apps/web/src/app/docs/**/page.tsx` (all 12+ documentation pages)

#### 2.3 Auth Components

**New Files:**

- `apps/web/src/components/auth/AuthPageLayout.tsx` - Layout for auth pages
- `apps/web/src/components/auth/AuthForm.tsx` - Reusable form wrapper
- `apps/web/src/components/auth/FormField.tsx` - Form field wrapper

**Update:**

- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/signup/page.tsx`
- `apps/web/src/app/(auth)/reset-password/page.tsx`

### Phase 3: TypeScript Type Definitions

#### 3.1 Page Types

**New File:** `apps/web/src/types/pages.ts`**Types:**

- `PageProps` - Base page props interface
- `PublicPageProps` - Public page props
- `ProtectedPageProps` - Protected page props

#### 3.2 Landing Page Types

**New File:** `apps/web/src/types/landing.ts`**Types:**

- `NavLink` - Navigation link structure
- `Metric` - Metric display data
- `HeroCheckpoint` - Hero section checkpoint
- `Feature` - Feature display data

#### 3.3 Auth Types

**New File:** `apps/web/src/types/auth.ts`**Types:**

- `LoginFormData` - Login form data structure
- `SignupFormData` - Signup form data structure
- `AuthResponse` - Successful auth response
- `AuthErrorResponse` - Auth error response

#### 3.4 API Response Types

**Update:** `apps/web/src/types/api.ts`**Enhancements:**

- Add discriminated union type for success/error states
- Add type guards for runtime validation
- Add generic response wrapper

### Phase 4: React Hooks and Utilities

#### 4.1 Form Handling Hook

**New File:** `apps/web/src/hooks/useAuthForm.ts`**Purpose:** Shared form handling logic for auth pages**Features:**

- Form state management
- Error handling
- Loading states
- API integration
- Type-safe form data

#### 4.2 Custom Hooks

**New Files:**

- `apps/web/src/hooks/useCachedFetch.ts` - Cached data fetching
- `apps/web/src/hooks/useDebounce.ts` - Debounce utility
- `apps/web/src/hooks/useLocalStorage.ts` - LocalStorage wrapper

### Phase 5: Performance Optimizations

#### 5.1 Component Memoization

- Add `React.memo` to static components (StatusBadge, Section, etc.)
- Memoize expensive computations in landing page

#### 5.2 Code Splitting

- Lazy load heavy components (charts, code blocks)
- Dynamic imports for documentation code examples

#### 5.3 Suspense Boundaries

**Update Protected Pages:**

- `apps/web/src/app/(protected)/dashboard/page.tsx` - Already has Suspense, verify optimization
- `apps/web/src/app/(protected)/documents/page.tsx` - Enhance Suspense boundaries
- `apps/web/src/app/(protected)/messages/page.tsx` - Add Suspense if missing
- `apps/web/src/app/(protected)/payments/page.tsx` - Add Suspense if missing
- `apps/web/src/app/(protected)/statements/page.tsx` - Add Suspense if missing

#### 5.4 Route Segment Config

**Add to all pages:**

- `export const dynamic` - Explicit dynamic/static configuration
- `export const revalidate` - ISR configuration where applicable
- `export const fetchCache` - Cache configuration

### Phase 6: Error Handling

#### 6.1 Error Boundaries

**New File:** `apps/web/src/components/errors/PageErrorBoundary.tsx`**Purpose:** Catch and display errors gracefully**Usage:** Wrap page content in error boundaries

#### 6.2 Error Components

**Update:**

- `apps/web/src/app/error.tsx` - Enhance with PublicPageLayout
- `apps/web/src/app/not-found.tsx` - Enhance with PublicPageLayout

### Phase 7: Data Layer Extraction

#### 7.1 Landing Page Data

**New File:** `apps/web/src/data/landing.ts`**Content:**

- NAV_LINKS constant
- COMPLIANCE_BADGES constant
- HERO_CHECKPOINTS constant
- METRICS constant
- TRUSTED_PROFESSIONALS constant

**Update:** `apps/web/src/app/page.tsx` to import from this file

### Phase 8: UX Enhancements (ARIA, Accessibility, Mobile, Polish)

#### 8.1 ARIA and Accessibility Improvements

**Current State Analysis:**
- Good ARIA coverage in components (153 instances found)
- Some areas need enhancement:
  - Landing page navigation links lack aria-labels
  - Some interactive elements missing proper roles
  - Focus management can be improved
  - Screen reader announcements need optimization

**Enhancements:**

**Landing Page (`apps/web/src/app/page.tsx`):**
- Add `aria-label` to all navigation links
- Add `aria-current="page"` for active section anchors
- Add `role="navigation"` to nav element
- Add `aria-live="polite"` for dynamic content updates
- Add skip-to-content link (already exists, verify enhancement)
- Add proper heading hierarchy (h1 → h2 → h3)

**App Shell:**
- Sidebar: Add `aria-expanded` for mobile collapse state
- Sidebar: Add keyboard shortcuts (e.g., Alt+D for Dashboard)
- Header: Add `aria-label` to user menu
- Header: Improve screen reader announcements for notifications

**Forms:**
- Add `aria-describedby` linking labels to inputs
- Add `aria-required="true"` for required fields
- Add `aria-invalid` state management
- Add `aria-live="polite"` for error announcements
- Add field-level error announcements

**Tables and Lists:**
- Add `aria-sort` for sortable columns
- Add `aria-rowcount` and `aria-rowindex` for large tables
- Add `aria-busy` during loading states
- Add `aria-label` for action buttons

#### 8.2 Mobile Responsiveness

**Sidebar Mobile Behavior:**
- Implement collapsible sidebar with hamburger menu
- Add slide-in animation from left
- Add overlay backdrop when sidebar is open
- Add close button with proper ARIA labels
- Ensure touch targets are minimum 44×44px (WCAG 2.2)

**Header Mobile Behavior:**
- Stack user actions vertically on small screens
- Collapse notification center into dropdown
- Ensure all interactive elements are touch-friendly

**Landing Page Mobile:**
- Optimize hero section for mobile (smaller text, adjusted spacing)
- Ensure all CTAs are easily tappable
- Test navigation menu on mobile devices
- Optimize dashboard mockup for mobile viewing

**Protected Pages Mobile:**
- Ensure tables are horizontally scrollable on mobile
- Add mobile-optimized filters (drawer instead of inline)
- Optimize forms for mobile input (larger touch targets)

#### 8.3 Loading States and Transitions

**Enhanced Loading Skeletons:**
- Create consistent skeleton components matching content structure
- Add shimmer animation for better perceived performance
- Use design system tokens for skeleton colors
- Match skeleton to actual content dimensions

**Page Transitions:**
- Add smooth page transitions using Next.js router events
- Implement loading bar at top of viewport during navigation
- Add fade-in animations for content appearance
- Use `prefers-reduced-motion` media query to respect user preferences

**Micro-interactions:**
- Add hover state transitions (already good, enhance timing)
- Add focus ring animations
- Add button press feedback
- Add form field focus animations
- Add success/error state animations

#### 8.4 Focus Management

**Focus Trapping:**
- Ensure modals trap focus properly (already implemented, verify)
- Ensure dropdowns trap focus
- Ensure mobile sidebar traps focus when open

**Focus Restoration:**
- Restore focus after modal close
- Restore focus after navigation
- Maintain focus position in long lists

**Focus Indicators:**
- Ensure all interactive elements have visible focus indicators
- Use design system focus ring tokens
- Add focus-visible polyfill if needed
- Test with keyboard-only navigation

**Skip Links:**
- Enhance skip-to-content link (already exists)
- Add skip-to-navigation link
- Add skip-to-main-content link
- Ensure skip links are keyboard accessible

#### 8.5 Keyboard Navigation

**Keyboard Shortcuts:**
- Add global shortcuts (e.g., `/` for search, `?` for help)
- Add navigation shortcuts (e.g., `g d` for dashboard, `g m` for messages)
- Add command palette (optional, future enhancement)
- Display shortcuts in tooltips or help modal

**Keyboard Navigation Patterns:**
- Ensure all interactive elements are keyboard accessible
- Test Tab order follows visual order
- Test Shift+Tab for reverse navigation
- Test Enter/Space for activation
- Test Escape for closing modals/dropdowns
- Test Arrow keys for navigation in lists/tables

#### 8.6 Screen Reader Optimization

**Semantic HTML:**
- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- Use `<button>` for actions, `<a>` for navigation
- Use proper form elements with labels

**ARIA Live Regions:**
- Add `aria-live="polite"` for non-critical updates
- Add `aria-live="assertive"` for critical errors
- Add `aria-atomic` where appropriate
- Add `aria-busy` during async operations

**Screen Reader Announcements:**
- Announce form validation errors
- Announce successful form submissions
- Announce navigation changes
- Announce data loading completion
- Announce notification updates

#### 8.7 Visual Polish and Animations

**Animation System:**
- Create animation utility hooks (`useAnimation`, `useTransition`)
- Implement consistent animation timing (use design system tokens)
- Add entrance animations for page content
- Add exit animations for modals/dropdowns
- Respect `prefers-reduced-motion` user preference

**Loading States:**
- Replace generic loading spinners with content-aware skeletons
- Add progress indicators for long operations
- Add optimistic UI updates where appropriate
- Add smooth state transitions

**Error States:**
- Enhance error messages with icons
- Add retry mechanisms with proper focus management
- Add error recovery suggestions
- Improve error message clarity

**Success States:**
- Add success animations/feedback
- Add confirmation messages
- Add undo functionality where appropriate

#### 8.8 Form UX Improvements

**Form Validation:**
- Add real-time validation (on blur, not on change)
- Add field-level error messages
- Add success indicators for valid fields
- Add character counters where applicable
- Add password strength indicator

**Form Accessibility:**
- Ensure all inputs have associated labels
- Add `aria-describedby` for helper text
- Add `aria-invalid` for error states
- Add `aria-required` for required fields
- Add `aria-autocomplete` for autocomplete inputs

**Form UX Patterns:**
- Add autofill support
- Add form persistence (save draft)
- Add form reset confirmation
- Add field grouping with proper ARIA
- Add multi-step form indicators

#### 8.9 Mobile-Specific UX

**Touch Interactions:**
- Ensure all touch targets are minimum 44×44px
- Add swipe gestures for mobile navigation (optional)
- Add pull-to-refresh for lists (optional)
- Optimize for one-handed use

**Mobile Navigation:**
- Implement bottom navigation bar for mobile (optional)
- Add floating action button for primary actions (optional)
- Optimize sidebar for mobile (collapsible, overlay)

**Mobile Forms:**
- Use appropriate input types for mobile keyboards
- Add input masks where helpful
- Optimize date pickers for mobile
- Add file upload optimization for mobile

#### 8.10 Performance Perceived UX

**Optimistic Updates:**
- Update UI immediately, sync with server in background
- Show loading states only for operations > 200ms
- Use skeleton screens instead of spinners
- Prefetch data on hover/focus

**Progressive Enhancement:**
- Ensure core functionality works without JavaScript
- Add enhancements progressively
- Graceful degradation for older browsers
- Feature detection before using advanced features

## File Structure

```javascript
apps/web/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx (enhanced)
│   │   ├── Header.tsx (enhanced)
│   │   ├── ProtectedLayout.tsx (enhanced)
│   │   └── PublicPageLayout.tsx (new)
│   ├── landing/
│   │   ├── Section.tsx (new)
│   │   ├── LandingButton.tsx (new)
│   │   ├── StatusBadge.tsx (new)
│   │   ├── HeroSection.tsx (new)
│   │   └── MetricsGrid.tsx (new)
│   ├── auth/
│   │   ├── AuthPageLayout.tsx (new)
│   │   ├── AuthForm.tsx (new)
│   │   └── FormField.tsx (new)
│   └── errors/
│       └── PageErrorBoundary.tsx (new)
├── types/
│   ├── pages.ts (new)
│   ├── landing.ts (new)
│   ├── auth.ts (new)
│   └── api.ts (enhanced)
├── hooks/
│   ├── useAuthForm.ts (new)
│   ├── useCachedFetch.ts (new)
│   ├── useDebounce.ts (new)
│   └── useLocalStorage.ts (new)
├── data/
│   └── landing.ts (new)
└── app/
    ├── page.tsx (refactored)
    ├── (auth)/
    │   ├── login/page.tsx (refactored)
    │   ├── signup/page.tsx (refactored)
    │   └── reset-password/page.tsx (refactored)
    ├── (protected)/
    │   └── [pages remain, use enhanced layout]
    ├── docs/
    │   └── **/page.tsx (refactored to use PublicPageLayout)
    ├── privacy/page.tsx (refactored)
    ├── terms/page.tsx (refactored)
    ├── security/page.tsx (refactored)
    ├── error.tsx (enhanced)
    └── not-found.tsx (enhanced)
```



## Design System Alignment

### App Shell Design

- **Sidebar:** Fixed width (256px), matches landing page border/background tokens
- **Header:** Height 80px, matches landing page nav height
- **Typography:** `font-serif` for headings, `font-brand` for body text
- **Colors:** Use design system tokens (`border-border`, `bg-background-elevated`, `text-foreground-muted`)
- **Spacing:** Consistent with landing page (`px-6 md:px-12`, `py-8`, etc.)
- **Icons:** Lucide React icons matching landing page style

### Navigation Active States

- Active: Border-left accent, background elevation
- Hover: Background hover state
- Focus: Proper focus rings for accessibility

## TypeScript Improvements

### Type Coverage Goals

- All component props typed
- All API responses typed with discriminated unions
- All form data typed
- Runtime type guards for API responses

### Key Type Patterns

```typescript
// Discriminated union for API responses
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// Generic component props
interface DataListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}
```



## Performance Targets

### Bundle Size

- Initial load: < 200KB
- Code split heavy components
- Tree-shake unused exports

### Lighthouse Scores

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### Loading States

- All async data wrapped in Suspense
- Skeleton components for loading states
- Progressive enhancement

## Testing Considerations

### Component Testing

- Test shared components in isolation
- Test form validation logic
- Test error boundaries

### Integration Testing

- Test navigation flow
- Test authentication flow
- Test responsive behavior

## Migration Strategy

### Step 1: Create New Components

- Build new components alongside existing ones
- Ensure they work independently

### Step 2: Update Pages Incrementally

- Start with one page type (e.g., auth pages)
- Verify functionality
- Move to next page type

### Step 3: Remove Old Code

- After all pages migrated, remove inline components
- Clean up unused code

## Success Criteria

1. **Consistency:** All pages use shared components and layouts
2. **Type Safety:** 95%+ TypeScript coverage with strict mode
3. **Performance:** Lighthouse scores meet targets
4. **Design:** App shell matches landing page aesthetic
5. **Maintainability:** Reduced code duplication by 60%+
6. **Developer Experience:** Clear component APIs and documentation

## Dependencies

### New Dependencies (if needed)

- `react-hook-form` - Form validation (optional, can use custom)
- `zod` - Runtime validation (optional, can use custom)

### Existing Dependencies

- `lucide-react` - Icons (already in use)
- `next` - Framework
- `react` - UI library
- `typescript` - Type safety

## UX Enhancement Details

### ARIA Improvements Checklist

**Landing Page:**
- [ ] Add `aria-label` to all anchor links in navigation
- [ ] Add `aria-current="page"` for active section anchors
- [ ] Add `role="navigation"` to main nav
- [ ] Add `aria-live="polite"` for dynamic metric updates
- [ ] Verify skip-to-content link functionality
- [ ] Ensure proper heading hierarchy (h1 → h2 → h3)

**App Shell:**
- [ ] Add `aria-expanded` to mobile sidebar toggle
- [ ] Add `aria-controls` linking toggle to sidebar
- [ ] Add keyboard shortcut hints in tooltips
- [ ] Add `aria-label` to user menu button
- [ ] Add `aria-live="polite"` for notification updates

**Forms:**
- [ ] Link all inputs to labels with `htmlFor`/`id`
- [ ] Add `aria-describedby` for helper text and errors
- [ ] Add `aria-required="true"` for required fields
- [ ] Add `aria-invalid` state management
- [ ] Add `aria-live="polite"` for error announcements

### Mobile Responsiveness Checklist

- [ ] Sidebar collapses to hamburger menu on mobile (< 1024px)
- [ ] Sidebar slides in from left with overlay backdrop
- [ ] All touch targets are minimum 44×44px
- [ ] Tables are horizontally scrollable on mobile
- [ ] Forms are optimized for mobile input
- [ ] Navigation is accessible via touch
- [ ] Content is readable without horizontal scrolling

### Loading State Improvements

**New Components:**
- `components/common/Skeleton.tsx` - Reusable skeleton component
- `components/common/Shimmer.tsx` - Shimmer animation effect
- `components/common/LoadingBar.tsx` - Top loading bar for navigation

**Enhancements:**
- Replace generic spinners with content-aware skeletons
- Add shimmer effect to skeletons
- Add loading bar for route transitions
- Add progress indicators for file uploads
- Add optimistic UI updates

### Animation System

**New Hooks:**
- `hooks/useAnimation.ts` - Animation state management
- `hooks/useTransition.ts` - Page transition handling
- `hooks/useReducedMotion.ts` - Respect user motion preferences

**Animation Tokens:**
- Use design system transition durations
- Use consistent easing functions
- Add entrance/exit animations
- Add micro-interactions

### Keyboard Navigation

**Global Shortcuts:**
- `/` - Focus search (if available)
- `?` - Show keyboard shortcuts help
- `Esc` - Close modals/dropdowns
- `Alt + [key]` - Navigation shortcuts

**Navigation Shortcuts:**
- `Alt + D` - Dashboard
- `Alt + M` - Messages
- `Alt + P` - Payments
- `Alt + S` - Settings

### Focus Management

**Focus Trapping:**
- Modals trap focus (verify existing implementation)
- Dropdowns trap focus
- Mobile sidebar traps focus when open

**Focus Restoration:**
- Restore focus after modal close
- Restore focus after navigation
- Maintain scroll position

**Focus Indicators:**
- All interactive elements have visible focus rings
- Use `focus-visible` for keyboard navigation
- Test with keyboard-only navigation

## Figma Design Analysis

**Figma File:** [NexusCanon Landing Page](https://www.figma.com/design/NgukXYR5aV19lk73VALPvt/Untitled?node-id=9-1751&m=dev)  
**Node ID:** `9:1751`

### Design Specifications from Figma

**Color Palette:**
- Background: Deep black/dark charcoal (`bg-background`)
- Text Primary: White (`text-foreground`)
- Text Secondary: Muted light gray (`text-foreground-muted`)
- Accent: Vibrant green for status indicators, checkmarks, progress bars (`text-success-500`, `bg-success-500`)
- Borders: Light gray (`border-border`)

**Typography:**
- Headings: Serif font (`font-serif`), large sizes (6xl-9xl for hero)
- Body: Sans-serif (`font-brand`, Inter), `font-normal` weight only
- Labels: Uppercase, small (9px-10px), tracking-[0.2em] or [0.25em]
- No bold weights anywhere - all `font-normal`

**Layout Structure:**
1. **Header:** Fixed nav with logo, navigation links, "ACCOUNT LOGIN" button
2. **Hero Section:** Split layout - headline left, description + CTA right
3. **Metrics/Dashboard:** Grid of metric cards with icons and delta indicators
4. **Section Navigation:** Horizontal tabs (OVERVIEW, ACTIVE VENDORS, etc.)
5. **Institutional Governance:** Feature cards grid with icons and badges
6. **Mid-Page CTA:** "Secure your supply chain" section with two buttons
7. **Footer:** Multi-column navigation, branding, locations, social links

**Component Specifications:**
- **Buttons:**
  - Primary: White background, dark text, border, arrow icon
  - Outline: Dark background, white text, border, arrow icon
- **Status Badges:** Small, uppercase, bordered, muted text
- **Metric Cards:** Dark background, large numbers, labels, green delta indicators
- **Feature Cards:** Icons, titles, descriptions, technology badges

**ARIA Requirements:**
- Navigation links need `aria-label`
- Active sections need `aria-current="page"`
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic HTML structure
- Screen reader announcements for dynamic content

**Implementation Tasks:**
1. Verify exact spacing matches Figma (px values)
2. Ensure typography sizes match exactly
3. Verify color values match design tokens
4. Add all ARIA attributes per specifications
5. Extract components matching Figma structure
6. Test responsive breakpoints match design
7. Ensure no shadows (per brand guidelines)
8. Verify all icons use `lucide-react`

## Notes

- All changes maintain backward compatibility during migration
- Existing functionality preserved
- Design system tokens used consistently
- Accessibility maintained/improved (WCAG 2.2 AAA)
- Mobile-first responsive design
- Keyboard navigation fully supported
- Screen reader optimized
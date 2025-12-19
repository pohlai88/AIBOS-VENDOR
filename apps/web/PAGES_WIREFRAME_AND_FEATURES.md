# Pages Wireframe, Functions & Features Documentation

**Date:** 2025-01-27  
**Status:** ✅ **COMPREHENSIVE DOCUMENTATION**

---

## Table of Contents

1. [Public Pages](#public-pages)
2. [Authentication Pages](#authentication-pages)
3. [Protected Application Pages](#protected-application-pages)
4. [Documentation Pages](#documentation-pages)
5. [Error Pages](#error-pages)

---

## Public Pages

### 1. Landing Page (`/`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  NAVIGATION BAR (Fixed Top)                             │
│  [Logo] [Platform] [Intelligence] [Governance] [Security] [Request Access] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  HERO SECTION                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Large Heading: "Institutional Vendor Governance"│   │
│  │  Subheading: Description                         │   │
│  │  [Book Strategic Demo] [View Documentation]     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  PLATFORM SECTION (#platform)                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Heading: "Platform Capabilities"                │   │
│  │  Description text                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  INTELLIGENCE SECTION (#intelligence)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Heading: "Intelligence Insights"                │   │
│  │  Description text                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  GOVERNANCE SECTION (#governance)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Grid Layout:                                    │   │
│  │  [Feature 1] [Feature 2]                        │   │
│  │  [Feature 3] [Feature 4]                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  SECURITY SECTION (#security)                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Grid Layout:                                    │   │
│  │  [Security Feature 1] [Security Feature 2] [SF3] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  CTA SECTION                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Book Strategic Demo] [View Documentation]      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
│  [Logo] [Privacy] [Terms] [Security] [Copyright]       │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Marketing and lead generation
- **Secondary:** Product information and feature showcase
- **Navigation:** Anchor links to page sections
- **Conversion:** Drive signups and demo requests

#### **Features:**
- ✅ Fixed navigation bar with smooth scroll anchors
- ✅ Hero section with CTA buttons
- ✅ Platform capabilities showcase
- ✅ Intelligence insights section
- ✅ Governance features grid
- ✅ Security features display
- ✅ Trust indicators (compliance badges, metrics)
- ✅ Footer with legal links
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO optimized metadata

---

### 2. Documentation Hub (`/docs`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PAGE TITLE: "Documentation"                             │
│                                                          │
│  DOCUMENTATION SECTIONS                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Getting Started                                  │   │
│  │  └─ Installation                                 │   │
│  │  └─ Configuration                                │   │
│  │  └─ First Steps                                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  API Documentation                               │   │
│  │  └─ Authentication                              │   │
│  │  └─ Endpoints                                   │   │
│  │  └─ Rate Limiting                               │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Architecture                                    │   │
│  │  └─ Overview                                    │   │
│  │  └─ Data Flow                                   │   │
│  │  └─ Security                                    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Security                                        │   │
│  │  └─ Overview                                    │   │
│  │  └─ Compliance                                  │   │
│  │  └─ Disaster Recovery                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Central hub for all documentation
- **Secondary:** Navigation to documentation sub-sections
- **Organization:** Categorize documentation by topic

#### **Features:**
- ✅ Organized documentation sections
- ✅ Links to all documentation sub-pages
- ✅ Back navigation to home
- ✅ SEO optimized
- ✅ Static generation with ISR (1 hour revalidate)

---

### 3. Privacy Policy (`/privacy`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PAGE TITLE: "Privacy Policy"                            │
│                                                          │
│  CONTENT SECTIONS                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Last Updated Date                               │   │
│  │  Introduction                                    │   │
│  │  Data Collection                                │   │
│  │  Data Usage                                     │   │
│  │  Data Sharing                                   │   │
│  │  User Rights                                    │   │
│  │  Contact Information                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Legal compliance (GDPR, CCPA)
- **Secondary:** User transparency about data handling

#### **Features:**
- ✅ Legal content display
- ✅ Last updated date
- ✅ Contact information
- ✅ SEO optimized
- ✅ Static generation with ISR

---

### 4. Terms of Service (`/terms`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PAGE TITLE: "Terms of Service"                          │
│                                                          │
│  CONTENT SECTIONS                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Last Updated Date                               │   │
│  │  Acceptance of Terms                             │   │
│  │  Use of Service                                  │   │
│  │  Account Responsibilities                        │   │
│  │  Intellectual Property                           │   │
│  │  Limitation of Liability                         │   │
│  │  Contact Information                             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Legal terms and conditions
- **Secondary:** User agreement documentation

#### **Features:**
- ✅ Legal content display
- ✅ Last updated date
- ✅ Contact information
- ✅ SEO optimized
- ✅ Static generation with ISR

---

### 5. Security Information (`/security`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PAGE TITLE: "Security"                                 │
│                                                          │
│  CONTENT SECTIONS                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Security Overview                               │   │
│  │  Compliance Certifications                       │   │
│  │  Security Measures                               │   │
│  │  Data Protection                                 │   │
│  │  Incident Response                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Security information and compliance
- **Secondary:** Build trust with security details

#### **Features:**
- ✅ Security information display
- ✅ Compliance badges
- ✅ Security measures description
- ✅ SEO optimized
- ✅ Static generation with ISR

---

## Authentication Pages

### 6. Login Page (`/login`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CENTERED FORM                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Logo/Brand                                       │   │
│  │  "Sign In" Title                                 │   │
│  │                                                   │   │
│  │  [Email Input]                                   │   │
│  │  [Password Input]                                 │   │
│  │  [Remember Me Checkbox]                          │   │
│  │  [Sign In Button]                                 │   │
│  │                                                   │   │
│  │  [Forgot Password Link]                           │   │
│  │  [Sign Up Link]                                   │   │
│  │                                                   │   │
│  │  [OAuth Buttons - Google, etc.]                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** User authentication
- **Secondary:** Password reset navigation
- **Tertiary:** OAuth authentication

#### **Features:**
- ✅ Email/password login form
- ✅ Remember me functionality
- ✅ Password reset link
- ✅ Sign up link
- ✅ OAuth integration (Google, etc.)
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Redirect after successful login

---

### 7. Sign Up Page (`/signup`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CENTERED FORM                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Logo/Brand                                       │   │
│  │  "Create Account" Title                          │   │
│  │                                                   │   │
│  │  [Name Input]                                    │   │
│  │  [Email Input]                                   │   │
│  │  [Password Input]                                 │   │
│  │  [Confirm Password Input]                        │   │
│  │  [Terms Checkbox]                                │   │
│  │  [Create Account Button]                         │   │
│  │                                                   │   │
│  │  [Log In Link]                                   │   │
│  │                                                   │   │
│  │  [OAuth Buttons - Google, etc.]                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** New user registration
- **Secondary:** Account creation
- **Tertiary:** OAuth registration

#### **Features:**
- ✅ Registration form (name, email, password)
- ✅ Password confirmation
- ✅ Terms acceptance checkbox
- ✅ Form validation
- ✅ Password strength indicator
- ✅ OAuth integration
- ✅ Error handling
- ✅ Loading states
- ✅ Redirect after successful signup

---

### 8. Reset Password Page (`/reset-password`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CENTERED FORM                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Logo/Brand                                       │   │
│  │  "Reset Password" Title                          │   │
│  │                                                   │   │
│  │  [Email Input]                                   │   │
│  │  [Reset Password Button]                         │   │
│  │                                                   │   │
│  │  [Back to Login Link]                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Password reset request
- **Secondary:** Email verification for password reset

#### **Features:**
- ✅ Email input form
- ✅ Password reset request
- ✅ Email sent confirmation
- ✅ Back to login link
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

---

## Protected Application Pages

### 9. Dashboard (`/dashboard`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Dashboard]      │  [Welcome, User] [Theme] [Locale]   │
│  [Documents]      │                                      │
│  [Messages]       │  MAIN CONTENT                        │
│  [Payments]       │  ┌────────────────────────────────┐  │
│  [Statements]     │  │  PAGE TITLE: "Dashboard"      │  │
│  [Settings]       │  └────────────────────────────────┘  │
│  [Sign Out]       │                                      │
│                   │  STATS GRID                         │
│                   │  ┌──────┐ ┌──────┐ ┌──────┐        │
│                   │  │ Stat │ │ Stat │ │ Stat │        │
│                   │  └──────┘ └──────┘ └──────┘        │
│                   │                                      │
│                   │  QUICK ACTIONS                       │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [View Documents]              │  │
│                   │  │ [View Payments]                │  │
│                   │  │ [View Statements]              │  │
│                   │  │ [View Messages]                │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  RECENT ACTIVITY                      │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Activity List                  │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Overview of user's account and activity
- **Secondary:** Quick navigation to main features
- **Tertiary:** Real-time statistics display

#### **Features:**
- ✅ Statistics cards (vendors, compliance, spend, alerts)
- ✅ Quick action buttons (Documents, Payments, Statements, Messages)
- ✅ Recent activity feed
- ✅ Real-time data updates
- ✅ Suspense boundaries for loading states
- ✅ Responsive grid layout
- ✅ Dynamic rendering (force-dynamic)

---

### 10. Documents Page (`/documents`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  PAGE TITLE: "Documents"      │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  SEARCH & FILTERS                    │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Search Input] [AI Search Toggle]│ │
│                   │  │ [Category Filter] [Type Filter] │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  UPLOAD SECTION                      │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Upload Button] [Drag & Drop]  │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  DOCUMENTS TABLE                     │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Name │ Category │ Size │ Date  │  │
│                   │  │ [Doc1] │ [Cat] │ [Size] │ [Date]│ │
│                   │  │ [Doc2] │ [Cat] │ [Size] │ [Date]│ │
│                   │  │ ...                            │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  PAGINATION                          │
│                   │  [< Prev] [1] [2] [3] [Next >]      │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Document management (view, upload, delete)
- **Secondary:** Document search (keyword + semantic/AI)
- **Tertiary:** Document filtering and organization

#### **Features:**
- ✅ Document list with table view
  - Columns: Name (clickable), Category, Size, Uploaded date
  - Actions: Download, Delete per row
  - Empty state message
  - Responsive table design
- ✅ Upload functionality
  - Drag & drop file upload
  - File input button
  - File type validation
  - Progress indicators
  - Success/error notifications
- ✅ Search functionality
  - Keyword search (name, type, category)
  - AI semantic search toggle (when query exists)
  - Real-time search results
  - Search metadata display
- ✅ Filtering
  - Category filter (dropdown)
  - Type filter (dropdown)
  - Combined filter support
- ✅ Document detail pages (`/documents/[id]`)
  - Deep linking support
  - Shareable URLs
  - Full document preview
- ✅ Document actions
  - Download (opens in new tab)
  - Delete (with confirmation)
  - View details (navigate to detail page)
- ✅ Pagination
  - Page numbers
  - Previous/Next buttons
  - Items per page display
  - Total items count
- ✅ Optimistic updates
  - Instant UI feedback on delete
  - Automatic rollback on error
- ✅ Real-time document access tracking
  - Analytics integration
  - Access logging
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh document list
  - Real-time updates

---

### 11. Document Detail Page (`/documents/[id]`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Back Button] "Document Name"  │  │
│                   │  │ [Download] [Delete]            │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  DOCUMENT INFO                       │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Name: [Document Name]         │  │
│                   │  │ Category: [Category]           │  │
│                   │  │ Size: [File Size]              │  │
│                   │  │ MIME Type: [Type]             │  │
│                   │  │ Uploaded: [Date]              │  │
│                   │  │ Shared: [Yes/No]              │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  DOCUMENT PREVIEW                    │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [iframe with document preview] │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Detailed document view
- **Secondary:** Document actions (download, delete)
- **Tertiary:** Document preview

#### **Features:**
- ✅ Full document details display
- ✅ Document preview (iframe)
- ✅ Download button
- ✅ Delete button
- ✅ Back navigation
- ✅ Access control (RLS)
- ✅ Deep linking support
- ✅ Shareable URL
- ✅ Dynamic rendering (force-dynamic)

---

### 12. Messages Page (`/messages`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  PAGE TITLE: "Messages"        │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  TWO-COLUMN LAYOUT                   │
│                   │  ┌──────────────┬─────────────────┐ │
│                   │  │ THREADS LIST │ MESSAGE VIEW    │ │
│                   │  │              │                 │ │
│                   │  │ [New Thread] │ [Thread Subject]│ │
│                   │  │              │                 │ │
│                   │  │ [Thread 1]    │ [Message List] │ │
│                   │  │ [Thread 2]   │                 │ │
│                   │  │ [Thread 3]   │ [Message Input]│ │
│                   │  │ ...          │ [Send Button]   │ │
│                   │  └──────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Secure messaging between vendors and companies
- **Secondary:** Thread management
- **Tertiary:** Real-time message updates

#### **Features:**
- ✅ Thread list sidebar
  - List of all message threads
  - Thread subject display
  - Last message timestamp
  - Unread indicators (if implemented)
  - Active thread highlighting
  - Sorted by last message time
- ✅ Create new thread
  - Modal dialog
  - Vendor selection dropdown
  - Subject input (optional)
  - Create button
  - Error handling
- ✅ Message view (MessageThreadComponent)
  - Conversation history display
  - Message list with sender info
  - Message timestamps (formatted)
  - User information (email/name)
  - Scrollable message list
  - Empty state when no messages
  - Loading state (Suspense)
- ✅ Send messages
  - Message input field
  - Send button
  - Enter key support
  - Message validation
  - Optimistic message display
  - Auto-scroll to latest message
  - Real-time message updates
- ✅ Thread selection
  - Click thread to load messages
  - Active thread highlighting
  - Auto-scroll to latest message
- ✅ Real-time updates
  - Polling for new messages
  - Auto-refresh on thread selection
  - New message indicators
- ✅ Vendor selection for new threads
  - Dropdown with vendor list
  - Filtered by user's organization
  - Search functionality (if many vendors)
- ✅ Message timestamps
  - Relative time (e.g., "2 hours ago")
  - Absolute time on hover
  - Date separators
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh message data
  - Real-time conversation updates

---

### 13. Payments Page (`/payments`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  PAGE TITLE: "Payments"        │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  FILTERS                             │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Status Filter] [Start Date]  │  │
│                   │  │ [End Date] [Export CSV]       │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  PAYMENTS TABLE                      │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Amount │ Status │ Method │ Date│  │
│                   │  │ [$100] │ [Done] │ [Card] │ [Date]││
│                   │  │ [$200] │ [Pending] │ [Bank] │ [Date]││
│                   │  │ ...                            │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Payment tracking and management
- **Secondary:** Payment filtering and export
- **Tertiary:** Payment history viewing

#### **Features:**
- ✅ Payment list with table view
  - Columns: Amount (clickable), Status, Method, Due Date, Paid At, Transaction ID
  - Responsive table design
  - Empty state message
- ✅ Filtering
  - Status filter (All, Pending, Completed, Failed)
  - Start date filter
  - End date filter
  - Combined filter support
  - Real-time filter application
- ✅ Export functionality
  - Export to CSV button
  - Includes current filters
  - Opens in new tab
  - Analytics tracking
- ✅ Payment detail pages (`/payments/[id]`)
  - Deep linking support
  - Shareable URLs
  - Full payment information
- ✅ Status indicators
  - Color-coded badges
  - Pending: Yellow/Warning
  - Completed: Green/Success
  - Failed: Red/Error
- ✅ Payment information display
  - Currency formatting
  - Date formatting
  - Method display
  - Transaction ID (monospace font)
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh payment data
  - Real-time status updates

---

### 14. Payment Detail Page (`/payments/[id]`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Back Button] "Payment Details"│  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  PAYMENT INFO                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Amount: [$XXX.XX]              │  │
│                   │  │ Status: [Status Badge]         │  │
│                   │  │ Method: [Payment Method]      │  │
│                   │  │ Transaction ID: [ID]           │  │
│                   │  │ Due Date: [Date]              │  │
│                   │  │ Paid At: [Date]               │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Detailed payment information
- **Secondary:** Payment status tracking

#### **Features:**
- ✅ Header with navigation
  - Back button (router.back())
  - "Payment Details" title
- ✅ Payment information card
  - Two-column grid layout
  - Amount (large, formatted currency)
  - Status badge (color-coded)
  - Payment method
  - Transaction ID (monospace font)
  - Due date
  - Paid at date (or "Not paid")
- ✅ Status indicators
  - Color-coded badges
  - Pending: Yellow/Warning
  - Completed: Green/Success
  - Failed: Red/Error
- ✅ Access control
  - RLS enforcement
  - Tenant-based access
  - Role-based filtering (vendor vs company)
  - Organization-based access
- ✅ Deep linking support
  - Shareable URLs
  - Bookmarkable pages
  - Email link integration
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh payment data
  - Real-time status updates

---

### 15. Statements Page (`/statements`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  PAGE TITLE: "Financial Statements"│
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  FILTERS                             │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Period Start] [Period End]    │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  STATEMENTS TABLE                    │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Period │ Balance │ Transactions│  │
│                   │  │ [Date] │ [$XXX] │ [Count]     │  │
│                   │  │ ...                            │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  ACTIONS (per row)                   │
│                   │  [View] [Export]                     │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Financial statement viewing
- **Secondary:** Statement export
- **Tertiary:** Period-based filtering

#### **Features:**
- ✅ Statement list with table view
  - Columns: Period Start, Period End, Balance, Transactions count
  - Actions: View, Export per row
  - Responsive table design
  - Empty state message
- ✅ Filtering
  - Period start date filter
  - Period end date filter
  - Combined filter support
  - Real-time filter application
- ✅ View statement details
  - Modal dialog (opens on "View" click)
  - Full statement information display
    - Period start/end dates
    - Balance (formatted currency)
    - Currency type
    - Transaction count
    - Transaction list (if available)
  - Close button
  - Responsive modal design
- ✅ Export statements
  - Export to CSV per statement
  - Format selection
  - Opens in new tab
  - Analytics tracking
- ✅ Financial information display
  - Currency formatting for balance
  - Date formatting for periods
  - Transaction count display
  - Period range display
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh statement data
  - Real-time balance updates

---

### 16. Settings Page (`/settings`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  PAGE TITLE: "Settings"        │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  SETTINGS SECTIONS                   │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  Profile Settings              │  │
│                   │  │  [Email] [Role] [Organization]│  │
│                   │  │  [Update Profile Button]      │  │
│                   │  ├────────────────────────────────┤  │
│                   │  │  Account Settings              │  │
│                   │  │  [Preferences] [Notifications]│  │
│                   │  ├────────────────────────────────┤  │
│                   │  │  Admin Links (if admin)        │  │
│                   │  │  [Company Groups] [Tenants]    │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** User profile and account management
- **Secondary:** Organization settings (for admins)
- **Tertiary:** Preferences and notifications

#### **Features:**
- ✅ Tab-based navigation
  - Profile tab (default)
  - Security tab
  - Notifications tab
  - Activity tab
- ✅ Profile Section
  - User email display
  - User role (formatted, e.g., "Company Admin")
  - Organization name display
  - Profile update form
  - Email update (if allowed)
  - Save button with validation
  - Success/error notifications
- ✅ Security Section
  - Password change form
  - Current password input
  - New password input
  - Confirm password input
  - Password strength indicator
  - Save button
- ✅ Notifications Section
  - Email notification preferences
  - Notification type toggles
  - Save preferences button
- ✅ Activity Section
  - Recent login history
  - Account activity log
  - Activity timestamps
  - Activity type indicators
- ✅ Admin links (if admin role)
  - Company Groups management link
  - Tenant management link
  - Conditional rendering based on role
- ✅ Organization information
  - Organization name display
  - Organization details
- ✅ Role display
  - Formatted role name
  - Role-based access control
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh user data
  - Real-time profile updates

---

### 17. Company Groups Management (`/settings/company-groups`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Back to Settings]             │  │
│                   │  │  PAGE TITLE: "Company Groups"  │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  COMPANY GROUPS TABLE                │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Name │ Description │ Actions   │  │
│                   │  │ [Group1] │ [Desc] │ [Edit][Del]│ │
│                   │  │ ...                            │  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  [Create New Group Button]            │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Company group management (admin only)
- **Secondary:** Create, edit, delete company groups

#### **Features:**
- ✅ Company groups list
  - Table view with columns
  - Group name, description
  - Actions column (Edit, Delete)
  - Empty state message
- ✅ Create new group
  - Modal dialog or form
  - Name input
  - Description input (optional)
  - Create button
  - Form validation
- ✅ Edit group
  - Edit modal/form
  - Pre-filled with existing data
  - Update button
  - Form validation
- ✅ Delete group
  - Delete button with confirmation
  - Optimistic update
  - Error handling
- ✅ Admin-only access
  - Role check (company_admin)
  - Redirect if not admin
- ✅ Back to settings link
  - Navigation breadcrumb
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh group data

---

### 18. Tenant Management (`/settings/tenants`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ [Back to Settings]             │  │
│                   │  │  PAGE TITLE: "Tenant Management"│  │
│                   │  └────────────────────────────────┘  │
│                   │                                      │
│                   │  TENANT INFO                         │
│                   │  ┌────────────────────────────────┐  │
│                   │  │ Tenant Name: [Name]            │  │
│                   │  │ Subscription: [Plan]          │  │
│                   │  │ Status: [Active/Inactive]     │  │
│                   │  │ [Update Subscription Button]  │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Tenant subscription management (admin only)
- **Secondary:** Subscription plan updates

#### **Features:**
- ✅ Tenant information display
  - Tenant name
  - Tenant ID
  - Current subscription plan
  - Subscription status (Active/Inactive)
  - Subscription details
- ✅ Subscription management
  - Plan selection dropdown
  - Update subscription button
  - Confirmation dialog
  - Success/error notifications
- ✅ Admin-only access
  - Role check (company_admin)
  - Redirect if not admin
- ✅ Back to settings link
  - Navigation breadcrumb
- ✅ Dynamic rendering (force-dynamic)
  - Always fresh tenant data

---

## Documentation Pages

### 19-34. Documentation Sub-Pages

All documentation sub-pages follow the same structure:

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Docs] [Back to Section]                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PAGE TITLE                                              │
│                                                          │
│  CONTENT                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Documentation content                          │   │
│  │  - Sections                                     │   │
│  │  - Code examples                                │   │
│  │  - Links to related docs                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  NAVIGATION LINKS                                        │
│  [Previous] [Next]                                       │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Detailed documentation for specific topics
- **Secondary:** Navigation between related documentation

#### **Features:**
- ✅ Structured documentation content
- ✅ Code examples
- ✅ Navigation links (back, previous, next)
- ✅ Related documentation links
- ✅ SEO optimized
- ✅ Static generation with ISR

**Documentation Pages:**
- `/docs/getting-started` - Getting started overview
- `/docs/getting-started/installation` - Installation guide
- `/docs/getting-started/configuration` - Configuration guide
- `/docs/getting-started/first-steps` - First steps guide
- `/docs/api` - API documentation overview
- `/docs/api/authentication` - Authentication docs
- `/docs/api/endpoints` - API endpoints reference
- `/docs/api/rate-limiting` - Rate limiting docs
- `/docs/architecture` - Architecture overview
- `/docs/architecture/overview` - Architecture overview
- `/docs/architecture/data-flow` - Data flow documentation
- `/docs/architecture/security` - Security architecture
- `/docs/security` - Security overview
- `/docs/security/overview` - Security overview
- `/docs/security/compliance` - Compliance documentation
- `/docs/security/disaster-recovery` - Disaster recovery docs

---

## Error Pages

### 35. Global 404 Page (`/not-found`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CENTERED CONTENT                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  "404" Large Text                                │   │
│  │  "Page Not Found" Title                          │   │
│  │  Description text                                │   │
│  │                                                   │   │
│  │  [Go to Home Button]                             │   │
│  │  [Go to Dashboard Button]                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Handle 404 errors gracefully
- **Secondary:** Navigation back to valid pages

#### **Features:**
- ✅ Clear error message
- ✅ Navigation options (Home, Dashboard)
- ✅ User-friendly design
- ✅ SEO optimized

---

### 36. Global Error Page (`/error`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [Back to Home]                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CENTERED CONTENT                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Error Icon]                                    │   │
│  │  "Something went wrong" Title                   │   │
│  │  Error message                                   │   │
│  │  Error ID (if available)                        │   │
│  │                                                   │   │
│  │  [Try Again Button]                             │   │
│  │  [Go Home Button]                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Handle application errors gracefully
- **Secondary:** Error recovery options

#### **Features:**
- ✅ Error message display
- ✅ Error ID (for debugging)
- ✅ Try again button (reset error boundary)
- ✅ Go home button
- ✅ Error tracking (analytics)
- ✅ User-friendly design

---

### 37. Documents 404 Page (`/documents/not-found`)

#### **Wireframe Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER                              │
│  [Navigation]     │  [User Info] [Theme] [Locale]        │
│                   │                                      │
│                   │  MAIN CONTENT                        │
│                   │  ┌────────────────────────────────┐  │
│                   │  │  "Document Not Found"          │  │
│                   │  │  Description                   │  │
│                   │  │                                │  │
│                   │  │  [Back to Documents]           │  │
│                   │  │  [Go to Dashboard]             │  │
│                   │  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### **Functions:**
- **Primary:** Handle document not found errors
- **Secondary:** Navigation back to documents list

#### **Features:**
- ✅ Clear error message
- ✅ Navigation options
- ✅ User-friendly design

---

## Summary

### **Total Pages:** 37
- **Public Pages:** 5
- **Authentication Pages:** 3
- **Protected Application Pages:** 10
- **Documentation Pages:** 16
- **Error Pages:** 3

### **Common Features Across Pages:**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO optimization
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Loading states (Suspense boundaries)
- ✅ Error handling
- ✅ Consistent design system
- ✅ Route configuration (dynamic/revalidate)
- ✅ Metadata standardization

---

## Technical Implementation Details

### **Layout Structure:**
- **Public Pages:** Use `PublicPageLayout` component
- **Auth Pages:** Use `AuthPageLayout` component
- **Protected Pages:** Use `ProtectedLayout` with Sidebar + Header

### **Data Fetching:**
- **Server Components:** Direct database access (Next.js 16 best practice)
- **Client Components:** API routes for mutations
- **Suspense Boundaries:** All async data wrapped in Suspense
- **Parallel Fetching:** Multiple data sources fetched in parallel

### **State Management:**
- **Server State:** React Server Components
- **Client State:** React hooks (useState, useCallback, useMemo)
- **Optimistic Updates:** useOptimistic for instant UI feedback
- **URL State:** Search params for filters and pagination

### **Performance:**
- **ISR:** Public pages use 1-hour revalidation
- **Dynamic Rendering:** Protected pages always fresh
- **Code Splitting:** Automatic via Next.js App Router
- **Image Optimization:** Next.js Image component

---

*Documentation completed: 2025-01-27*

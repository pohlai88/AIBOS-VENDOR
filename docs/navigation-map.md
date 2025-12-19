# NexusCanon Navigation Map

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Purpose:** Complete navigation structure and route mapping for the NexusCanon application  
**Status:** Active - Maintained with Next.js MCP route discovery

---

## ✅ ACTUAL CURRENT STATE (What Exists Now)

### Landing Page (`/`) - Real Links Found in Code

#### Header Navigation Bar
```
[Logo] → / (Home)
[Platform] → #platform (anchor link - BUT section may not exist on page)
[Intelligence] → #intelligence (anchor link - BUT section may not exist on page)
[Governance] → #governance (anchor link - BUT section may not exist on page)
[Security] → #security (anchor link - BUT section may not exist on page)
[Request Access Button] → /signup ✅ (This page EXISTS)
```

#### Hero Section
```
[Book Strategic Demo Button] → /signup ✅ (This page EXISTS)
```

#### CTA Section
```
[Book Strategic Demo Button] → /signup ✅ (This page EXISTS)
[View Documentation Button] → /docs ❌ (This page DOES NOT EXIST - will show 404)
```

#### Footer
```
[Privacy] → #privacy (anchor link - BUT section may not exist on page)
[Terms] → #terms (anchor link - BUT section may not exist on page)
[Security] → #security (anchor link - BUT section may not exist on page)
```

---

## 📋 REAL ROUTES (Discovered via Next.js MCP)

### ✅ Public Pages That EXIST:
- `/` - Landing page ✅
- `/signup` - Signup page ✅
- `/login` - Login page ✅
- `/reset-password` - Password reset ✅

### ❌ Referenced But MISSING:
- `/docs` - Referenced in code but route doesn't exist ❌

### ✅ Protected Pages That EXIST (require login):
- `/dashboard` ✅
- `/documents` ✅
- `/messages` ✅
- `/payments` ✅
- `/statements` ✅
- `/settings` ✅

---

## ⚠️ ISSUES FOUND (What Needs to be Fixed)

### 1. Missing Route
- **Problem:** Button links to `/docs` but this route doesn't exist
- **Location:** CTA section "View Documentation" button
- **Fix Needed:** Either create `/docs` page or change link

### 2. Anchor Links Without Sections ❌ CONFIRMED BROKEN
- **Problem:** Navigation links point to `#platform`, `#intelligence`, `#governance`, `#security` but **these sections DO NOT EXIST** on the page
- **Location:** Header navigation
- **Status:** ✅ Verified - searched code, no `id="platform"` etc. found
- **Fix Needed:** Add sections with matching `id` attributes OR change links to point to existing sections

### 3. Footer Anchor Links ❌ CONFIRMED BROKEN
- **Problem:** Footer links to `#privacy`, `#terms`, `#security` but **these sections DO NOT EXIST**
- **Location:** Footer
- **Status:** ✅ Verified - searched code, no `id="privacy"` etc. found
- **Fix Needed:** Add sections with matching `id` attributes OR create separate pages

---

## 🎯 SIMPLE VISUAL MAP

```
LANDING PAGE (/)
│
├─ Header
│  ├─ Logo → / ✅
│  ├─ Platform → #platform ❌ (section DOES NOT exist - broken link)
│  ├─ Intelligence → #intelligence ❌ (section DOES NOT exist - broken link)
│  ├─ Governance → #governance ❌ (section DOES NOT exist - broken link)
│  ├─ Security → #security ❌ (section DOES NOT exist - broken link)
│  └─ [Request Access] → /signup ✅
│
├─ Hero Section
│  └─ [Book Strategic Demo] → /signup ✅
│
├─ CTA Section
│  ├─ [Book Strategic Demo] → /signup ✅
│  └─ [View Documentation] → /docs ❌ (404 - doesn't exist!)
│
└─ Footer
   ├─ Privacy → #privacy ❌ (section DOES NOT exist - broken link)
   ├─ Terms → #terms ❌ (section DOES NOT exist - broken link)
   └─ Security → #security ❌ (section DOES NOT exist - broken link)
```

**Legend:**
- ✅ = Works (route exists)
- ❌ = Broken (route doesn't exist)
- ⚠️ = May not work (anchor link but section may not exist)

---

## 🔍 HOW TO VERIFY

To check if anchor sections exist, search the landing page code for:
- `id="platform"`
- `id="intelligence"`
- `id="governance"`
- `id="security"`
- `id="privacy"`
- `id="terms"`

If these don't exist, the anchor links won't scroll to anything.

---

## 📝 SUMMARY

**What's Working:**
- All buttons that go to `/signup` ✅
- Logo link to home ✅
- All protected routes exist ✅

**What's Broken:**
- `/docs` link → 404 error ❌

**What's Broken (Confirmed):**
- Anchor links (#platform, #intelligence, #governance, #security, #privacy, #terms) - sections DO NOT exist on page ❌

---

*This map shows the ACTUAL current state, not recommendations. Items marked with ❌ or ⚠️ need to be fixed.*

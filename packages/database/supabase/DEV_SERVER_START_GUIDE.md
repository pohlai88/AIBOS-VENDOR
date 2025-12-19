# Dev Server Start Guide

**Date:** 2025-01-27  
**Status:** 📋 **STARTING DEV SERVER**

---

## Issue Found

**Dev server was not running on port 3000.**

**I've started it in the background. Please wait 15-20 seconds for it to start.**

---

## Verify Server is Running

**After waiting, check:**
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

**Or open browser:**
```
http://localhost:3000
```

---

## Manual Start (If Needed)

**If the background process didn't work, start manually:**

```powershell
cd C:\AI-BOS\AI-BOS-Vendor\apps\web
npm run dev
```

**Or from root:**
```powershell
cd C:\AI-BOS\AI-BOS-Vendor
pnpm dev
```

---

## After Server Starts

**Then test OAuth:**
```
http://localhost:3000/api/auth/oauth?provider=github
```

---

**Last Updated:** 2025-01-27  
**Status:** 🔄 **STARTING SERVER**

# Realtime Strategy: Enterprise-Grade Decision Framework

## Executive Summary

Your concern is **valid and well-founded**: **Postgres Changes (CDC-style realtime)** reads row-level updates from WAL and streams them to clients. When tables are **high-churn** (lots of updates / background jobs / bulk writes), this can create:

* **Event storms** (too many change events)
* **UI churn** (constant re-renders)
* **Unpredictable load + cost**
* Harder debugging (did the UI change because of user action or changefeed noise?)

**However**, a professional SaaS application **cannot have manual refresh buttons** - users expect real-time updates.

**The solution:** Use **Supabase Realtime Broadcast-from-Database** to emit **controlled, meaningful events** instead of streaming raw row changes.

---

## Why Postgres Changes Becomes a Problem

**Postgres Changes** reads row-level updates from WAL (Write-Ahead Log) and streams them directly to clients. When your database has:

- High-frequency updates (status changes, counters, logs)
- Bulk operations (migrations, backfills, batch jobs)
- Background jobs that update many rows
- UPDATE-heavy tables (not just INSERTs)

Every row change triggers an event → **event storms** → UI constantly re-rendering → unpredictable load.

---

## Refined Recommendation: Real-Time UX via "Database Broadcast" (Not Postgres Changes)

Instead of subscribing clients to raw row changes, use **Supabase Realtime Broadcast-from-Database** to emit **controlled, meaningful events**.

### How Supabase Broadcast-from-Database Works

**Important:** Broadcast-from-Database **does not stream your table WAL**.

1. Realtime listens to inserts on **`realtime.messages`** (a partitioned table) via a publication/replication slot
2. You write to `realtime.messages` from SQL using:
   - `realtime.send(...)` - Flexible payload for custom events
   - `realtime.broadcast_changes(...)` - Postgres-changes-like format (useful in triggers)
3. Realtime broadcasts those messages to connected clients

**Key Improvement:** You control exactly when an event is emitted, instead of streaming every row update.

> **Important nuance:** It's not "independent of DB update frequency" — it's **independent of row-level changefeed noise** because you only emit events when your trigger/function decides it's meaningful.

---

## Where Presence Fits (And Where It Doesn't)

**Presence** is for sharing "who's online / typing / viewing" state in a channel. It's **not a replacement for data updates**.

- ✅ Use Presence for: Online status, typing indicators, active user counters, collaboration UX
- ❌ Don't use Presence for: Notifications, dashboard updates, data synchronization

---

## The Professional SaaS Pattern (Best Practice)

### 1) Database = Source of Truth

Keep all state in your real tables (`notifications`, `messages`, `documents`, etc.). The database is the authoritative source.

### 2) Broadcast = "Invalidate" / "New Event" Signal

Broadcast **small payloads** like:
- `{ type: 'new_notification', id: '...' }`
- `{ type: 'stats_updated', table: 'documents' }`
- `{ type: 'new_message', threadId: '...' }`

**Don't send full row data** - just enough to signal that something changed.

### 3) Client Receives Broadcast → Refetch or Update Locally

When client receives broadcast:
- **For lists:** Refetch latest data (or use `router.refresh()` in Next.js)
- **For detail views:** Update only if that item is currently open
- **For counters:** Refetch aggregated stats

### 4) Reliability: Always Have a Catch-Up Path

**Broadcast is ephemeral** - if a user is offline, they can miss messages. So clients should:

- ✅ Fetch on page load
- ✅ Fetch on tab focus (`visibilitychange` event)
- ✅ Optionally do slow polling catch-up (e.g., every 60–180s)

**Note:** `realtime.messages` is cleaned up (partition drop) after a short retention window (~3 days), so it's not for long-term history.

---

## Current Implementation Analysis

Based on your codebase, you're currently using Postgres Changes for:

### 1. **Messages** (`MessageThread.tsx`)
- **Current:** Postgres Changes (INSERT events, thread-filtered)
- **Update Pattern:** INSERT-heavy (new messages)
- **Volume:** Likely **low to medium** per thread
- **Assessment:** ✅ **Potentially OK** - Thread-scoped, INSERT-only
- **Recommendation:** Keep Postgres Changes OR switch to Broadcast (if volume increases)

### 2. **Notifications** (`NotificationCenter.tsx`)
- **Current:** Postgres Changes (INSERT events, **no user filter**)
- **Update Pattern:** INSERT-heavy (new notifications)
- **Volume:** Depends on notification frequency
- **Assessment:** ⚠️ **Needs fixing** - Receives ALL notifications (security/performance risk)
- **Recommendation:** ✅ **Switch to Broadcast** - User-scoped, controlled events

### 3. **Dashboard Stats** (`DashboardStatsClient.tsx`)
- **Current:** Postgres Changes (ALL events `*` on 4 tables, **no filtering**)
- **Update Pattern:** Mixed (INSERT, UPDATE, DELETE)
- **Volume:** Could be **HIGH** if these tables update frequently
- **Assessment:** ❌ **HIGH RISK** - No filtering, all events, multiple tables
- **Recommendation:** ✅ **Switch to Broadcast** - Lightweight "stats updated" events

---

## Decision Matrix

### Use Postgres Changes ONLY if ALL apply:

- ✅ Updates are **low/medium volume** (< 100 events/minute per user)
- ✅ Users truly benefit from live updates (chat/alerts)
- ✅ You can filter by tenant/user/thread/scope
- ✅ You can tolerate eventual ordering/duplication edge cases
- ✅ Updates are INSERT-heavy (not UPDATE-heavy)

### Use Broadcast-from-Database if ANY apply:

- ❌ High-frequency updates (> 100 events/minute)
- ❌ Bulk jobs / migrations / backfills
- ❌ You want to control what gets sent
- ❌ You need user/organization-scoped events
- ❌ You want lightweight events (not full row data)
- ❌ UPDATE-heavy tables (status changes, counters)

### Use Presence ONLY for:

- ✅ "Who's online" features
- ✅ Active user counters
- ✅ Typing indicators (though Broadcast is also good for this)
- ✅ Collaborative features (who's viewing/editing)

---

## Implementation: Broadcast-from-Database Pattern

### A) Trigger Emits Broadcast Event (Controlled)

Use `realtime.send` for custom events, or `realtime.broadcast_changes` if you want change-format compatibility.

**Security Best Practice:** Use `SECURITY DEFINER SET search_path = ''` to prevent search path attacks.

### B) Authorization (Must-Have)

Broadcast-from-Database relies on **Realtime Authorization**, enforced via RLS on `realtime.messages`.

**Scope topics properly:**
- `user:<user_id>:notifications` - User-specific
- `tenant:<tenant_id>:dashboard` - Tenant-specific
- `thread:<thread_id>:messages` - Thread-specific

Then write RLS policies so users can only receive topics they're entitled to.

### C) Client Listens to Broadcast → Refetches

Clients subscribe to the topic, listen to broadcast events, then **refetch the authoritative data** (or update local state).

---

## Component-Specific Implementation

### 1. Notifications (`NotificationCenter.tsx`)

**Database Trigger:**
```sql
CREATE OR REPLACE FUNCTION broadcast_notification()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Send lightweight "invalidate" signal
  PERFORM realtime.send(
    jsonb_build_object(
      'type', 'new_notification',
      'id', NEW.id,
      'user_id', NEW.user_id
    ),
    'notification_created',
    'user:' || NEW.user_id::text || ':notifications',
    true  -- private channel
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_broadcast_trigger
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_notification();
```

**RLS Policy:**
```sql
-- Allow authenticated users to receive broadcasts for their own topics
CREATE POLICY "users_receive_own_notifications"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'user:' || auth.uid()::text || ':%'
);
```

**Client Code:**
```typescript
const channel = supabase
  .channel(`user:${currentUser.id}:notifications`, {
    config: { private: true }
  })
  .on('broadcast', { event: 'notification_created' }, async (payload) => {
    // Refetch notifications (don't trust broadcast payload alone)
    await fetchNotifications();
    
    // Show browser notification
    if (Notification.permission === "granted") {
      new Notification("New notification", {
        body: "You have a new notification",
        icon: "/favicon.ico",
      });
    }
  })
  .subscribe();
```

**Reliability (Catch-Up):**
```typescript
// Fetch on page load
useEffect(() => {
  fetchNotifications();
}, []);

// Fetch on tab focus
useEffect(() => {
  const handleFocus = () => {
    fetchNotifications();
  };
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);

// Optional: Slow polling catch-up (every 60s)
usePolling({
  interval: 60000,
  onPoll: fetchNotifications,
  pauseWhenHidden: true,
});
```

---

### 2. Dashboard Stats (`DashboardStatsClient.tsx`)

**Database Trigger:**
```sql
CREATE OR REPLACE FUNCTION broadcast_stats_update()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  affected_tenant_id UUID;
BEGIN
  -- Determine tenant ID from the change
  IF TG_TABLE_NAME = 'documents' THEN
    affected_tenant_id := NEW.tenant_id;
  ELSIF TG_TABLE_NAME = 'payments' THEN
    affected_tenant_id := NEW.tenant_id;
  ELSIF TG_TABLE_NAME = 'statements' THEN
    affected_tenant_id := NEW.tenant_id;
  ELSIF TG_TABLE_NAME = 'messages' THEN
    -- Get tenant from thread
    SELECT tenant_id INTO affected_tenant_id
    FROM message_threads
    WHERE id = NEW.thread_id;
  END IF;

  -- Send lightweight "invalidate" signal
  IF affected_tenant_id IS NOT NULL THEN
    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'stats_updated',
        'table', TG_TABLE_NAME,
        'tenant_id', affected_tenant_id
      ),
      'stats_invalidated',
      'tenant:' || affected_tenant_id::text || ':dashboard',
      true  -- private channel
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER documents_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION broadcast_stats_update();

CREATE TRIGGER payments_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION broadcast_stats_update();

CREATE TRIGGER statements_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON statements
  FOR EACH ROW EXECUTE FUNCTION broadcast_stats_update();

CREATE TRIGGER messages_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION broadcast_stats_update();
```

**RLS Policy:**
```sql
-- Allow users to receive broadcasts for their tenant's dashboard
CREATE POLICY "users_receive_tenant_dashboard"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'tenant:' || (
    SELECT tenant_id::text FROM users WHERE id = auth.uid()
  ) || ':dashboard'
);
```

**Client Code:**
```typescript
const channel = supabase
  .channel(`tenant:${tenantId}:dashboard`, {
    config: { private: true }
  })
  .on('broadcast', { event: 'stats_invalidated' }, (payload) => {
    // Debounced refetch (already implemented)
    fetchStats();
  })
  .subscribe();
```

**Reliability (Catch-Up):**
```typescript
// Fetch on page load
useEffect(() => {
  fetchStats();
}, []);

// Fetch on tab focus
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      fetchStats();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

// Optional: Slow polling catch-up (every 120s)
usePolling({
  interval: 120000,
  onPoll: fetchStats,
  pauseWhenHidden: true,
});
```

---

### 3. Messages (`MessageThread.tsx`)

**Option A: Keep Postgres Changes (if volume is low)**
```typescript
// Only if message volume per thread is < 100/minute
const channel = supabase
  .channel(`thread:${threadId}:messages`, {
    config: { private: true }
  })
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`,
  }, (payload) => {
    setMessages((prev) => [...prev, payload.new as Message]);
    scrollToBottom();
  })
  .subscribe();
```

**Option B: Use Broadcast (Recommended for scale)**
```sql
CREATE OR REPLACE FUNCTION broadcast_message()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'type', 'new_message',
      'thread_id', NEW.thread_id,
      'id', NEW.id
    ),
    'message_created',
    'thread:' || NEW.thread_id::text || ':messages',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_broadcast_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_message();
```

```typescript
const channel = supabase
  .channel(`thread:${threadId}:messages`, {
    config: { private: true }
  })
  .on('broadcast', { event: 'message_created' }, async (payload) => {
    // Refetch messages (or update locally if you trust the payload)
    await fetchMessages();
    scrollToBottom();
  })
  .subscribe();
```

---

## RLS Setup for Realtime Authorization

**Critical:** Broadcast-from-Database requires RLS policies on `realtime.messages`:

```sql
-- Allow authenticated users to receive broadcasts for their own topics
CREATE POLICY "users_receive_own_notifications"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'user:' || auth.uid()::text || ':%'
);

-- Allow authenticated users to receive tenant-scoped broadcasts
CREATE POLICY "users_receive_tenant_dashboard"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'tenant:' || (
    SELECT tenant_id::text FROM users WHERE id = auth.uid()
  ) || ':%'
);

-- Allow authenticated users to receive thread-scoped broadcasts
-- (if they have access to the thread)
CREATE POLICY "users_receive_thread_messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'thread:%:messages' AND
  EXISTS (
    SELECT 1 FROM message_threads mt
    JOIN users u ON u.organization_id = mt.organization_id
    WHERE u.id = auth.uid()
    AND topic = 'thread:' || mt.id::text || ':messages'
  )
);

-- Allow system/triggers to send broadcasts
-- (This is handled by SECURITY DEFINER functions)
```

---

## Benefits of Broadcast-from-Database Approach

* ✅ **Real-Time UX** - No manual refresh buttons, instant updates
* ✅ **Independent of Changefeed Noise** - Not tied to row-level update volume
* ✅ **User-Scoped** - Only relevant users receive updates
* ✅ **Lightweight** - Small payloads, not full row data
* ✅ **Professional** - Enterprise-grade real-time experience
* ✅ **Predictable** - You control what gets broadcast
* ✅ **Scalable** - Works with high database update frequency
* ✅ **Reliable** - Catch-up polling ensures no missed updates

---

## Reliability Pattern: Catch-Up Polling

Since Broadcast is ephemeral, always implement catch-up:

```typescript
// hooks/usePolling.ts
import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval: number;
  onPoll: () => Promise<void>;
  pauseWhenHidden?: boolean;
  backoffOnError?: boolean;
}

export function usePolling({
  enabled = true,
  interval,
  onPoll,
  pauseWhenHidden = true,
  backoffOnError = true,
}: UsePollingOptions) {
  const aliveRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout>();
  const errorCountRef = useRef(0);

  const tick = useCallback(async () => {
    if (!aliveRef.current || !enabled) return;

    if (pauseWhenHidden && document.visibilityState === "hidden") {
      timerRef.current = setTimeout(tick, interval * 2);
      return;
    }

    try {
      await onPoll();
      errorCountRef.current = 0;
      timerRef.current = setTimeout(tick, interval);
    } catch (error) {
      errorCountRef.current += 1;
      
      if (backoffOnError) {
        const backoffMultiplier = Math.min(2 ** errorCountRef.current, 4);
        timerRef.current = setTimeout(tick, interval * backoffMultiplier);
      } else {
        timerRef.current = setTimeout(tick, interval);
      }
    }
  }, [enabled, interval, onPoll, pauseWhenHidden, backoffOnError]);

  useEffect(() => {
    if (!enabled) return;

    aliveRef.current = true;
    tick();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && aliveRef.current) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      aliveRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tick, enabled]);
}
```

---

## Final Recommendation

**Decision:** Avoid Postgres Changes on high-frequency tables.  
**Use instead:** Broadcast-from-Database for controlled real-time signals + client refetch.

**Why:**
- Prevents row-level event storms
- Keeps real-time UX (no manual refresh buttons)
- Keeps DB as source of truth
- Easier debugging and predictable load

**Scope:**
- Use Broadcast for **new notification**, **message arrived**, **status changed** (meaningful transitions only)
- Use Presence only for **online/typing/viewing** UX (collaboration state), not data sync

---

## Next Steps (Action Plan)

### Immediate Actions

1. ✅ **Create Database Triggers** - Broadcast functions for notifications, stats
2. ✅ **Set Up RLS** - Allow authenticated users to receive broadcasts (scoped by topic)
3. ✅ **Update NotificationCenter** - Switch from Postgres Changes to Broadcast
4. ✅ **Update DashboardStats** - Switch from Postgres Changes to Broadcast
5. ✅ **Keep/Improve Messages** - Keep Postgres Changes (thread-scoped is OK) OR switch to Broadcast

### Implementation Order

1. **Day 1:** Create broadcast triggers for notifications + RLS policies
2. **Day 1:** Update NotificationCenter to use Broadcast + catch-up polling
3. **Day 2:** Create broadcast trigger for dashboard stats + RLS policies
4. **Day 2:** Update DashboardStatsClient to use Broadcast + catch-up polling
5. **Day 3:** Test and verify real-time updates work
6. **Ongoing:** Monitor broadcast volume, adjust as needed

---

## Table-Specific Analysis

Based on your schema:

**Tables to Use Broadcast:**
- ✅ `notifications` - User-scoped, INSERT-heavy → Broadcast
- ✅ `documents` - UPDATE-heavy (version changes) → Broadcast for stats
- ✅ `payments` - UPDATE-heavy (status changes) → Broadcast for stats
- ✅ `statements` - UPDATE-heavy → Broadcast for stats
- ⚠️ `messages` - INSERT-heavy, thread-scoped → Postgres Changes OK OR Broadcast

**Tables to Avoid Realtime:**
- ❌ `audit_logs` - High-volume, not user-facing
- ❌ `user_activity_logs` - High-volume, not user-facing
- ❌ `mdm_*` tables - Metadata tables, likely high-churn

---

*Last updated: 2025-01-27*
*Enterprise-grade real-time architecture: Broadcast-from-Database pattern with proper authorization and reliability*

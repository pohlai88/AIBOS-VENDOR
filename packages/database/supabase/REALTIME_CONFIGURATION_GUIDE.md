# Supabase Realtime Configuration & Optimization Guide

## Current Status

**⚠️ IMPORTANT**: No tables are currently enabled for Realtime replication. Your code is already using Realtime subscriptions, but they won't work until tables are enabled.

**Tables Currently Using Realtime in Code:**
- `messages` - Message threads
- `message_threads` - Thread management
- `notifications` - User notifications
- `documents` - Dashboard stats
- `payments` - Dashboard stats
- `statements` - Dashboard stats

---

## 1. Enable Realtime for Tables

### Method 1: Via Supabase Dashboard (Recommended for Initial Setup)

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable replication for each table:
   - ✅ `messages`
   - ✅ `message_threads`
   - ✅ `notifications`
   - ✅ `documents` (for dashboard stats)
   - ✅ `payments` (for dashboard stats)
   - ✅ `statements` (for dashboard stats)

### Method 2: Via SQL (Recommended for Production)

```sql
-- Enable Realtime for core messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime for dashboard stats tables
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE statements;

-- Verify enabled tables
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;
```

### Method 3: Create Migration

Create a new migration file to enable Realtime:

```sql
-- migrations/YYYYMMDDHHMMSS_enable_realtime.sql

-- Enable Realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime for dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE statements;
```

---

## 2. Realtime Authorization & Security

### Row Level Security (RLS) Integration

**CRITICAL**: Realtime respects RLS policies. Users only receive updates for rows they have access to.

**Current RLS Status:**
- ✅ All tables have RLS enabled
- ✅ Policies are tenant-scoped
- ✅ Policies filter by user organization

**Best Practices:**

1. **Always use filters in subscriptions** to reduce payload size:
```typescript
// ✅ GOOD: Filtered subscription
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: 'thread_id=eq.' + threadId, // Filter reduces data
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();

// ❌ BAD: No filter (receives ALL messages, then filtered by RLS)
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    // No filter - inefficient
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

2. **Verify RLS policies work correctly**:
```sql
-- Test RLS for messages table
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM messages WHERE thread_id = 'thread-uuid';
```

3. **Use tenant-scoped channels** when possible:
```typescript
// Channel name includes tenant ID for isolation
const channel = supabase
  .channel(`tenant-${tenantId}:messages`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages',
    filter: `organization_id=eq.${organizationId}`,
  }, handleUpdate)
  .subscribe();
```

---

## 3. Performance Optimization

### Channel Management

**Current Implementation Issues:**
- Multiple channels created per component
- No channel reuse
- Potential memory leaks if channels aren't cleaned up

**Optimized Approach:**

```typescript
// lib/realtime/channel-manager.ts
import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

class RealtimeChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private supabase = createClient();

  getChannel(name: string): RealtimeChannel {
    if (!this.channels.has(name)) {
      this.channels.set(name, this.supabase.channel(name));
    }
    return this.channels.get(name)!;
  }

  removeChannel(name: string) {
    const channel = this.channels.get(name);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(name);
    }
  }

  cleanup() {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const channelManager = new RealtimeChannelManager();
```

### Subscription Optimization

**1. Use Specific Events Instead of Wildcards:**

```typescript
// ✅ GOOD: Specific events
.on('postgres_changes', {
  event: 'INSERT', // Only INSERT events
  schema: 'public',
  table: 'messages',
  filter: 'thread_id=eq.' + threadId,
}, handleInsert)

// ⚠️ ACCEPTABLE: Multiple specific events
.on('postgres_changes', {
  event: 'INSERT,UPDATE', // Only INSERT and UPDATE
  schema: 'public',
  table: 'messages',
}, handleChange)

// ❌ BAD: Wildcard events (receives all changes)
.on('postgres_changes', {
  event: '*', // All events - inefficient
  schema: 'public',
  table: 'messages',
}, handleChange)
```

**2. Debounce Rapid Updates:**

```typescript
// Current implementation already debounces (500ms)
const fetchStats = useCallback(() => {
  if (fetchTimeoutRef.current) {
    clearTimeout(fetchTimeoutRef.current);
  }
  fetchTimeoutRef.current = setTimeout(async () => {
    // Fetch stats
  }, 500); // ✅ Good debounce
}, []);
```

**3. Batch Multiple Table Subscriptions:**

```typescript
// ✅ GOOD: Single channel for related tables
const dashboardChannel = supabase.channel('dashboard-stats')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'documents',
  }, fetchStats)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'payments',
  }, fetchStats)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'statements',
  }, fetchStats)
  .subscribe();

// ❌ BAD: Multiple channels for related data
const documentsChannel = supabase.channel('dashboard-documents')...
const paymentsChannel = supabase.channel('dashboard-payments')...
const statementsChannel = supabase.channel('dashboard-statements')...
```

---

## 4. Realtime Features Configuration

### A. Postgres Changes (Currently Used)

**What It Does:**
- Listens to database changes (INSERT, UPDATE, DELETE)
- Automatically filters by RLS policies
- Real-time synchronization

**Configuration:**
- ✅ Already implemented in code
- ⚠️ Needs tables enabled (see Section 1)

**Optimization Tips:**
- Use filters to reduce payload size
- Subscribe only to needed events
- Clean up subscriptions on unmount

### B. Presence (Not Currently Used)

**What It Does:**
- Track who's online
- Real-time user status
- Collaborative features (typing indicators, cursor tracking)

**Enable Presence for Messaging:**

```typescript
// components/messages/MessageThread.tsx
useEffect(() => {
  const supabase = createClient();
  
  // Postgres changes for messages
  const messagesChannel = supabase
    .channel(`messages:${threadId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `thread_id=eq.${threadId}`,
    }, handleNewMessage)
    
    // Add Presence tracking
    .on('presence', { event: 'sync' }, () => {
      const state = messagesChannel.presenceState();
      const onlineUsers = Object.values(state).flat();
      setOnlineUsers(onlineUsers);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user's presence
        await messagesChannel.track({
          user_id: currentUser.id,
          user_name: currentUser.name,
          online_at: new Date().toISOString(),
          thread_id: threadId,
        });
      }
    });

  return () => {
    supabase.removeChannel(messagesChannel);
  };
}, [threadId, currentUser]);
```

**Presence Configuration Options:**

```typescript
// Configure presence heartbeat (default: 30s)
const channel = supabase.channel('room-1', {
  config: {
    presence: {
      key: currentUser.id, // Unique key for user
      timeout: 60000, // 60 seconds before considered offline
    },
  },
});
```

### C. Broadcast (Not Currently Used)

**What It Does:**
- Send low-latency messages between clients
- Perfect for notifications, game events, custom events
- Doesn't require database changes

**Use Cases:**
- Typing indicators
- Live notifications
- Real-time collaboration events
- Custom application events

**Enable Broadcast for Typing Indicators:**

```typescript
// components/messages/MessageThread.tsx
const [isTyping, setIsTyping] = useState(false);
const typingTimeoutRef = useRef<NodeJS.Timeout>();

const handleTyping = useCallback(() => {
  if (!isTyping) {
    setIsTyping(true);
    // Broadcast typing event
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: currentUser.id,
        user_name: currentUser.name,
        thread_id: threadId,
      },
    });
  }

  // Reset typing state after 3 seconds
  clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    setIsTyping(false);
    channel.send({
      type: 'broadcast',
      event: 'typing_stopped',
      payload: {
        user_id: currentUser.id,
        thread_id: threadId,
      },
    });
  }, 3000);
}, [isTyping, currentUser, threadId, channel]);

// Listen for typing events
useEffect(() => {
  const channel = supabase.channel(`messages:${threadId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload.user_id !== currentUser.id) {
        setOtherUserTyping(payload.payload.user_name);
      }
    })
    .on('broadcast', { event: 'typing_stopped' }, (payload) => {
      if (payload.payload.user_id !== currentUser.id) {
        setOtherUserTyping(null);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [threadId, currentUser]);
```

---

## 5. Quotas & Limits

### Free Tier Limits

- **Concurrent Connections**: 200
- **Messages per Second**: 2
- **Channels per Connection**: Unlimited
- **Presence Users per Channel**: 100

### Pro Tier Limits

- **Concurrent Connections**: 500
- **Messages per Second**: 20
- **Channels per Connection**: Unlimited
- **Presence Users per Channel**: 1,000

### Enterprise Tier

- Custom limits based on plan
- Higher message throughput
- Dedicated infrastructure

### Monitoring Usage

```typescript
// Monitor channel subscription status
channel.subscribe((status) => {
  console.log('Channel status:', status);
  // Statuses: SUBSCRIBED, TIMED_OUT, CLOSED, CHANNEL_ERROR
});

// Handle errors
channel.on('error', (error) => {
  console.error('Realtime error:', error);
  // Implement retry logic
});
```

---

## 6. Best Practices

### 1. Channel Naming Convention

```typescript
// ✅ GOOD: Descriptive, scoped names
`tenant-${tenantId}:messages`
`thread-${threadId}:messages`
`user-${userId}:notifications`

// ❌ BAD: Generic names
`messages`
`channel1`
`test`
```

### 2. Cleanup Subscriptions

```typescript
// ✅ GOOD: Always cleanup
useEffect(() => {
  const channel = supabase.channel('messages').subscribe();
  
  return () => {
    supabase.removeChannel(channel); // ✅ Cleanup
  };
}, []);

// ❌ BAD: No cleanup (memory leak)
useEffect(() => {
  const channel = supabase.channel('messages').subscribe();
  // No cleanup - memory leak!
}, []);
```

### 3. Error Handling

```typescript
// ✅ GOOD: Handle errors and retry
const subscribeWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const channel = supabase.channel('messages')
        .on('postgres_changes', config, handler)
        .subscribe();
      
      channel.on('error', (error) => {
        console.error('Channel error:', error);
        // Retry logic
      });
      
      return channel;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 4. Connection State Management

```typescript
// Monitor connection state
useEffect(() => {
  const supabase = createClient();
  
  const channel = supabase.channel('messages')
    .on('system', {}, (payload) => {
      if (payload.status === 'SUBSCRIBED') {
        console.log('Connected to Realtime');
      } else if (payload.status === 'CHANNEL_ERROR') {
        console.error('Realtime connection error');
        // Implement reconnection logic
      }
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 5. Optimize Payload Size

```typescript
// ✅ GOOD: Filter at database level
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  filter: 'thread_id=eq.' + threadId + ',organization_id=eq.' + orgId,
}, handler)

// ❌ BAD: Receive all, filter in code
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  // No filter - receives all messages
}, (payload) => {
  if (payload.new.thread_id === threadId) { // Filter in code - inefficient
    handler(payload);
  }
})
```

---

## 7. Production Checklist

- [ ] Enable Realtime for all required tables
- [ ] Verify RLS policies work with Realtime
- [ ] Test subscriptions with multiple users
- [ ] Monitor connection limits
- [ ] Implement error handling and retry logic
- [ ] Clean up subscriptions on component unmount
- [ ] Use filters to reduce payload size
- [ ] Monitor Realtime usage in Supabase Dashboard
- [ ] Set up alerts for connection errors
- [ ] Document channel naming conventions
- [ ] Test presence and broadcast if needed
- [ ] Optimize channel reuse (avoid duplicate channels)

---

## 8. Troubleshooting

### Issue: Subscriptions Not Receiving Updates

**Check:**
1. Tables enabled for Realtime? (See Section 1)
2. RLS policies allow user access?
3. Filters are correct?
4. Channel subscribed successfully?

```typescript
// Debug subscription
channel.subscribe((status) => {
  console.log('Subscription status:', status);
  if (status === 'SUBSCRIBED') {
    console.log('✅ Successfully subscribed');
  } else if (status === 'CHANNEL_ERROR') {
    console.error('❌ Subscription error');
  }
});
```

### Issue: Too Many Connections

**Solution:**
- Reuse channels across components
- Close unused channels
- Use single channel for related subscriptions
- Monitor connection count in Dashboard

### Issue: High Latency

**Solutions:**
- Use filters to reduce payload size
- Subscribe only to needed events
- Use Broadcast for non-database events
- Check network conditions
- Consider regional deployment

---

## 9. Next Steps

1. **Immediate**: Enable Realtime for tables (Section 1)
2. **Short-term**: Optimize channel management (Section 3)
3. **Medium-term**: Add Presence for messaging (Section 4.B)
4. **Long-term**: Implement Broadcast for typing indicators (Section 4.C)

---

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Authorization](https://supabase.com/docs/guides/realtime/security/authorization)
- [Realtime Quotas](https://supabase.com/docs/guides/realtime/quotas)
- [Realtime Best Practices](https://supabase.com/docs/guides/realtime/concepts)

---

*Last updated: 2025-01-27*

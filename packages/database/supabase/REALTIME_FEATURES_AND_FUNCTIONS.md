# Supabase Realtime Features & Functions

## Overview

Supabase Realtime is a globally distributed real-time service that enables real-time communication between clients. It provides three core extensions: **Broadcast**, **Presence**, and **Postgres Changes**.

---

## Core Features

### 1. Broadcast
**Purpose**: Send low-latency messages between clients

**Use Cases:**
- Real-time messaging
- Typing indicators
- Cursor tracking
- Game events
- Custom notifications
- Database change notifications (via triggers)

**Key Characteristics:**
- Ephemeral messages (not persisted)
- Low latency
- Perfect for high-frequency updates
- Can be sent via client libraries, REST API, or database triggers

### 2. Presence
**Purpose**: Track and synchronize user state across clients

**Use Cases:**
- Show who's online
- Active user counters
- Collaborative features
- User status tracking

**Key Characteristics:**
- Uses Conflict-Free Replicated Data Type (CRDT)
- Automatically handles disconnections
- Computationally heavy (use sparingly)
- State is held by Realtime server
- New clients receive latest state immediately

### 3. Postgres Changes
**Purpose**: Listen to database changes in real-time

**Use Cases:**
- Real-time data synchronization
- Live dashboards
- Instant notifications on data changes
- Quick testing and development

**Key Characteristics:**
- Respects Row Level Security (RLS) policies
- Requires tables to be enabled for replication
- Can filter by schema, table, event type, and column values
- Supports INSERT, UPDATE, DELETE events

---

## Core Functions & Methods

### Channel Management

#### `supabase.channel(topic, config?)`
Create a new Realtime channel.

**Parameters:**
- `topic` (string): Unique channel identifier (e.g., `'room:123:messages'`)
- `config` (optional): Channel configuration
  - `private`: Boolean - Use private channel for security
  - `broadcast`: Broadcast configuration
  - `presence`: Presence configuration

**Example:**
```typescript
const channel = supabase.channel('room:123:messages', {
  config: { private: true }
})
```

#### `channel.subscribe(callback?)`
Subscribe to a channel and start receiving events.

**Returns:** Promise that resolves with subscription status
**Statuses:** `SUBSCRIBED`, `TIMED_OUT`, `CLOSED`, `CHANNEL_ERROR`

**Example:**
```typescript
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Connected!')
  }
})
```

#### `channel.unsubscribe()` / `supabase.removeChannel(channel)`
Unsubscribe from a channel and clean up resources.

**Example:**
```typescript
await channel.unsubscribe()
// or
supabase.removeChannel(channel)
```

---

### Broadcast Functions

#### `channel.send(message)`
Send a broadcast message to all subscribers in the channel.

**Message Format:**
```typescript
{
  type: 'broadcast',
  event: 'event-name',
  payload: { /* your data */ }
}
```

**Example:**
```typescript
await channel.send({
  type: 'broadcast',
  event: 'message_sent',
  payload: {
    text: 'Hello!',
    user: 'john_doe',
    timestamp: new Date().toISOString()
  }
})
```

#### `channel.on('broadcast', config, callback)`
Listen for broadcast messages.

**Parameters:**
- `event`: Event name to listen for (or `'*'` for all events)
- `callback`: Function to handle received messages

**Example:**
```typescript
channel
  .on('broadcast', { event: 'message_sent' }, (payload) => {
    console.log('Received:', payload.payload)
  })
  .subscribe()
```

**Broadcast Configuration Options:**
- `self`: Boolean - Receive your own messages (default: false)
- `ack`: Boolean - Acknowledge message receipt (default: false)

---

### Presence Functions

#### `channel.track(state)`
Track your presence state in the channel.

**Parameters:**
- `state`: Object containing your presence data

**Example:**
```typescript
await channel.track({
  user_id: currentUser.id,
  user_name: currentUser.name,
  online_at: new Date().toISOString()
})
```

#### `channel.untrack()`
Stop tracking your presence.

**Example:**
```typescript
await channel.untrack()
```

#### `channel.presenceState()`
Get the current presence state of all users in the channel.

**Returns:** Object with user keys and their presence data

**Example:**
```typescript
const state = channel.presenceState()
console.log('Online users:', Object.values(state).flat())
```

#### `channel.on('presence', config, callback)`
Listen for presence events.

**Events:**
- `sync`: Fired when presence state is synchronized
- `join`: Fired when a user joins
- `leave`: Fired when a user leaves

**Example:**
```typescript
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Synced:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ online_at: new Date().toISOString() })
    }
  })
```

**Presence Configuration:**
- `key`: Custom key for presence tracking (default: auto-generated UUID)
- `timeout`: Timeout in milliseconds before considered offline (default: 30000)

---

### Postgres Changes Functions

#### `channel.on('postgres_changes', config, callback)`
Listen for database changes.

**Configuration:**
```typescript
{
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  schema: 'public' | '*',
  table: 'table_name' | '*',
  filter?: 'column=eq.value' // Optional filter
}
```

**Example:**
```typescript
channel
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: 'thread_id=eq.123'
  }, (payload) => {
    console.log('New message:', payload.new)
  })
  .subscribe()
```

**Payload Structure:**
```typescript
{
  ids: [number],
  data: {
    schema: string,
    table: string,
    commit_timestamp: string,
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    new: { [key: string]: any },
    old: { [key: string]: any },
    errors: string | null,
    latency: number
  }
}
```

---

## Database Functions

### `realtime.send(payload, event, topic, private)`
Send a broadcast message directly from the database.

**Parameters:**
- `payload`: JSONB object with message data
- `event`: Event name
- `topic`: Channel topic
- `private`: Boolean - Private channel flag

**Example:**
```sql
SELECT realtime.send(
  jsonb_build_object('message', 'Hello from database'),
  'notification',
  'room:123:messages',
  false
);
```

### `realtime.broadcast_changes(topic, event, operation, table, schema, new_record, old_record)`
Broadcast database changes with full metadata.

**Example:**
```sql
CREATE OR REPLACE FUNCTION broadcast_message_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'room:' || NEW.room_id::text || ':messages',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## REST API Functions

### Broadcast via REST API

**Endpoint:** `POST /realtime/v1/api/broadcast`

**Headers:**
- `apikey`: Your Supabase API key
- `Content-Type`: application/json

**Body:**
```json
{
  "messages": [
    {
      "topic": "room:123:messages",
      "event": "message_sent",
      "payload": {
        "text": "Hello!",
        "user": "john_doe"
      }
    }
  ]
}
```

**Example:**
```typescript
const response = await fetch(
  'https://<project>.supabase.co/realtime/v1/api/broadcast',
  {
    method: 'POST',
    headers: {
      'apikey': '<your-api-key>',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [{
        topic: 'room:123:messages',
        event: 'message_sent',
        payload: { text: 'Hello!' }
      }]
    })
  }
)
```

---

## Channel Event Handlers

### System Events

#### `channel.on('system', {}, callback)`
Listen for system messages about channel status.

**Example:**
```typescript
channel.on('system', {}, (payload) => {
  if (payload.status === 'SUBSCRIBED') {
    console.log('Connected to Realtime')
  } else if (payload.status === 'CHANNEL_ERROR') {
    console.error('Connection error')
  }
})
```

### Error Handling

#### `channel.on('error', callback)`
Listen for channel errors.

**Example:**
```typescript
channel.on('error', (error) => {
  console.error('Realtime error:', error)
  // Implement retry logic
})
```

---

## Configuration Options

### Channel Configuration

```typescript
const channel = supabase.channel('room-1', {
  config: {
    // Private channel (requires RLS)
    private: true,
    
    // Broadcast options
    broadcast: {
      self: true,        // Receive own messages
      ack: true         // Acknowledge messages
    },
    
    // Presence options
    presence: {
      key: 'user-123',  // Custom presence key
      timeout: 60000   // 60 seconds timeout
    }
  }
})
```

---

## Authorization

### Row Level Security (RLS)

Realtime respects RLS policies. For private channels, create policies on `realtime.messages`:

```sql
-- Allow authenticated users to receive broadcasts
CREATE POLICY "authenticated can receive broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to send broadcasts
CREATE POLICY "authenticated can send broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

## Best Practices

### 1. Channel Naming
Use descriptive, scoped names: `scope:id:entity`
- ✅ `room:123:messages`
- ✅ `user:456:notifications`
- ❌ `messages` (too generic)

### 2. Cleanup
Always unsubscribe when done:
```typescript
useEffect(() => {
  const channel = supabase.channel('room:123:messages')
  // ... setup
  
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 3. Use Private Channels
Always use private channels in production:
```typescript
const channel = supabase.channel('room:123:messages', {
  config: { private: true }
})
```

### 4. Filter Subscriptions
Use filters to reduce payload size:
```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  filter: 'thread_id=eq.123' // ✅ Filter at database level
}, handler)
```

### 5. Choose the Right Feature
- **Broadcast**: Default choice for most use cases
- **Presence**: Use sparingly (computationally heavy)
- **Postgres Changes**: Quick testing, low user count

---

## Quotas & Limits

### Free Tier
- Concurrent Connections: 200
- Messages per Second: 2
- Channels per Connection: Unlimited
- Presence Users per Channel: 100

### Pro Tier
- Concurrent Connections: 500
- Messages per Second: 20
- Channels per Connection: Unlimited
- Presence Users per Channel: 1,000

### Enterprise Tier
- Custom limits
- Higher message throughput
- Dedicated infrastructure

---

## Protocol Details

### WebSocket Connection
```
wss://<PROJECT_REF>.supabase.co/realtime/v1/websocket?apikey=<API_KEY>
```

### Message Format
```typescript
{
  event: string,    // Event type
  topic: string,     // Channel topic
  payload: any,     // Event data
  ref: string       // Unique reference ID
}
```

### Event Types
- `phx_join`: Join channel
- `phx_leave`: Leave channel
- `phx_close`: Channel closed
- `phx_error`: Error occurred
- `phx_reply`: Response to request
- `heartbeat`: Keep connection alive
- `broadcast`: Broadcast message
- `presence`: Presence update
- `presence_state`: Initial presence state
- `presence_diff`: Presence state changes
- `postgres_changes`: Database change
- `system`: System status message

---

## Summary

**Supabase Realtime provides:**

1. **Three Core Extensions:**
   - Broadcast: Low-latency messaging
   - Presence: User state tracking
   - Postgres Changes: Database change listeners

2. **Multiple Integration Methods:**
   - Client libraries (JavaScript, Dart, Swift, Kotlin, Python)
   - REST API
   - Database triggers/functions

3. **Security:**
   - RLS policy integration
   - Private channels
   - JWT authentication

4. **Scalability:**
   - Globally distributed
   - Connection pooling
   - Efficient message routing

5. **Flexibility:**
   - Custom event names
   - Filtered subscriptions
   - Configurable options

---

*Last updated: 2025-01-27*
*Based on Supabase Realtime Documentation*

# Supabase Realtime Integration for InfoBar Component

This document explains the Supabase Realtime integration implemented in the InfoBar component for live notification updates.

## Overview

The InfoBar component now includes real-time functionality that automatically updates notifications when changes occur in the `Notification` table in your Supabase database.

## Features

- **Real-time Updates**: Automatically receives new notifications without page refresh
- **Live Status Indicator**: Visual indicator showing real-time connection status
- **Event Handling**: Supports INSERT, UPDATE, and DELETE operations
- **Unit Filtering**: Optionally filters notifications by unitId
- **Automatic Cleanup**: Properly manages subscriptions to prevent memory leaks

## Implementation Details

### Files Modified/Created

1. **`src/lib/supabase.ts`** - Supabase client configuration
2. **`src/components/global/infobar.tsx`** - Updated with real-time functionality

### Key Components

#### Supabase Client Setup
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

#### Real-time Subscription
The InfoBar component subscribes to changes in the `Notification` table:

```typescript
const channel = supabase
  .channel('notification-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'Notification',
      // Filter notifications based on unitId if provided
      ...(unitId && { filter: `unitId=eq.${unitId}` })
    },
    handleRealtimeUpdate
  )
  .subscribe();
```

### Event Handling

The component handles three types of database events:

1. **INSERT**: Adds new notifications to the list
2. **UPDATE**: Updates existing notifications (e.g., marking as read)
3. **DELETE**: Removes deleted notifications from the list

### Visual Indicators

- **Connection Status**: Green dot indicates active real-time connection, gray dot indicates disconnected
- **Notification Count**: Red badge shows unread notification count
- **Positioning**: Connection indicator adjusts position when notification count is present

## Environment Variables Required

Ensure these environment variables are set in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Requirements

### Enable Realtime on Notification Table

In your Supabase dashboard, ensure Realtime is enabled for the `Notification` table:

1. Go to Database → Replication
2. Find the `Notification` table
3. Enable realtime replication

### Row Level Security (RLS)

If you have RLS enabled, ensure your policies allow the authenticated user to:
- SELECT notifications they should see
- Receive real-time updates for those notifications

## Usage

The real-time functionality is automatically active when the InfoBar component is mounted. No additional setup is required in parent components.

### Props

The InfoBar component accepts the same props as before:

```typescript
interface Props {
  notifications: NotificationWithUser;
  unitId?: string;
  className?: string;
  role?: Role;
}
```

## Performance Considerations

- **Event Rate Limiting**: Configured to handle up to 10 events per second
- **Memory Management**: Subscriptions are automatically cleaned up on component unmount
- **Duplicate Prevention**: New notifications are checked against existing ones to prevent duplicates
- **Efficient Updates**: Only the affected notifications are updated, not the entire list

## Troubleshooting

### Common Issues

1. **Real-time not working**:
   - Check if Realtime is enabled on the Notification table
   - Verify environment variables are correct
   - Check browser console for connection errors

2. **Connection indicator shows gray**:
   - Check network connectivity
   - Verify Supabase project is active
   - Check for any RLS policy issues

3. **Duplicate notifications**:
   - The component includes duplicate prevention logic
   - If duplicates persist, check for multiple subscriptions

### Debug Information

The component logs useful information to the browser console:
- Subscription status changes
- Real-time update events
- Connection cleanup

## Security Notes

- Uses Supabase's built-in authentication and RLS
- Only receives updates for notifications the user has access to
- No sensitive data is exposed in real-time events
- Automatic cleanup prevents subscription leaks

## Future Enhancements

Potential improvements for the real-time functionality:

1. **Toast Notifications**: Show toast messages for new notifications
2. **Sound Alerts**: Audio notifications for important updates
3. **Batch Updates**: Group multiple rapid updates for better performance
4. **Offline Support**: Queue updates when connection is lost
5. **Custom Filters**: More granular filtering options

## Dependencies

This implementation requires:
- `@supabase/supabase-js` (already installed)
- React 18+ with hooks support
- Next.js 14+ (for environment variables)

The integration is production-ready and follows React best practices for real-time data management.
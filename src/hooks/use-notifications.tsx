/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { markNotificationAsRead } from "@/lib/queries";
import { NotificationWithUser } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseNotificationProps {
  initialNotifications: NotificationWithUser | [];
  unitId?: string;
}

interface UseNotificationReturn {
  notifications: NotificationWithUser | [];
  isConnected: boolean;
  handleMarkAsRead: (notificationId: string) => Promise<void>;
  setNotifications: React.Dispatch<
    React.SetStateAction<NotificationWithUser | []>
  >;
}

export const useNotification = ({
  initialNotifications,
  unitId,
}: UseNotificationProps): UseNotificationReturn => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationWithUser | []>(
    initialNotifications
  );
  const [isConnected, setIsConnected] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev ? prev.filter((n) => n.id !== notificationId) : []
      );
      router.refresh(); // Refresh data
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  // Handle real-time notification updates
  const handleRealtimeUpdate = useCallback(
    (payload: any) => {
      console.log("Real-time notification update:", payload);

      if (payload.eventType === "INSERT") {
        const newNotification = {
          ...payload.new,
          User: payload.new.User || {
            id: "",
            name: "Unknown",
            avatarUrl: "",
            email: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            role: "USER" as const,
            companyId: null,
          },
        };

        // Add the new notification to the current list
        setNotifications((prev) => {
          if (!prev) return [newNotification];

          // Check if notification already exists to avoid duplicates
          const exists = prev.some((notif) => notif.id === newNotification.id);
          if (exists) return prev;

          // Add new notification at the beginning (most recent first)
          return [newNotification, ...prev];
        });

        // Refresh the page data to get the complete notification with user details
        router.refresh();
      } else if (payload.eventType === "UPDATE") {
        const updatedNotification = payload.new;

        // Update existing notification (e.g., when marked as read)
        setNotifications((prev) => {
          if (!prev) return [];

          return prev.map((notif) =>
            notif.id === updatedNotification.id
              ? { ...notif, ...updatedNotification }
              : notif
          );
        });
      } else if (payload.eventType === "DELETE") {
        const deletedNotification = payload.old;

        // Remove deleted notification
        setNotifications((prev) => {
          if (!prev) return [];

          return prev.filter((notif) => notif.id !== deletedNotification.id);
        });
      }
    },
    [router]
  );

  // Set up Supabase Realtime subscription
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        // Create a unique channel name
        const channelName = `notification-changes-${unitId || "all"}`;

        // Create the channel
        channel = supabase.channel(channelName);

        // Set up the subscription configuration
        const subscriptionConfig = {
          event: "*" as const,
          schema: "public",
          table: "Notification",
          ...(unitId && { filter: `unitId=eq.${unitId}` }),
        };

        // Subscribe to postgres changes
        // Using any to bypass TypeScript issues with different Supabase versions
        (channel as RealtimeChannel).on(
          "postgres_changes",
          subscriptionConfig,
          handleRealtimeUpdate
        );

        // Subscribe to the channel
        const subscriptionStatus = await channel.subscribe((status: string) => {
          console.log("Realtime subscription status:", status);
          setIsConnected(status === "SUBSCRIBED");
        });

        console.log("Subscription setup completed:", subscriptionStatus);
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        setIsConnected(false);
      }
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log("Cleaning up realtime subscription");
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [unitId, handleRealtimeUpdate]);

  // Update local state when initialNotifications change
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  return {
    notifications,
    isConnected,
    handleMarkAsRead,
    setNotifications,
  };
};

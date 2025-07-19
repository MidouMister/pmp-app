"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createSupabaseClient } from "@/lib/supabase";
import { NotificationWithUser, SupabaseRealtimePayload } from "@/lib/types";
import {
  deleteNotification,
  markNotificationAsRead,
  getNotificationWithUser,
} from "@/lib/queries";

type UseNotificationProps = {
  initialNotifications: NotificationWithUser;
  unitId?: string;
};

export const useNotification = ({
  initialNotifications,
  unitId,
}: UseNotificationProps) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithUser>(
    initialNotifications || []
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createSupabaseClient
  > | null>(null);

  // Initialize Supabase client with auth token
  useEffect(() => {
    const initSupabase = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken({ template: "supabase" });
        if (!token) {
          console.error("No Supabase token available");
          return;
        }

        const supabaseClient = createSupabaseClient(token);
        setSupabase(supabaseClient);
      } catch (error) {
        console.error("Error initializing Supabase:", error);
      }
    };

    initSupabase();
  }, [getToken, isLoaded, isSignedIn]);

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const updatedNotification = await markNotificationAsRead(notificationId);

      if (updatedNotification) {
        setNotifications(
          (prev) =>
            prev?.map((notification) =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification
            ) || []
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle deleting a notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);

      setNotifications(
        (prev) =>
          prev?.filter((notification) => notification.id !== notificationId) ||
          []
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    setNotifications(initialNotifications || []);
  }, [initialNotifications]);

  // Set up realtime subscription
  useEffect(() => {
    if (!supabase || !isSignedIn) return;

    const setupRealtimeSubscription = async () => {
      try {
        // Get fresh token for realtime connection
        const freshToken = await getToken({ template: "supabase" });
        if (!freshToken) {
          console.error("No fresh token available for realtime");
          return;
        }

        // Create a fresh client for realtime
        const freshSupabaseClient = createSupabaseClient(freshToken);

        // CRITICAL: Ensure auth is set for realtime
        freshSupabaseClient.realtime.setAuth(freshToken);

        console.log("Setting up realtime subscription with fresh token");

        const channel = freshSupabaseClient
          .channel("notification-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Notification",
            },
            async (payload: SupabaseRealtimePayload) => {
              console.log("Received realtime payload:", payload);

              // Handle different types of changes
              if (payload.eventType === "INSERT") {
                // Fetch the complete notification with user data
                const newNotificationId = payload.new.id as string;
                const newNotificationWithUser = await getNotificationWithUser(
                  newNotificationId
                );

                if (newNotificationWithUser) {
                  setNotifications((prev) => [
                    newNotificationWithUser,
                    ...(prev || []),
                  ]);
                }
              } else if (payload.eventType === "UPDATE") {
                // Fetch the complete notification with user data
                const updatedNotificationId = payload.new.id as string;
                const updatedNotificationWithUser =
                  await getNotificationWithUser(updatedNotificationId);

                if (updatedNotificationWithUser) {
                  setNotifications(
                    (prev) =>
                      prev?.map((notification) =>
                        notification.id === updatedNotificationId
                          ? updatedNotificationWithUser
                          : notification
                      ) || []
                  );
                }
              } else if (payload.eventType === "DELETE") {
                // Remove deleted notification
                const deletedNotificationId = payload.old.id as string;
                setNotifications(
                  (prev) =>
                    prev?.filter(
                      (notification) =>
                        notification.id !== deletedNotificationId
                    ) || []
                );
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
            setIsConnected(status === "SUBSCRIBED");

            if (status === "CHANNEL_ERROR") {
              console.error("Realtime channel error - possibly RLS issue");
            }
          });

        return () => {
          console.log("Cleaning up Supabase subscription...");
          freshSupabaseClient.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
      }
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.());
    };
  }, [unitId, supabase, isSignedIn, getToken]);

  return {
    notifications,
    setNotifications,
    isConnected,
    handleMarkAsRead,
    handleDeleteNotification,
  };
};

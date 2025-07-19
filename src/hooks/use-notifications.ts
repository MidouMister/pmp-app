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
}: UseNotificationProps) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithUser>(
    initialNotifications || []
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);

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

  // Update notifications when initialNotifications changes
  useEffect(() => {
    setNotifications(initialNotifications || []);
  }, [initialNotifications]);

  // Set up realtime subscription
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const setupRealtimeSubscription = async () => {
      try {
        const token = await getToken({ template: "supabase" });
        if (!token) return;

        const supabaseClient = createSupabaseClient(token);

        const channel = supabaseClient
          .channel("notification-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Notification",
            },
            async (payload: SupabaseRealtimePayload) => {
              if (payload.eventType === "INSERT") {
                const newNotificationWithUser = await getNotificationWithUser(
                  payload.new.id as string
                );
                if (newNotificationWithUser) {
                  setNotifications((prev) => [
                    newNotificationWithUser,
                    ...(prev || []),
                  ]);
                }
              } else if (payload.eventType === "UPDATE") {
                const updatedNotificationWithUser =
                  await getNotificationWithUser(payload.new.id as string);
                if (updatedNotificationWithUser) {
                  setNotifications(
                    (prev) =>
                      prev?.map((notification) =>
                        notification.id === payload.new.id
                          ? updatedNotificationWithUser
                          : notification
                      ) || []
                  );
                }
              } else if (payload.eventType === "DELETE") {
                setNotifications(
                  (prev) =>
                    prev?.filter(
                      (notification) => notification.id !== payload.old.id
                    ) || []
                );
              }
            }
          )
          .subscribe((status) => {
            setIsConnected(status === "SUBSCRIBED");
          });

        return () => {
          supabaseClient.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
      }
    };

    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.());
    };
  }, [isLoaded, isSignedIn, getToken]);

  return {
    notifications,
    setNotifications,
    isConnected,
    handleMarkAsRead,
    handleDeleteNotification,
  };
};

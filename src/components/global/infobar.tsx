"use client";

import { UserButton } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Bell, Check, Info, ShieldAlert, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { NotificationWithUser } from "@/lib/types";
import { markNotificationAsRead } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { useSidebarCollapseContext } from "@/providers/sidebar-collapse-provider";

type Props = {
  notifications: NotificationWithUser | [];
  role?: Role;
  className?: string;
  unitId?: string;
};

const InfoBar = ({ notifications, unitId, className, role }: Props) => {
  const router = useRouter();
  const { isCollapsed } = useSidebarCollapseContext();
  const [allNotifications, setAllNotifications] = useState(notifications);
  const [showAll, setShowAll] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setAllNotifications((prev) =>
        prev ? prev.filter((n) => n.id !== notificationId) : []
      );
      router.refresh(); // Refresh data
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => item.unitId === unitId) ?? []
        );
      }
    }
    setShowAll((prev) => !prev);
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
            role: "USER",
            companyId: null,
          }, // Ensure User object exists
        };

        // Add the new notification to the current list
        setAllNotifications((prev) => {
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
        setAllNotifications((prev) => {
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
        setAllNotifications((prev) => {
          if (!prev) return [];

          return prev.filter((notif) => notif.id !== deletedNotification.id);
        });
      }
    },
    [router]
  );

  // Set up Supabase Realtime subscription
  useEffect(() => {
    let channel: any;

    const setupRealtimeSubscription = async () => {
      try {
        // Create a channel for notification changes
        channel = supabase
          .channel("notification-changes")
          .on(
            "postgres_changes",
            {
              event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "Notification",
              // Filter notifications based on unitId if provided
              ...(unitId && { filter: `unitId=eq.${unitId}` }),
            },
            handleRealtimeUpdate
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
            setIsConnected(status === "SUBSCRIBED");
          });
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
        supabase.removeChannel(channel);
      }
    };
  }, [unitId, handleRealtimeUpdate]);

  // Update local state when props change
  useEffect(() => {
    setAllNotifications(notifications);
  }, [notifications]);

  return (
    <>
      <div
        className={twMerge(
          `fixed z-[20] ${
            isCollapsed ? "md:left-[56px]" : "md:left-[224px]"
          } left-0 right-0 top-0 p-2 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px] transition-all duration-300`,
          className
        )}
      >
        <div className="flex items-center gap-4 ml-auto">
          <UserButton />
          <Sheet>
            <SheetTrigger asChild>
              <button className="relative rounded-full w-10 h-10 bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center text-white">
                <Bell size={20} />
                {(notifications?.length ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications?.length ?? 0}
                  </span>
                )}
                {/* Real-time connection indicator */}
                <div
                  className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    isConnected ? "bg-green-500" : "bg-gray-400"
                  } ${
                    (notifications?.length ?? 0) > 0
                      ? "translate-x-1 translate-y-1"
                      : ""
                  }`}
                  title={
                    isConnected
                      ? "Real-time connected"
                      : "Real-time disconnected"
                  }
                />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] mt-4 mr-4 pr-4 overflow-y-auto">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-2xl font-bold">
                  Notifications
                </SheetTitle>
                <SheetDescription>
                  {role === "OWNER" && (
                    <Card className="flex items-center justify-between p-4 mt-4">
                      <span className="font-medium">
                        Show Current Unit Only
                      </span>
                      <Switch
                        checked={!showAll}
                        onCheckedChange={handleClick}
                      />
                    </Card>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                {allNotifications?.length === 0 ? (
                  <div className="flex items-center justify-center text-muted-foreground h-40">
                    You have no notifications
                  </div>
                ) : (
                  allNotifications?.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`p-4 transition-colors ${
                        notification.read ? "bg-transparent" : "bg-muted/50"
                      } border-l-4 `}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={notification.User.avatarUrl || ""}
                              alt="Profile Picture"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {notification.User.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground truncate">
                              <span className="font-bold">
                                {notification.notification?.split("|")[0] || ""}
                              </span>
                              <span className="text-muted-foreground">
                                {notification.notification?.split("|")[1] || ""}
                              </span>
                              <span className="font-bold">
                                {notification.notification?.split("|")[2] || ""}
                              </span>
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                title={notification.type}
                                className="text-muted-foreground"
                              >
                                {notification.type === "INVITATION" && (
                                  <Info size={16} />
                                )}
                                {notification.type === "PROJECT_UPDATE" && (
                                  <Star size={16} />
                                )}
                                {notification.type === "TASK_ASSIGNMENT" && (
                                  <ShieldAlert size={16} />
                                )}
                              </span>
                              {!notification.read && (
                                <button
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                                  title="Mark as read"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </>
  );
};

export default InfoBar;

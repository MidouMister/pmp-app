"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { NotificationWithUser } from "@/lib/types";
import { useNotification } from "@/hooks/use-notifications";
import { Role } from "@prisma/client";

type NotificationContextType = {
  notifications: NotificationWithUser;
  isConnected: boolean;
  handleMarkAsRead: (notificationId: string) => Promise<void>;
  handleDeleteNotification: (notificationId: string) => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationWithUser>>;
  isLoading: boolean;
};

type NotificationProviderProps = {
  children: React.ReactNode;
  initialNotifications: NotificationWithUser;
  role: Role;
  unitId?: string;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
  initialNotifications,
  role,
  unitId,
}: NotificationProviderProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Use the custom hook to manage notifications
  const {
    notifications: allNotifications,
    isConnected,
    handleMarkAsRead,
    handleDeleteNotification,
    setNotifications,
  } = useNotification({
    initialNotifications,
    unitId,
  });

  // Set loading state based on auth status
  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  // Filter notifications based on role and unitId using useMemo for performance
  const filteredNotifications = useMemo(() => {
    if (!allNotifications || !isSignedIn) return [];

    // For OWNER and ADMIN, show all notifications
    if (role === "OWNER" || role === "ADMIN") {
      return allNotifications;
    }

    // For regular users, filter notifications to only show those for their unit
    if (unitId) {
      return allNotifications.filter(
        (notification) =>
          notification.unitId === unitId || notification.unitId === null
      );
    }

    return allNotifications;
  }, [allNotifications, role, unitId, isSignedIn]);

  const value = {
    notifications: filteredNotifications,
    isConnected,
    handleMarkAsRead,
    handleDeleteNotification,
    setNotifications,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

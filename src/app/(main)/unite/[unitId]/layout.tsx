import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/infobar";
import ResponsiveLayoutWrapper from "@/components/layout/responsive-layout-wrapper";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { NotificationWithUser } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";
import { NotificationProvider } from "@/providers/notification-provider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ unitId: string }>;
};

const UnitLayout = async ({ children, params }: Props) => {
  const { unitId } = await params;
  const companyId = await verifyAndAcceptInvitation();
  if (!companyId) {
    return <Unauthorized />;
  }
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }
  let notifications: NotificationWithUser = [];

  if (!user.privateMetadata.role) {
    return <Unauthorized />;
  } else {
    const allNotifications = await getNotificationAndUser(companyId, unitId);
    if (
      user.privateMetadata.role === "OWNER" ||
      user.privateMetadata.role === "ADMIN"
    ) {
      notifications = allNotifications || [];
    } else {
      const notificationsUnit = allNotifications?.filter(
        (notification) => notification.unitId === unitId
      );
      if (notificationsUnit) {
        notifications = notificationsUnit;
      }
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <ResponsiveLayoutWrapper>
        <Sidebar
          id={unitId}
          type={
            user.privateMetadata.role === "OWNER" ||
            user.privateMetadata.role === "ADMIN"
              ? "unit"
              : "user"
          }
        />
        <NotificationProvider
          initialNotifications={notifications}
          role={user.privateMetadata.role as Role}
          unitId={unitId}
        >
          <InfoBar
            notifications={notifications}
            role={user.privateMetadata.role as Role}
            unitId={unitId}
          />
          <div className="relative">
            <BlurPage className="mt-14">{children} </BlurPage>
          </div>
        </NotificationProvider>
      </ResponsiveLayoutWrapper>
    </div>
  );
};

export default UnitLayout;

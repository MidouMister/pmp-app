import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/infobar";
import ResponsiveLayoutWrapper from "@/components/layout/responsive-layout-wrapper";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { NotificationWithUser } from "@/lib/types";
import { NotificationProvider } from "@/providers/notification-provider";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
};

const UserLayout = async ({ children, params }: Props) => {
  const { userId } = await params;
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }

  const companyId = await verifyAndAcceptInvitation(
    user.id,
    user.emailAddresses[0].emailAddress,
    `${user.firstName} ${user.lastName}`,
    user.imageUrl
  );

  if (!companyId) {
    return <Unauthorized />;
  }

  // Get user data including their unit
  // const userData = await db.user.findUnique({
  //   where: { id: userId },
  //   include: { Unit: true },
  // });
  const userData = await getAuthUserDetails(
    user.emailAddresses[0].emailAddress
  );

  if (!userData?.Unit) {
    return <Unauthorized />;
  }

  const unitId = userData.Unit.id;
  let notifications: NotificationWithUser = [];

  if (!user.privateMetadata.role) {
    return <Unauthorized />;
  } else {
    const allNotifications = await getNotificationAndUser(companyId);
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
      <Sidebar id={unitId} type="user" user={userData} />
      <ResponsiveLayoutWrapper>
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
            <BlurPage className="mt-14 p-1">{children} </BlurPage>
          </div>
        </NotificationProvider>
      </ResponsiveLayoutWrapper>
    </div>
  );
};

export default UserLayout;

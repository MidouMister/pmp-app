import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/infobar";
import ResponsiveLayoutWrapper from "@/components/layout/responsive-layout-wrapper";
import Sidebar from "@/components/sidebar";
import LayoutSkeleton from "@/components/skeletons/layout-skeleton";
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
import React, { Suspense } from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ unitId: string }>;
};

const UnitLayout = async ({ children, params }: Props) => {
  const { unitId } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return redirect("/");
  }// Verify if user is invited
   const userEmail = clerkUser.emailAddresses[0].emailAddress;
  const userId = clerkUser.id;
  const userName = `${clerkUser.firstName} ${clerkUser.lastName}`;
  const userImage = clerkUser.imageUrl;
  
  const companyId = await verifyAndAcceptInvitation(userId, userEmail, userName, userImage);

        
  if (!companyId) {
    return <Unauthorized />;
  }
  let notifications: NotificationWithUser = [];

  if (!clerkUser.privateMetadata.role) {
    return <Unauthorized />;
  }

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutContent
        companyId={companyId}
        userId={clerkUser.id}
        userRole={clerkUser.privateMetadata.role as Role}
        userEmail={clerkUser.emailAddresses[0].emailAddress}
        unitId={unitId}
      >
        {children}
      </LayoutContent>
    </Suspense>
  );
};

export default UnitLayout;

async function LayoutContent({
  children,
  userId,
  companyId,
  unitId,
  userRole,
  userEmail,
}: {
  children: React.ReactNode;
  companyId: string;
  userId: string;
  unitId: string;
  userRole: Role;
  userEmail: string;
}) {
  "use cache";
  const user = await getAuthUserDetails(userEmail);
  if (!user) {
    return <Unauthorized />;
  }
  let notifications: NotificationWithUser = [];
  const allNotifications = await getNotificationAndUser(companyId, userId);

  if (user.role === "OWNER" || user.role === "ADMIN") {
    notifications = allNotifications || [];
  } else {
    const notificationsUnit = allNotifications?.filter(
      (notification) => notification.unitId === unitId
    );
    if (notificationsUnit) {
      notifications = notificationsUnit;
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <ResponsiveLayoutWrapper>
        <Sidebar
          id={unitId}
          type={
            user.role === "OWNER" || user.role === "ADMIN" ? "unit" : "user"
          }
          user={user}
        />
        <NotificationProvider
          initialNotifications={notifications}
          role={userRole}
          unitId={unitId}
        >
          <InfoBar
            notifications={notifications}
            role={userRole}
            unitId={unitId}
          />
          <div className="relative">
            <BlurPage className="mt-14 p-1">{children} </BlurPage>
          </div>
        </NotificationProvider>
      </ResponsiveLayoutWrapper>
    </div>
  );
}

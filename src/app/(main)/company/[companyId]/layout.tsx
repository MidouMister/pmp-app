// layout.tsx - Updated with Suspense

import ResponsiveLayoutWrapper from "@/components/layout/responsive-layout-wrapper";
import Sidebar from "@/components/sidebar";
import LayoutSkeleton from "@/components/skeletons/layout-skeleton";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, getNotificationAndUser } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/infobar";
import { NotificationWithUser } from "@/lib/types";
import { NotificationProvider } from "@/providers/notification-provider";
import { Role } from "@prisma/client";
import { cacheTag } from "next/cache";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }

  if (!companyId) {
    return redirect("/company");
  }

  if (user.privateMetadata.role !== "OWNER") {
    return <Unauthorized />;
  }
  // Extract serializable data OUTSIDE the cached component
  const userId = user.id;
  const userRole = user.privateMetadata.role as Role;
  const userEmail = user.emailAddresses[0].emailAddress;
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutContent
        companyId={companyId}
        userId={userId}
        userRole={userRole}
        userEmail={userEmail}
      >
        {children}
      </LayoutContent>
    </Suspense>
  );
}

// Create a separate async component for the main content
async function LayoutContent({
  children,
  companyId,
  userId,
  userRole,
  userEmail,
}: {
  children: React.ReactNode;
  companyId: string;
  userId: string;
  userRole: Role;
  userEmail: string;
}) {
  "use cache";
  cacheTag(`company-layout-${companyId}`);
  const user = await getAuthUserDetails(userEmail);
  const notifications = await getNotificationAndUser(companyId, userId);
  const allNoti: NotificationWithUser = notifications || [];

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        key={`company-${companyId}`}
        type="company"
        id={companyId}
        user={user}
      />

      <ResponsiveLayoutWrapper>
        <NotificationProvider initialNotifications={allNoti} role={userRole}>
          <InfoBar notifications={allNoti} role={userRole} />
          <div className="relative h-screen">
            <BlurPage className="mt-20 pt-4">{children}</BlurPage>
          </div>
        </NotificationProvider>
      </ResponsiveLayoutWrapper>
    </div>
  );
}

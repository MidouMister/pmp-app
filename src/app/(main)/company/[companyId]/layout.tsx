// layout.tsx - Updated with Suspense
import React, { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";
import Unauthorized from "@/components/unauthorized";
import { getNotificationAndUser } from "@/lib/queries";
import ResponsiveLayoutWrapper from "@/components/layout/responsive-layout-wrapper";
import LayoutSkeleton from "@/components/skeletons/layout-skeleton";

import { Role } from "@prisma/client";
import { NotificationWithUser } from "@/lib/types";
import InfoBar from "@/components/global/infobar";
import BlurPage from "@/components/global/blur-page";
import { NotificationProvider } from "@/providers/notification-provider";

// Create a separate async component for the main content
async function LayoutContent({
  children,
  companyId,
}: {
  children: React.ReactNode;
  companyId: string;
}) {
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

  const notifications = await getNotificationAndUser(companyId);
  const allNoti: NotificationWithUser = notifications || [];

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar type="company" id={companyId} />

      <ResponsiveLayoutWrapper>
        <NotificationProvider
          initialNotifications={allNoti}
          role={user.privateMetadata.role as Role}
        >
          <InfoBar
            notifications={allNoti}
            role={user.privateMetadata.role as Role}
          />
          <div className="relative">
            <BlurPage className="mt-14">{children}</BlurPage>
          </div>
        </NotificationProvider>
      </ResponsiveLayoutWrapper>
    </div>
  );
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutContent companyId={companyId}>{children}</LayoutContent>
    </Suspense>
  );
}

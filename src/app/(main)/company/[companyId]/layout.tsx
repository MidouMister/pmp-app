import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";
import Unauthorized from "@/components/unauthorized";
import { getNotificationAndUser } from "@/lib/queries";
import ResponsiveLayoutWrapper from "@/components/layout/responsive-layout-wrapper";

import { Role } from "@prisma/client";
import { NotificationWithUser } from "@/lib/types";
import InfoBar from "@/components/global/infobar";
import BlurPage from "@/components/global/blur-page";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companyId: string };
}) {
  const { companyId } = params; // ✅ pas de await ici

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
        <InfoBar
          notifications={allNoti}
          role={user.privateMetadata.role as Role}
        />
        <div className="relative">
          <BlurPage className="mt-18">{children}</BlurPage>
        </div>
      </ResponsiveLayoutWrapper>
    </div>
  );
}

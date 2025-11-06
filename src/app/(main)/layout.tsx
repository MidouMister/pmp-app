import { ClerkProvider } from "@clerk/nextjs";
import React, { Suspense } from "react";
import { dark } from "@clerk/themes";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import LayoutSkeleton from "@/components/skeletons/layout-skeleton";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full w-full">
            <LayoutSkeleton />
          </div>
        }
      >
        {children}
      </Suspense>
    </ClerkProvider>
  );
};

export default Layout;

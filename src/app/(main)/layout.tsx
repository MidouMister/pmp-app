import { ClerkProvider } from "@clerk/nextjs";
import React, { Suspense } from "react";
import { dark } from "@clerk/themes";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import Loading from "@/components/global/loading";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <NextSSRPlugin
        /**
         * The `extractRouterConfig` will extract **only** the route configs
         * from the router to prevent additional information from being
         * leaked to the client. The data passed to the client is the same
         * as if you were to fetch `/api/uploadthing` directly.
         */
        routerConfig={extractRouterConfig(ourFileRouter)}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full w-full">
            <Loading variant="dots" size="lg" text="Chargement..." />
          </div>
        }
      >
        {children}
      </Suspense>
    </ClerkProvider>
  );
};

export default Layout;

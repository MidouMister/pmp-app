import Loading from "@/components/global/loading";
import React, { Suspense } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full w-full">
          <Loading variant="pulse" size="lg" text="Verification..." />
        </div>
      }
    >
      <div className="h-full flex items-center justify-center">{children}</div>
    </Suspense>
  );
};

export default AuthLayout;

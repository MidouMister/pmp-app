import LayoutSkeleton from '@/components/skeletons/layout-skeleton';
import Unauthorized from '@/components/unauthorized';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react'

const Page = async () => {
  return (
   <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center"   >
        <LayoutSkeleton />
      </div>
    }>
      <UserPageContent />
    </Suspense>
  )
   
    
 
}

const UserPageContent = async () => {

      const companyId = await verifyAndAcceptInvitation();
      if (!companyId) return <Unauthorized />;
    
      const user = await getAuthUserDetails();
      if (!user) return null;
      
      if (user.role === "OWNER") {
        return redirect(`/company/${companyId}/units`);
      } 
      
      if (user.role === "ADMIN") {
        return redirect(`/unite/${user.unitId}`);
      }
       if (user.role === "USER") {
        return redirect(`/user/${user.id}`);
      }
      return <Unauthorized />;
}
export default Page;
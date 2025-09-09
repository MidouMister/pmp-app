import CompanyDetails from "@/components/forms/company-details";

import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";

const page = async () => {
  // verify if is invited
  const companyId = await verifyAndAcceptInvitation();
  console.log(companyId);

  // get users details
  const user = await getAuthUserDetails();
  console.log(user);

  if (companyId) {
    if (user?.role === "ADMIN" || user?.role === "USER") {
      return redirect("/unite");
    } else if (user?.role === "OWNER") {
      return redirect(`/company/${companyId}`);
    } else {
      return <Unauthorized />;
    }
  }
  //   const authUser = await getAuthUserDetails();
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl ">
        <h1 className="text-4xl"> Creér votre Entreprise</h1>
        <CompanyDetails data={{ id: user?.companyId || "" }} />
      </div>
    </div>
  );
};

export default page;

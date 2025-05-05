import React from "react";
type Params = Promise<{ companyId: string }>
const Page = async ( params : Params) => {
  const { companyId } = await params;
  return <div>Company {companyId}</div>;
};

export default Page;

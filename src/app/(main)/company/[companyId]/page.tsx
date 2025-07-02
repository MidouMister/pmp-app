type Params = Promise<{ companyId: string }>;
const page = async (params: Params) => {
  const { companyId } = await params;
  return <div>page Company {companyId}</div>;
};

export default page;

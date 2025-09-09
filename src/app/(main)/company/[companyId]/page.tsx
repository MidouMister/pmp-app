export default async function Page({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return <div>page Company {companyId}</div>;
}

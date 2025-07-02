export default async function Page({
  params,
}: {
  params: { companyId: string };
}) {
  return <div>page Company {params.companyId}</div>;
}

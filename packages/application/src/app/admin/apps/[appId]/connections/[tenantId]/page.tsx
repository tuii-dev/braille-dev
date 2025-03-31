import { IngestionStats } from "@/components/ingestion-stats";

export default async function Page({ params }: any) {
  return <IngestionStats tenantId={params.tenantId} appId={params.appId} />;
}

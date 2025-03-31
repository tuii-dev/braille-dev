import { IngestionStats } from "@/components/ingestion-stats";
import { Link } from "@/components/link";
import { Cell, Table } from "@/components/table";
import getCurrentAdminUser from "@/lib/getAdminUser";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page() {
  const { tenantId } = await getCurrentAdminUser();

  const app = await prisma.app.findFirst({
    include: {
      appPublisher: true,
      versions: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      entity: {
        include: {},
      },
    },
  });

  if (!app) {
    return notFound();
  }

  return (
    <div className="w-full p-12">
      <h1 className="text-2xl mb-8 font-bold">{app.name}</h1>
      <h2 className="text-xl font-semibold mb-4 mt-8">Indexed Entities</h2>
      <IngestionStats tenantId={tenantId} appId={app.id} />
      <h2 className="text-xl font-semibold mb-4 mt-8">Links</h2>
      <Table>
        <tbody>
          <tr>
            <Cell>
              <Link href="eula">End User License Agreement (EULA)</Link>
            </Cell>
          </tr>
          <tr>
            <Cell>
              <Link href="privacy-policy">Privacy Policy</Link>
            </Cell>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

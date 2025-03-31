import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

import { Cell, Table } from "@/components/table";
import { Submit } from "@/components/form-submit-button";
import { bootstrapApp } from "./actions";
import { Link } from "@/components/link";

export default async function Page({ params }: any) {
  const app = await prisma.app.findFirst({
    where: {
      id: params.appId,
    },
    include: {
      connections: {
        include: {
          tenant: true,
          app: {
            include: {
              versions: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!app) {
    return notFound();
  }

  const connections = app.connections;

  return (
    <div className="h-full w-full p-8">
      <h1 className="text-2xl font-semibold mb-8">{app.name}</h1>

      <Table>
        <thead>
          <tr>
            <Cell as="th">Tenant</Cell>
            <Cell as="th">Ingestion</Cell>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection) => (
            <tr key={connection.id}>
              <Cell>
                <Link
                  href={`/admin/apps/${app.id}/connections/${connection.tenant.id}`}
                >
                  {connection.tenant.name}
                </Link>
              </Cell>
              <Cell>
                <form
                  action={bootstrapApp.bind(null, app.id, connection.tenant.id)}
                >
                  <Submit>Sync</Submit>
                </form>
              </Cell>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

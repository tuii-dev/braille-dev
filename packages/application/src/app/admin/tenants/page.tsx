import prisma from "@/lib/prisma";
import { Cell, Table } from "@/components/table";
import { Link } from "@/components/link";
import { CreateTenantButton } from "./client";

export default async function Page() {
  const tenants = await prisma.tenant.findMany({
    include: {},
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <div className="py-8 px-12 flex-grow flex flex-col">
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold ">Tenants</h1>
        <CreateTenantButton />
      </div>
      <Table autoHeightMax="calc(100vh - 15rem)" className="h-auto flex-grow">
        <thead>
          <tr>
            <Cell as="th" scope="col">
              Name
            </Cell>
            <Cell as="th" scope="col">
              Created At
            </Cell>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => {
            return (
              <tr key={tenant.id}>
                <Cell>
                  <Link href={`/admin/tenants/${tenant.id}`}>
                    {tenant.name}
                  </Link>
                </Cell>
                <Cell>
                  <span>{tenant.createdAt.toUTCString()}</span>
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

import prisma from "@/lib/prisma";

import Field from "@/components/field";
import { Submit } from "@/components/form-submit-button";
import { Link } from "@/components/link";
import { Cell, Table } from "@/components/table";

import { createApp } from "./actions";
import { Scrollbars } from "@/components/scrollbars";

export default async function Page() {
  const apps = await prisma.app.findMany({
    include: {
      appOAuthClientSecret: true,
    },
  });

  return (
    <Scrollbars>
      <div className="py-8 p-12">
        <h1 className="text-xl font-semibold mb-8">Apps</h1>
        <div className="my-8">
          <h2 className="text-xl mb-4">Create App</h2>
          <form action={createApp}>
            <div className="flex flex-col gap-y-2">
              <Field label="Name" type="text" name="name" />
            </div>
            <footer className="mt-4 flex justify-end">
              <Submit>Create</Submit>
            </footer>
          </form>
        </div>
        <Table autoHeightMax="100%" className="h-auto">
          <thead>
            <tr>
              <Cell as="th" scope="col">
                Name
              </Cell>
              <Cell as="th" scope="col">
                OAuth Client ID
              </Cell>
              <Cell as="th" scope="col">
                Connections
              </Cell>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => {
              return (
                <tr key={app.id}>
                  <Cell>
                    <Link href={`/admin/apps/${app.id}`}>{app.name}</Link>
                  </Cell>
                  <Cell>{app.appOAuthClientSecret?.clientId}</Cell>
                  <Cell>
                    <Link href={`/admin/apps/${app.id}/connections`}>
                      Connections
                    </Link>
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Scrollbars>
  );
}

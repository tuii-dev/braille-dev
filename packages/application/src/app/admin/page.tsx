import { Cell, Table, THead } from "@/components/table";
import prisma from "@/lib/prisma";

export default async function Page() {
  const jobs = await prisma.dataExtractionJob.findMany({
    include: {
      tenant: true,
      document: {
        include: {
          createdBy: true,
        },
      },
      workspaceDocument: true,
      actionExecutions: {
        orderBy: {
          executedAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      tenantId: {
        not: {
          equals: undefined,
        },
      },
    },
    take: 10,
  });

  return (
    <div className="w-full h-full relative py-8 px-12 dark:bg-charcoal-950">
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-xl font-semibold">Documents</h1>
      </div>
      <Table className="h-auto">
        <THead>
          <tr>
            <Cell className="sticky top-0" as="th" scope="col">
              Email
            </Cell>
            <Cell className="sticky top-0" as="th" scope="col">
              Document
            </Cell>
            <Cell className="sticky top-0" as="th" scope="col">
              Workspace Doc Id
            </Cell>
            <Cell className="sticky top-0" as="th" scope="col">
              Created At
            </Cell>
            <Cell className="sticky top-0" as="th" scope="col">
              Status
            </Cell>
            <Cell className="sticky top-0" as="th" scope="col">
              Execution
            </Cell>
          </tr>
        </THead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <Cell>{job.document.createdBy.email}</Cell>
              <Cell>{job.document.name}</Cell>
              <Cell>{job.workspaceDocument?.id}</Cell>
              <Cell>{job.workspaceDocument?.createdAt.toISOString()}</Cell>
              <Cell>{job.status}</Cell>
              <Cell>
                {job.actionExecutions.map((exec) => exec.status).join(" <- ")}
              </Cell>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

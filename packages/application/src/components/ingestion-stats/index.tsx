import { Cell, Table } from "@/components/table";

import prisma from "@/lib/prisma";

export const IngestionStats = async ({
  tenantId,
  appId,
}: {
  tenantId: string;
  appId: string;
}) => {
  const entityCounts = await prisma.entity.groupBy({
    where: {
      appId,
      tenantId,
    },
    by: "modelId",
    _count: true,
  });

  const models = await prisma.model.findMany({
    where: {
      id: {
        in: entityCounts.map((entityCount) => entityCount.modelId),
      },
    },
  });

  const countsById = entityCounts.reduce<Record<string, number>>(
    (acc, entityCount) => ({
      ...acc,
      [entityCount.modelId]: entityCount._count,
    }),
    {},
  );
  return (
    <Table>
      <tbody>
        {models.map((model) => (
          <tr key={model.id}>
            <Cell as="th" scope="row">
              {model.name}
            </Cell>
            <Cell className="w-full">{countsById[model.id] || 0}</Cell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

import React from "react";

import { JSONSchema7 } from "json-schema";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import prisma from "@/lib/prisma";
import { Head, Rows } from "@/components/structure-table";
import { EditingProvider } from "@/components/structure-table/editing-context";
import {
  ModelProvider,
  StructureTableProvider,
} from "@/components/structure-table/context";
import { getModelVersionSchema } from "@/components/structure-table/actions";
import getCurrentAdminUser from "@/lib/getAdminUser";

export const WorkspaceModelEdit = async ({ modelId }: { modelId: string }) => {
  const { tenantId } = await getCurrentAdminUser();

  const version = await prisma.modelVersion.findFirst({
    where: {
      modelId,
      tenantId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      schema: true,
    },
  });

  if (!version?.schema.schema) {
    return <div>Error. Could not find schema for this data model.</div>;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["model", modelId],
    queryFn: () => getModelVersionSchema(modelId),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="min-h-700 w-full">
      <EditingProvider>
        <HydrationBoundary state={dehydratedState}>
          <ModelProvider
            modelId={modelId}
            schema={version.schema.schema as JSONSchema7}
          >
            <StructureTableProvider modelId={modelId}>
              <div className="w-full">
                <table
                  data-testid="model-edit-grid"
                  className="min-w-full border-separate border-spacing-0 mb-8 table-fixed"
                >
                  <Head />
                  <Rows />
                </table>
              </div>
            </StructureTableProvider>
          </ModelProvider>
        </HydrationBoundary>
      </EditingProvider>
    </div>
  );
};

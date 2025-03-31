import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { getWorkspaceDocumentWithEntityView } from "@/app/workspaces/[id]/[workspaceDocument]/actions";

import { DataViewDialog, DataViewDialogProvider, ListOfTables } from "./client";
import { DataContextProvider } from "./data-context";

type ServerDataViewProps = {
  tenantId: string;
  documentId: string;
};

export const ServerDataView = async ({
  tenantId,
  documentId,
}: ServerDataViewProps) => {
  const entityModel = await getWorkspaceDocumentWithEntityView(
    tenantId,
    documentId,
  );

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["getWorkspaceDocumentWithEntityView", tenantId, documentId],
    queryFn: () => entityModel,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <DataContextProvider tenantId={tenantId} documentId={documentId}>
        <DataViewDialogProvider>
          <ListOfTables />
          <DataViewDialog />
        </DataViewDialogProvider>
      </DataContextProvider>
    </HydrationBoundary>
  );
};

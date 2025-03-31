import { Suspense, memo } from "react";
import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { AppProvider } from "@/components/entity-view/store";
import { ServerDataView } from "@/components/entity-view/server";

import { DocumentView } from "./client";
import { getWorkspaceDocument } from "./actions";
import DataViewSkeleton from "./data-view-skeleton";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default memo(async function Page({ params }: any) {
  const { tenantId } = await getCurrentSessionUser();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  const document = await getWorkspaceDocument(
    tenantId,
    params.workspaceDocument,
  );

  if (!document) {
    return redirect(`/workspaces/${params.id}`);
  }

  await queryClient.prefetchQuery({
    queryKey: ["getWorkspaceDocument", tenantId, params.workspaceDocument],
    queryFn: () => document,
  });

  const dehydratedState = dehydrate(queryClient);

  const [job] = document.workspaceDocument.dataExtractionJobs ?? [];
  const app = job?.modelVersion.appVersionModelVersion?.appVersion.app;

  return (
    <HydrationBoundary state={dehydratedState}>
      <DocumentView
        tenantId={tenantId}
        workspaceDocumentId={params.workspaceDocument}
      >
        <Suspense fallback={<DataViewSkeleton />}>
          <AppProvider tenantId={tenantId} app={app}>
            <ServerDataView
              tenantId={tenantId}
              documentId={document.workspaceDocument.id}
            />
          </AppProvider>
        </Suspense>
      </DocumentView>
    </HydrationBoundary>
  );
});

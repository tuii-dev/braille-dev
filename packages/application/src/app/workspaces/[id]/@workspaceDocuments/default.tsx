import { redirect } from "next/navigation";

import { WorkspaceDocuments } from "@/app/workspaces/[id]/@workspaceDocuments/(components)";
import { fetchWorkspace } from "@/app/_helpers/workspace-docs";
import { ProgressProvider } from "@/components/client";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function Page({ params, searchParams }: any) {
  const page = searchParams?.page
    ? isNaN(parseInt(searchParams.page))
      ? 1
      : parseInt(searchParams.page) > 0
        ? parseInt(searchParams.page)
        : 1
    : 1;

  const pageSize = searchParams?.pageSize
    ? parseInt(searchParams.pageSize)
    : 20;

  const search = searchParams?.search || "";

  const from = "";
  const to = "";
  const uploader = "";

  const initialWorkspace = await fetchWorkspace(
    params,
    page,
    pageSize,
    search,
    from,
    to,
    uploader,
  );
  const { workspace, docCount } = initialWorkspace;

  if (!workspace) {
    return redirect("/workspaces");
  }

  const pageCount = Math.ceil(docCount / pageSize);
  const pageMax = Math.max(pageCount, page);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: [
      "documents",
      workspace.id,
      page,
      pageSize,
      search,
      from,
      to,
      uploader,
    ],
    queryFn: () =>
      fetchWorkspace(params, page, pageSize, search, from, to, uploader),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <WorkspaceDocuments
        workspaceId={workspace.id}
        initialWorkspace={initialWorkspace}
        initialPageSize={pageSize}
        initialPage={page}
        initialPageMax={pageMax}
      />
    </HydrationBoundary>
  );
}

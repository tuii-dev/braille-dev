"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  fetchWorkspaceDocuments,
  fetchAdjacentWorkspaceDocuments,
} from "../workspace-docs";

export function useWorkspaceDocuments({
  params,
  page = 1,
  pageSize = 20,
  search = "",
  from = "",
  to = "",
  uploader = "",
  searchType = "all" as const,
  currentDocumentId,
}: {
  params: any;
  page?: number;
  pageSize?: number;
  search?: string;
  from?: string;
  to?: string;
  uploader?: string;
  searchType: "all" | "adjacent";
  currentDocumentId?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const queryKey = [
    "workspace-documents",
    params.id,
    {
      searchType,
      page,
      pageSize,
      search,
      from,
      to,
      uploader,
      currentDocumentId,
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      if (searchType === "adjacent" && currentDocumentId) {
        return fetchAdjacentWorkspaceDocuments(
          params,
          currentDocumentId,
          search,
          from,
          to,
          uploader,
        );
      }
      return fetchWorkspaceDocuments({
        params,
        page,
        pageSize,
        search,
        from,
        to,
        uploader,
        searchType,
        currentDocumentId,
      });
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // For adjacent document navigation
  useEffect(() => {
    if (searchType === "adjacent" && data) {
      const navigation = data as { prev: any; next: any };

      if (navigation.prev) {
        router.prefetch(`/workspaces/${params.id}/${navigation.prev.id}`);
      }

      if (navigation.next) {
        router.prefetch(`/workspaces/${params.id}/${navigation.next.id}`);
      }
    }
  }, [data, router, params.id, searchType]);

  const navigateToDocument = (documentId: string) => {
    router.push(`/workspaces/${params.id}/${documentId}`);
  };

  return {
    data,
    isLoading,
    navigateToDocument,
  };
}

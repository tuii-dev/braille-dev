"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { memo, useEffect } from "react";

const Feed = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const sse = new EventSource("/api/subscribe");

    const handler = (e: MessageEvent<any>) => {
      const data = JSON.parse(e.data);

      if (data.subject !== "connection") {
        /**
         * Purge the cache for the workspace document and the documents list
         */
        if (data.workspaceDocumentId) {
          queryClient.invalidateQueries({
            queryKey: [
              "getWorkspaceDocument",
              data.tenantId,
              data.workspaceDocumentId,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "getWorkspaceDocumentWithEntityView",
              data.tenantId,
              data.workspaceDocumentId,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["documents"],
          });
        } else {
          queryClient.invalidateQueries();
        }
      }
    };

    sse.addEventListener("message", handler);

    sse.addEventListener("error", (e) => {
      sse.close();
    });

    return () => {
      sse.close();
    };
  }, [router, queryClient]);

  return null;
};

export const ServerEventsFeed = memo(Feed);

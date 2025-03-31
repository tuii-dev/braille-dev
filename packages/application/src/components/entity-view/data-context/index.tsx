"use client";

import React, { useCallback, useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useProgress } from "@/components/client";
import { getWorkspaceDocumentWithEntityView } from "@/app/workspaces/[id]/[workspaceDocument]/actions";

import { EXTRACTED_DATA_QUERY } from "../constants";
import { updateExtractedData } from "../actions";
import { DataContext } from "./context";
import { Operation } from "fast-json-patch";
import {
  EntityNodeDefinitionType,
  EntityNodeValueType,
} from "@/lib/model/entities";

export const DataContextProvider = ({
  tenantId,
  documentId,
  children,
}: {
  tenantId: string;
  documentId: string;
  children: React.ReactNode;
}) => {
  const { monitorProgress } = useProgress();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => [EXTRACTED_DATA_QUERY, tenantId, documentId],
    [tenantId, documentId],
  );

  const { data, isLoading } = useQuery<
    Awaited<ReturnType<typeof getWorkspaceDocumentWithEntityView>>
  >({
    queryKey,
    queryFn: monitorProgress(() =>
      getWorkspaceDocumentWithEntityView(tenantId, documentId),
    ),
  });

  const id = data?.id;

  const invalidateData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [EXTRACTED_DATA_QUERY] });
  }, [queryClient]);

  const mutate = useCallback(
    (patch: Operation) => {
      if (!id) {
        throw new Error("Cannot mutate without an id");
      }

      return updateExtractedData(id, patch);
    },
    [id],
  );

  const { nodes, nodeValues } = data ?? { nodes: [], nodeValues: [] };

  const definitionStore = useMemo(
    () =>
      new Map<string, EntityNodeDefinitionType>(nodes.map((d) => [d.path, d])),
    [nodes],
  );

  const valueStore = useMemo(
    () =>
      new Map<string, EntityNodeValueType>(nodeValues.map((v) => [v.path, v])),
    [nodeValues],
  );

  return (
    <DataContext.Provider
      value={useMemo(
        () => ({
          id,
          data,
          definitionStore,
          valueStore,
          isLoading,
          invalidateData,
          mutate,
        }),
        [
          id,
          invalidateData,
          data,
          definitionStore,
          valueStore,
          isLoading,
          mutate,
        ],
      )}
    >
      {children}
    </DataContext.Provider>
  );
};

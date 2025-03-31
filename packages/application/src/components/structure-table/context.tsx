"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { JSONSchema7 } from "json-schema";

import { useQuery } from "@tanstack/react-query";

import { FieldDataTypeEnum } from "@jptr/braille-prisma";

import { EntityNodeDefinition, ModelTree } from "@/lib/model/entities";

import { ColumnSchema } from "./types";
import { createSchema } from "./table-schema";
import { getModelVersionSchema } from "./actions";

const ModelContext = createContext<{
  modelId: string;
  schema: JSONSchema7;
  nodes: Map<string, EntityNodeDefinition>;
} | null>(null);

export const ModelProvider = ({
  modelId,
  schema,
  children,
}: {
  modelId: string;
  schema: JSONSchema7;
  children: React.ReactNode;
}) => {
  const { data } = useQuery({
    queryKey: ["model", modelId],
    queryFn: () => getModelVersionSchema(modelId),
  });

  const nodes = data
    ? new Map([...new ModelTree(data).nodes.values()].map((n) => [n.path, n]))
    : new Map();

  return (
    <ModelContext.Provider
      value={{
        modelId,
        schema,
        nodes,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};

export type State = {
  expandedLists: Set<string>;
};

const StructureTableContext = createContext<{
  nodes: Map<string, EntityNodeDefinition>;
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  tableSchema: Map<string, ColumnSchema>;
}>({
  nodes: new Map(),
  state: {
    expandedLists: new Set(),
  },
  setState: (state) => state,
  tableSchema: new Map(),
});

export const StructureTableProvider = ({
  modelId,
  children,
}: {
  modelId: string;
  children: React.ReactNode;
}) => {
  const tableSchema = useMemo(() => createSchema(modelId), [modelId]);

  const { nodes } = useModel();
  const [state, setState] = useState<State>({
    expandedLists: new Set(
      Array.from(nodes.values())
        .filter(
          (node) =>
            node.dataType === FieldDataTypeEnum.ARRAY ||
            node.dataType === FieldDataTypeEnum.OBJECT,
        )
        .map((node) => node.path),
    ),
  });

  return (
    <StructureTableContext.Provider
      value={{
        nodes,
        state,
        setState,
        tableSchema,
      }}
    >
      {children}
    </StructureTableContext.Provider>
  );
};

export const useStructureTable = () => {
  return useContext(StructureTableContext);
};

const DepthContext = createContext<number>(0);

export const useDepth = () => {
  return useContext(DepthContext);
};

export const DepthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DepthContext.Provider value={useDepth() + 1}>
      {children}
    </DepthContext.Provider>
  );
};

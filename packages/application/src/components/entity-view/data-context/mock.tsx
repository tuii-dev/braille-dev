import { useMemo } from "react";
import { JSONSchema7 } from "json-schema";

import {
  EntityModel,
  EntityNodeDefinitionType,
  EntityNodeValueType,
} from "@/lib/model/entities";

import { DataContext } from "./context";

export const MockDataContext = ({
  data,
  schema,
  isLoading,
  children,
}: {
  data: any;
  schema: JSONSchema7;
  isLoading: boolean;
  children?: React.ReactNode;
}) => {
  const model = new EntityModel(data, schema, {}).toJSON();

  const { nodes, nodeValues } = model ?? { nodes: [], nodeValues: [] };

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
      value={{
        id: undefined,
        data: model,
        definitionStore,
        valueStore,
        isLoading,
        invalidateData: () => {},
        mutate: () => Promise.resolve(),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

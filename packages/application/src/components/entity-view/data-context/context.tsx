import { createContext, useContext } from "react";
import {
  EntityModelType,
  EntityNodeDefinitionType,
  EntityNodeValueType,
} from "@/lib/model/entities";
import { Operation } from "fast-json-patch";

export const DataContext = createContext<{
  id: string | undefined;
  data: EntityModelType | null | undefined;
  definitionStore: Map<string, EntityNodeDefinitionType>;
  valueStore: Map<string, EntityNodeValueType>;
  invalidateData: () => void;
  isLoading: boolean;
  mutate: (patch: Operation) => Promise<any> | void;
} | null>(null);

export const useDataContext = () => {
  const value = useContext(DataContext);
  if (!value) throw new Error("DataContextProvider not found");
  return value;
};

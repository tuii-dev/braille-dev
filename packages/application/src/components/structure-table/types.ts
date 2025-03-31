import { EntityNodeDefinition } from "@/lib/model/entities";

export type ColumnSchema = {
  label: string;
  name: string;
  width: number;
  srOnly?: boolean;
  render?: {
    cell?: ({ node }: { node: EntityNodeDefinition }) => React.ReactNode;
    insert?: ({
      parent,
      onInsert,
      cancel,
    }: {
      parent: EntityNodeDefinition;
      onInsert: () => void;
      cancel: () => void;
    }) => React.ReactNode;
  };
};

import { EntityNodeDefinitionType } from "@/lib/model/entities";
import { FieldDataTypeEnum } from "@jptr/braille-prisma";

type DefinitionStore = Map<string, EntityNodeDefinitionType>;

export const getTopLevelTables = (
  nodes: EntityNodeDefinitionType[],
  definitionStore: DefinitionStore,
  path: string,
) => {
  const parentDefinitions = nodes.filter((node) => node.path === path);

  const parentDefinitionsWithPrimitives = parentDefinitions.filter(
    (definition) =>
      definition.children.some(
        (child) =>
          definitionStore.get(child)!.dataType !== FieldDataTypeEnum.OBJECT &&
          definitionStore.get(child)!.dataType !== FieldDataTypeEnum.ARRAY,
      ),
  );

  return parentDefinitions.reduce<EntityNodeDefinitionType[]>(
    (acc, node) => {
      for (const child of node.children.map((n) => definitionStore.get(n)!)) {
        if (
          child.dataType === FieldDataTypeEnum.ARRAY ||
          child.dataType === FieldDataTypeEnum.OBJECT
        ) {
          acc.push(child);
        }
      }

      return acc;
    },
    [...parentDefinitionsWithPrimitives],
  );
};

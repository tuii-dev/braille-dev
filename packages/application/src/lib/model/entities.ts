import { JSONSchema7, JSONSchema7Type } from "json-schema";
import Handlebars from "handlebars";
import pointer from "json-pointer";

import { FieldDataTypeEnum } from "@jptr/braille-prisma";
import { EntityStore } from "@/lib/entity-store";

import { FieldDataType, determineSchemaDataType } from "./ui";

/**
 * NODE DEFINITION
 */

export type EntityNodeDefinitionType = {
  path: string;
  parent: string | undefined;
  children: string[];
  values: EntityNodeValueType[];
  dataType: FieldDataType;
  schema: {
    title?: string;
    type?: string;
    format?: string;
    description?: string;
    enum?: JSONSchema7Type[];
  };
};

export class EntityNodeDefinition {
  public dataType: FieldDataType;
  public parent?: EntityNodeDefinition;
  public children: Set<EntityNodeDefinition> = new Set();
  public values: Set<EntityNodeValue> = new Set();

  constructor(
    public readonly schema: JSONSchema7,
    private readonly pathFragment: string = "",
  ) {
    this.dataType = determineSchemaDataType(schema);
  }

  public addChild(definition: EntityNodeDefinition) {
    this.children.add(definition);
    definition.parent = this;
  }

  public addValue(value: EntityNodeValue) {
    this.values.add(value);
  }

  public get path(): string {
    if (this.parent) {
      return this.parent.path + this.pathFragment;
    }
    return this.pathFragment;
  }

  toJSON(): EntityNodeDefinitionType {
    return {
      path: this.path,
      parent: this.parent?.path,
      children: Array.from(this.children.values()).map((v) => v.path),
      values: Array.from(this.values.values()).map((v) => v.toJSON()),
      dataType: this.dataType,
      schema: {
        format: this.schema.format,
        title: this.schema.title,
        enum: this.schema.enum,
        description: this.schema.description,
        type:
          typeof this.schema.type === "string" ? this.schema.type : undefined,
      },
    };
  }
}

/**
 * NODE VALUES
 */

type EntityOptionView = {
  label: string;
  sublabel?: string;
  value: string;
};

export type EntityNodeValueType = {
  path: string;
  parent: string | undefined;
  isEntity: boolean;
  entity: object | undefined;
  entityId: string | undefined;
  entityModelId: string | undefined;
  children: string[];
  definition: EntityNodeDefinitionType;
  value?: any;
  views: {
    option?: EntityOptionView;
  };
};

export class EntityNodeValue {
  public isEntity: boolean;

  public entityId?: string;
  public entity?: any;
  public entiyModelId?: string;

  public parent?: EntityNodeValue;
  public children: Map<string, EntityNodeValue> = new Map();
  public views: Record<string, any> = {};

  constructor(
    public readonly entityModelIds: Record<string, string>,
    public readonly definition: EntityNodeDefinition,
    public value: any,
    private readonly pathFragment: string = "/",
    public readonly appSchema?: any,
  ) {
    this.isEntity =
      "x-foreign-key" in definition.schema &&
      !!definition.schema["x-foreign-key"];
  }

  get path(): string {
    if (this.parent) {
      return this.parent.path + this.pathFragment;
    }
    return this.pathFragment;
  }

  get foreignKey() {
    return (this.definition.schema as any)["x-foreign-key"];
  }

  get entityType() {
    if (!this.foreignKey) {
      return;
    }
    const [entityType] = this.foreignKey.split(".");
    return entityType;
  }

  get entityModelId() {
    if (!this.entityType) {
      return;
    }
    return this.entityModelIds[this.entityType];
  }

  public async loadEntity(tenantId: string) {
    if (this.entity) {
      return this.entity;
    }

    if (!this.isEntity) {
      return;
    }

    if (!this.foreignKey) {
      return;
    }

    const store = EntityStore.init();

    const entityId = this.value
      ? `${tenantId}:${this.entityModelId}:${this.value}`
      : undefined;
    this.entityId = entityId;

    const entity = this.entityId
      ? await store.getEntityData(tenantId, this.entityId)
      : undefined;

    this.entity = entity;

    if (!this.entity) {
      return entity;
    }

    await this.loadViews();

    return entity;
  }

  public addChild(nodeValue: EntityNodeValue) {
    this.children.set(nodeValue.path, nodeValue);
    nodeValue.parent = this;
  }

  public async loadViews() {
    const foreignKey = (this.definition.schema as any)["x-foreign-key"];
    if (!foreignKey) {
      return;
    }

    const [entityType] = foreignKey.split(".");

    const getEntityTypeSchema = (entityType: string) => {
      return (this.appSchema as any)["x-braille"].entities[entityType].schema;
    };

    const templates =
      getEntityTypeSchema(entityType)["x-braille-ui"]?.templates?.["Option"];

    const option: Record<string, string | object> = {};

    if (templates) {
      for (const [key, src] of Object.entries<string>(templates)) {
        try {
          const template = Handlebars.compile(src, { noEscape: true });
          const value = template(this.entity);
          option[key] = value;
        } catch (err) {
          console.error(err);
        }
      }
    }

    this.views.option = option;
  }

  toJSON(): EntityNodeValueType {
    return {
      path: this.path,
      parent: this.parent?.path,
      entity: this.entity,
      entityModelId: this.entityModelId,
      isEntity: this.isEntity,
      definition: this.definition.toJSON(),
      entityId: this.entityId,
      value: this.value,
      children: Array.from(this.children.values()).map((v) => v.path),
      views: this.views,
    };
  }
}

const querySchema = (schema: JSONSchema7, path: string) => {
  const expression: string[] = pointer.parse(path);

  return expression.reduce<JSONSchema7>((acc, v) => {
    const s = acc.properties?.[v];

    if (typeof s === "boolean") {
      throw new Error(`Unhandled schema query ${JSON.stringify(v)}`);
    }

    if (!s) {
      throw new Error("Invalid schema");
    }

    return s;
  }, schema);
};

/**
 * MODEL
 */

export class ModelTree {
  public nodes: Set<EntityNodeDefinition> = new Set<EntityNodeDefinition>();

  constructor(private schema: JSONSchema7) {
    this.walk(this.schema, "");
  }

  private storeDefinition(
    schema: JSONSchema7,
    pathFragment?: string,
  ): EntityNodeDefinition {
    const definition = new EntityNodeDefinition(schema, pathFragment);
    this.nodes.add(definition);
    return definition;
  }

  private walk(schema: JSONSchema7, path: string): EntityNodeDefinition {
    if (
      typeof schema === "object" &&
      "allOf" in schema &&
      Array.isArray(schema.allOf)
    ) {
      return this.walk(mergeAllOf(schema), path);
    }
    const definition = this.storeDefinition(schema, path);

    if (definition.dataType === FieldDataTypeEnum.OBJECT) {
      if ("x-braille-ui" in schema && (schema["x-braille-ui"] as any)?.fields) {
        for (const field of (schema["x-braille-ui"] as any).fields) {
          const path = field.path;
          const s = querySchema(schema, path);

          const childDefinition = this.walk(s, path);
          definition.addChild(childDefinition);
        }
      } else if ("properties" in schema && schema.properties) {
        for (const [key, s] of Object.entries(schema.properties)) {
          if (typeof s !== "boolean") {
            const childDefinition = this.walk(s, `/properties/${key}`);
            definition.addChild(childDefinition);
          }
        }
      }
    }

    if (
      definition.dataType === FieldDataTypeEnum.ARRAY &&
      schema.items &&
      !Array.isArray(schema.items) &&
      typeof schema.items === "object"
    ) {
      if ("properties" in schema.items && schema.items.properties) {
        for (const [key, s] of Object.entries(schema.items.properties)) {
          if (typeof s !== "boolean") {
            const childDefinition = this.walk(s, `/items/properties/${key}`);
            definition.addChild(childDefinition);
          }
        }
      }
    }

    return definition;
  }

  toJSON(): Pick<EntityModelType, "nodes"> {
    return {
      nodes: Array.from(this.nodes.values()).map((v) => v.toJSON()),
    };
  }
}

const mergeAllOf = (schema: JSONSchema7) => {
  const { allOf, ...rest } = schema;

  if (!allOf) {
    return schema;
  }

  return allOf.reduce<JSONSchema7>((acc, v) => {
    if (typeof v === "object" && v !== null && "properties" in v) {
      return {
        ...acc,
        ...v,
        properties: acc.properties
          ? { ...acc.properties, ...v.properties }
          : v.properties,
      };
    }

    return acc;
  }, rest);
};

export class EntityModel {
  public nodes = new Set<EntityNodeDefinition>();
  public nodeValues: Set<EntityNodeValue> = new Set<EntityNodeValue>();
  public entities: Map<string, any> = new Map<string, any>();

  constructor(
    private data: unknown,
    private schema: JSONSchema7,
    private entityModelIds: Record<string, string>,
    private appSchema?: JSONSchema7,
  ) {
    if (this.data) {
      this.walk(this.data, this.schema, "");
    }
  }

  private storeDefinition(
    schema: JSONSchema7,
    path: string,
  ): EntityNodeDefinition {
    const definition = new EntityNodeDefinition(schema, path);
    this.nodes.add(definition);
    return definition;
  }

  private storeValue(
    definition: EntityNodeDefinition,
    value: any,
    path: string,
  ): EntityNodeValue {
    const nodeValue = new EntityNodeValue(
      this.entityModelIds,
      definition,
      value,
      path,
      this.appSchema,
    );

    this.nodeValues.add(nodeValue);

    return nodeValue;
  }

  toJSON(): EntityModelType {
    return {
      data: this.data,
      nodes: Array.from(this.nodes.values()).map((v) => v.toJSON()),
      nodeValues: Array.from(this.nodeValues.values()).map((v) => v.toJSON()),
      entities: Array.from(this.entities.values()).map((v) => v.toJSON()),
    };
  }

  async loadEntities(tenantId: string) {
    const entityNodeValues = Array.from(this.nodeValues.values()).filter(
      (v) => v.isEntity,
    );

    await Promise.all(entityNodeValues.map((v) => v.loadEntity(tenantId)));

    return this;
  }

  private walk(
    data: unknown,
    schema: JSONSchema7,
    path: string,
  ): { nodeValue: EntityNodeValue; definition: EntityNodeDefinition } {
    if ("allOf" in schema && Array.isArray(schema.allOf)) {
      return this.walk(data, mergeAllOf(schema), path);
    }

    const definition = this.storeDefinition(schema, path);
    const nodeValue = this.storeValue(definition, data, path);

    if (definition.dataType === FieldDataTypeEnum.OBJECT) {
      if ("x-braille-ui" in schema && (schema["x-braille-ui"] as any)?.fields) {
        for (const field of (schema["x-braille-ui"] as any).fields) {
          const path = field.path;
          const value =
            data && pointer.has(data, path)
              ? pointer.get(data, path)
              : undefined;

          const s = querySchema(schema, path);

          const { nodeValue: childNodeValue, definition: childDefinition } =
            this.walk(value, s, path);

          nodeValue.addChild(childNodeValue);
          definition.addChild(childDefinition);
          definition.addValue(childNodeValue);
        }
      } else if ("properties" in schema && schema.properties) {
        for (const [key, s] of Object.entries(schema.properties)) {
          if (!s) {
            throw new Error("Invalid schema");
          }
          if (typeof s === "boolean") {
            throw new Error(
              "Boolean values are not supported as object property values",
            );
          }

          const { nodeValue: childNodeValue, definition: childDefinition } =
            this.walk((data as any)?.[key], s, `/${key}`);

          nodeValue.addChild(childNodeValue);
          definition.addChild(childDefinition);
          definition.addValue(childNodeValue);
        }
      }
    }

    if (
      definition.dataType === FieldDataTypeEnum.ARRAY &&
      schema.items &&
      !Array.isArray(schema.items) &&
      typeof schema.items === "object"
    ) {
      for (const [index, item] of data ? (data as []).entries() : []) {
        const { nodeValue: childNodeValue, definition: childDefinition } =
          this.walk(item, schema.items, `/${index}`);

        nodeValue.addChild(childNodeValue);
        definition.addChild(childDefinition);
        definition.addValue(childNodeValue);
      }
    }

    return { nodeValue, definition };
  }
}

export type EntityModelType = {
  data: unknown;
  nodes: EntityNodeDefinitionType[];
  nodeValues: EntityNodeValueType[];
  entities: object[];
};

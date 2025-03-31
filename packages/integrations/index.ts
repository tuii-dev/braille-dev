import z from "zod";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

/**
 * MODELS
 */

const JSON_TYPE_SCHEMA_BASE = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  "x-braille-order": z.number().optional(),
  "x-braille-ui": z.undefined(),
});

const STRING_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("string"),
  enum: z.undefined(),
}).strict();

const NUMBER_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("number"),
}).strict();

const BOOLEAN_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("boolean"),
}).strict();

const ENUM_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("string"),
  format: z.undefined(),
  enum: z
    .string()
    .array()
    .nonempty("Choice field must have at least one option"),
}).strict();

const DATE_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("string"),
  format: z.enum(["date"]),
  enum: z.undefined(),
}).strict();

const CURRENCY_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("object"),
  properties: z.object({
    value: z.number(),
    currency: z.enum(["AUD"]),
  }),
}).strict();

type StringSchema = z.infer<typeof STRING_SCHEMA>;
type NumberSchema = z.infer<typeof NUMBER_SCHEMA>;
type BooleanSchema = z.infer<typeof BOOLEAN_SCHEMA>;
type EnumSchema = z.infer<typeof ENUM_SCHEMA>;
type DateSchema = z.infer<typeof DATE_SCHEMA>;
type CurrencySchema = z.infer<typeof CURRENCY_SCHEMA>;
type ArraySchema = z.infer<typeof ARRAY_SCHEMA>;

type ObjectSchema = {
  type: "object";
  properties: Record<string, AllSchemaTypes>;
};

type AllSchemaTypes =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | EnumSchema
  | DateSchema
  | CurrencySchema
  | ArraySchema
  | ObjectSchema;

const OBJECT_SCHEMA: z.ZodType<ObjectSchema> = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("object"),
  properties: z.record(
    z.string(),
    z.lazy(() => FIELD_SCHEMA_TYPE),
  ),
});

const ARRAY_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.literal("array"),
  items: OBJECT_SCHEMA,
});

const JSON_SCHEMA = JSON_TYPE_SCHEMA_BASE.extend({
  type: z.enum(["string", "number", "boolean", "object", "array"]),
  description: z.string().optional(),
  default: z.number().optional(),
});

export const FIELD_SCHEMA_TYPE = z.union([
  ENUM_SCHEMA,
  DATE_SCHEMA,
  CURRENCY_SCHEMA,
  ARRAY_SCHEMA,
  OBJECT_SCHEMA,
  BOOLEAN_SCHEMA,
  STRING_SCHEMA,
  NUMBER_SCHEMA,
]);

export const MODEL_SCHEMA_VALIDATOR = z.object({
  properties: z.record(z.string(), FIELD_SCHEMA_TYPE),
});

/**
 * ACTIONS
 */

export const ACTION_ERROR_SCHEMA = z.object({
  userMessage: z.string(),
});

export const ACTION_ERRORS_SCHEMA = z.array(ACTION_ERROR_SCHEMA);

export type ActionExecutionError = z.infer<typeof ACTION_ERROR_SCHEMA>;

export const ACTION_SCHEMA = z.object({
  key: z.enum(["list", "create"]),
  type: z.enum(["OpenAPI"]),
  operation: z.string(),
  context: z
    .object({
      entities: z.record(
        z.object({
          prompt: z.string().optional(),
          fraction: z.number().optional(),
        }),
      ),
    })
    .optional(),
  request: z.object({
    path: z.string(),
    method: z.enum(["get", "post"]),
    arguments: z
      .object({
        static: z
          .array(
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          )
          .optional(),
        computed: z
          .array(
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
  }),
  failure: z
    .object({
      errors: z.string(),
    })
    .optional(),
  response: z
    .object({
      items: z.string().optional(),
      item: z.string().optional(),
      outputs: z.record(z.unknown()).optional(),
    })
    .optional(),
  inputs: z
    .array(
      z.object({
        name: z.string(),
        schema: JSON_SCHEMA,
      }),
    )
    .optional(),
  outputs: z.record(JSON_SCHEMA).optional(),
});

export type ActionSchema = z.infer<typeof ACTION_SCHEMA>;

export const PAGINATE_BOOTSTRAP_STRATEGY = z.object({
  strategy: z.enum(["paginate"]),
  configuration: z.object({
    action: z.enum(["list"]),
    paginate: z.enum(["offset"]),
    maxPageSize: z.number(),
    paginationInputs: z.object({
      pageSize: z.string(),
      pageOffset: z.string(),
    }),
  }),
});

/**
 * APPLICATION SCHEMA
 */
export const APP_SCHEMA = z.object({
  application: z.object({
    name: z.string(),
  }),
  configuration: z.object({
    arguments: z.object({
      static: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      ),
      computed: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      ),
    }),
  }),
  ingestion: z.object({
    entities: z.array(z.string()),
    bootstrap: PAGINATE_BOOTSTRAP_STRATEGY,
  }),
  entities: z.record(
    z.object({
      schema: z.record(z.unknown()),
      actions: z.array(ACTION_SCHEMA),
      embeddings: z.array(z.string()).optional(),
    }),
  ),
});

export type AppSchema = z.infer<typeof APP_SCHEMA>;

/**
 * Take a schema and optimise it for data extraction / manipulation
 * Makes all fields nullable and adds descriptions to date fields
 */
export const optimiseSchema = <S extends JSONSchema7 | JSONSchema7Definition>(
  schema: S,
): S => {
  if (
    typeof schema === "object" &&
    "allOf" in schema &&
    Array.isArray(schema.allOf)
  ) {
    return {
      ...schema,
      allOf: schema.allOf.map(optimiseSchema),
    };
  }

  if (
    typeof schema === "object" &&
    schema.type === "object" &&
    schema.properties
  ) {
    const properties = Object.entries(schema.properties).reduce<JSONSchema7>(
      (acc, [key, value]) => {
        if (
          typeof value === "object" &&
          value.type === "string" &&
          value.format === "date"
        ) {
          return {
            ...acc,
            [key]: {
              ...value,
              nullable: true,
              description: value.description
                ? `${value.description} (in the format YYYY-MM-DD)`
                : `(in the format YYYY-MM-DD)`,
              default: null,
            },
          };
        }

        return {
          ...acc,
          [key]: optimiseSchema(value),
        };
      },
      {},
    );

    return {
      ...schema,
      properties,
    };
  }

  if (
    typeof schema === "object" &&
    schema.type === "array" &&
    schema.items &&
    Array.isArray(schema.items)
  ) {
    return {
      ...schema,
      items: schema.items.map(optimiseSchema),
    };
  }

  return schema;
};

export const formatNodeValue = ({
  value,
  schema,
}: {
  value: unknown;
  schema: JSONSchema7;
}) => {
  if (!value === null) return null;

  switch (schema.type) {
    case "boolean": {
      if (value === "true") {
        return "Yes";
      }
      if (value === "false") {
        return "No";
      }
    }

    case "string": {
      if (typeof value !== "string") return "-";

      switch (schema.format) {
        case "date":
          return new Date(value).toLocaleDateString();
        default:
          return value.trim() || "-";
      }
    }

    case "number": {
      if (typeof value === "number") {
        return String(value);
      }

      return "-";
    }
  }

  return null;
};

import { z } from "zod";
// import Ajv, { JSONSchemaType } from "ajv";
// import { JTDDataType } from "ajv/dist/jtd";
// import { JSONSchema7 } from "json-schema";
// import { jsonSchemaToZod } from "json-schema-to-zod";
// import { zodToJsonSchema } from "zod-to-json-schema";

// const ajv = new Ajv();

// const CURRENCIES = ["AUD", "CAD", "EUR", "GBP", "USD"];

export const CURRENCIES_ENUM = z.enum(["AUD", "CAD", "EUR", "GBP", "USD"]);

export const FieldDataTypeEnum = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  CURRENCY: "CURRENCY",
  DATE: "DATE",
  BOOLEAN: "BOOLEAN",
  ENUM: "ENUM",
  ARRAY: "ARRAY",
  OBJECT: "OBJECT",
  ENTITY: "ENTITY",
} as const;

export type FieldDataTypeEnumType =
  (typeof FieldDataTypeEnum)[keyof typeof FieldDataTypeEnum];

// type CurrencySchemaType = {
//   value: number;
//   currency: (typeof CURRENCIES)[number];
// };

// const currencySchema = z.object({
//   value: z.number(),
//   currency: CURRENCIES_ENUM,
// });

// const dateSchema = z.string().datetime();

// const CURRENCY_JSON_SCHEMA: JSONSchemaType<CurrencySchemaType> = {
//   type: "object",
//   properties: {
//     value: { type: "number" },
//     currency: { type: "string", enum: ["AUD", "CAD", "EUR", "GBP", "USD"] },
//   },
//   required: ["value", "currency"],
// };

// type DateSchemaType = string;

// const DATE_JSON_SCHEMA: JSONSchemaType<DateSchemaType> = {
//   type: "string",
//   format: "date",
// };

// const validateCurrencySchema =
//   ajv.compile<JTDDataType<typeof CURRENCY_JSON_SCHEMA>>(CURRENCY_JSON_SCHEMA);

// const validateDateSchema =
//   ajv.compile<JTDDataType<typeof DATE_JSON_SCHEMA>>(DATE_JSON_SCHEMA);

// export const FIELD_DATA_TYPE_VALIDATION: Record<
//   Exclude<FieldDataTypeEnumType, "OBJECT" | "ENTITY">,
//   z.ZodSchema
// > = {
//   [FieldDataTypeEnum.STRING]: z.string(),
//   [FieldDataTypeEnum.NUMBER]: z.number(),
//   [FieldDataTypeEnum.BOOLEAN]: z.boolean(),
//   [FieldDataTypeEnum.DATE]: DATE_SCHEMA,
//   [FieldDataTypeEnum.CURRENCY]: CURRENCY_SCHEMA,
//   [FieldDataTypeEnum.ARRAY]: z.array(z.any()),
//   [FieldDataTypeEnum.ENUM]: z.array(z.string()),
// };

// export const StringNumberSchema = z.string().transform((value) => {
//   const number = parseFloat(value);
//   if (isNaN(number)) {
//     throw new Error("Value must be a valid number");
//   }
//   return String(number);
// });

// export const NODE_VALUE_SCHEMA = z.discriminatedUnion("type", [
//   z.object({
//     type: z.literal(FieldDataTypeEnum.STRING),
//     value: z.string(),
//     unit: z.null(),
//   }),
//   z.object({
//     type: z.literal(FieldDataTypeEnum.NUMBER),
//     value: StringNumberSchema,
//     unit: z.null(),
//   }),
//   z.object({
//     type: z.literal(FieldDataTypeEnum.BOOLEAN),
//     value: z.union([z.literal("true"), z.literal("false")]),
//     unit: z.literal("BOOLEAN"),
//   }),
//   z.object({
//     type: z.literal(FieldDataTypeEnum.DATE),
//     value: z
//       .string()
//       .transform((value) => (value === "" ? null : value))
//       .pipe(z.string().datetime().nullable()),
//     unit: z.null(),
//   }),
//   z.object({
//     type: z.literal(FieldDataTypeEnum.CURRENCY),
//     value: StringNumberSchema,
//     unit: CURRENCIES_ENUM,
//   }),
// ]);

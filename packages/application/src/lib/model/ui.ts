import {
  Bars3BottomLeftIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  ListBulletIcon,
} from "@heroicons/react/20/solid";
import type { JSONSchema7 } from "json-schema";

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

export type FieldDataType = keyof typeof FieldDataTypeEnum;

export const DATA_TYPE_LABELS: Record<FieldDataType, string> = {
  [FieldDataTypeEnum.STRING]: "Text",
  [FieldDataTypeEnum.NUMBER]: "Number",
  [FieldDataTypeEnum.CURRENCY]: "Currency",
  [FieldDataTypeEnum.DATE]: "Date",
  [FieldDataTypeEnum.BOOLEAN]: "Yes / No",
  [FieldDataTypeEnum.ENUM]: "Choice",
  [FieldDataTypeEnum.ARRAY]: "Collection",
  [FieldDataTypeEnum.OBJECT]: "Object",
  [FieldDataTypeEnum.ENTITY]: "Entity",
};

type Icon = typeof Bars3BottomLeftIcon;

export const DATA_TYPE_ICON_MAP: Record<FieldDataType, Icon> = {
  [FieldDataTypeEnum.STRING]: Bars3BottomLeftIcon,
  [FieldDataTypeEnum.NUMBER]: CalculatorIcon,
  [FieldDataTypeEnum.CURRENCY]: CurrencyDollarIcon,
  [FieldDataTypeEnum.DATE]: CalendarDaysIcon,
  [FieldDataTypeEnum.BOOLEAN]: CheckCircleIcon,
  [FieldDataTypeEnum.ENUM]: ListBulletIcon,
  [FieldDataTypeEnum.OBJECT]: DocumentIcon,
  [FieldDataTypeEnum.ARRAY]: DocumentDuplicateIcon,
  [FieldDataTypeEnum.ENTITY]: DocumentDuplicateIcon,
};

const OPTIONS_ORDER = [
  FieldDataTypeEnum.STRING,
  FieldDataTypeEnum.NUMBER,
  FieldDataTypeEnum.CURRENCY,
  FieldDataTypeEnum.DATE,
  FieldDataTypeEnum.BOOLEAN,
  FieldDataTypeEnum.ENUM,
  FieldDataTypeEnum.ARRAY,
  FieldDataTypeEnum.OBJECT,
];

export const DATA_TYPE_OPTIONS = Object.values(FieldDataTypeEnum).reduce<
  {
    label: string;
    value: keyof typeof FieldDataTypeEnum;
    icon: Icon;
  }[]
>(
  (
    acc,
    type,
  ): Array<{
    label: string;
    value: keyof typeof FieldDataTypeEnum;
    icon: Icon;
  }> => {
    if (type === FieldDataTypeEnum.ENTITY) return acc;

    return [
      ...acc,
      {
        label: DATA_TYPE_LABELS[type],
        value: type,
        icon: DATA_TYPE_ICON_MAP[type],
      },
    ];
  },
  [],
);

const isCurrencySchema = (schema: JSONSchema7) => {
  try {
    if (schema.properties) {
      return (
        (schema.properties.value as any)?.type === "number" &&
        (schema.properties.currency as any)?.type === "string" &&
        Object.keys(schema.properties).length === 2
      );
    }
  } catch (e) {
    return false;
  }
};

export function determineSchemaDataType(schema: JSONSchema7): FieldDataType {
  if (isCurrencySchema(schema)) {
    return FieldDataTypeEnum.CURRENCY;
  }

  if ("x-foreign-key" in schema) {
    return FieldDataTypeEnum.ENTITY;
  }

  switch (schema.type) {
    case "boolean":
      return FieldDataTypeEnum.BOOLEAN;
    case "array":
      return FieldDataTypeEnum.ARRAY;
    case "object":
      return FieldDataTypeEnum.OBJECT;
    case "string": {
      if (schema.format === "date") {
        return FieldDataTypeEnum.DATE;
      }
      if (schema.enum) {
        return FieldDataTypeEnum.ENUM;
      }
      return FieldDataTypeEnum.STRING;
    }
    case "number": {
      return FieldDataTypeEnum.NUMBER;
    }
  }

  throw new Error(`Unhandled datatype: ${JSON.stringify(schema)}`);
}

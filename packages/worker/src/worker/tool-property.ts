type DataTypeStringSchema = {
  type: 'string';
  description?: string | null;
};

type DataTypeEnumSchema = {
  type: 'string';
  enum: string[];
  description?: string | null;
};

type DataTypeDateSchema = {
  type: 'string';
  format: 'date';
  description?: string | null;
};

type DataTypeNumberSchema = {
  type: 'number';
  description?: string | null;
};

type DataTypeCurrencySchema = {
  type: 'object';
  description?: string | null;
  properties: {
    amount: {
      type: 'number';
      description: 'Amount of money/currency';
    };
    currency: {
      type: 'string';
      description: 'Currency';
      enum: ['AUD', 'CAD', 'EUR', 'GBP', 'USD'];
    };
  };
};

type DataTypeBooleanSchema = {
  type: 'boolean';
  description?: string | null;
};

type DataTypeObjectSchema = {
  type: 'object';
  properties: Record<string, DataTypeSchema>;
  description?: string | null;
};

type DataTypeArraySchema = {
  type: 'array';
  items: DataTypeObjectSchema;
  description?: string | null;
};

export type DataTypeSchema =
  | DataTypeStringSchema
  | DataTypeEnumSchema
  | DataTypeBooleanSchema
  | DataTypeDateSchema
  | DataTypeNumberSchema
  | DataTypeCurrencySchema
  | DataTypeArraySchema
  | DataTypeObjectSchema;

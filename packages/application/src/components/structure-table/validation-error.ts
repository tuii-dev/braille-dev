import { z } from "zod";
import { FIELD_SCHEMA_TYPE } from "@jptr/braille-integrations";

export class ValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateField(
  field: unknown,
): z.infer<typeof FIELD_SCHEMA_TYPE> {
  const result = FIELD_SCHEMA_TYPE.safeParse(field);
  if (result.error) {
    console.error(result.error);
    throw new ValidationError(result.error.errors[0].message);
  }
  return result.data;
}

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Factory } from '@app/common/shared/classes/instance-factory';
import {
  ValidateBy,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidJsonSchema(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isValidJsonSchema',
      validator: {
        validate: (value: any) => {
          try {
            const ajv = Factory.create('ajv');
            ajv!.compile(JSON.parse(value));
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage: (validationArguments: ValidationArguments) => {
          return `${validationArguments.property} must be a valid JSON schema`;
        },
      },
    },
    validationOptions,
  );
}

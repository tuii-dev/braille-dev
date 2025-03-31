// import { FieldDataTypeEnum } from '@jptr/braille-prisma';
// import { JSONSchema7 } from 'json-schema';

// class JSONSchemaNode {
//   public children: readonly JSONSchemaNode[] = [];

//   constructor(private schema: JSONSchema7) {
//     this.children = this.getChildren();
//   }

//   get type(): FieldDataTypeEnum {
//     switch (this.schema.type) {
//       case 'array':
//         return FieldDataTypeEnum.ARRAY;
//       case 'boolean':
//         return FieldDataTypeEnum.BOOLEAN;
//       case 'number':
//       case 'integer':
//         return FieldDataTypeEnum.NUMBER;
//       case 'object':
//         return FieldDataTypeEnum.OBJECT;
//       case 'string':
//         return FieldDataTypeEnum.STRING;
//     }

//     throw new Error(`Unhandled schema type: ${this.schema.type}`);
//   }

//   getChildren(): JSONSchemaNode[] {
//     switch (this.schema.type) {
//       case 'array':
//         return [new JSONSchemaNode(this.schema.items as JSONSchema7)];
//       case 'object':
//         if (
//           typeof this.schema.properties === 'object' &&
//           this.schema.properties !== null
//         ) {
//           return Object.values(this.schema.properties)
//             .filter(Boolean)
//             .map((value) => new JSONSchemaNode(value as JSONSchema7));
//         }
//         return [];
//       case 'string':
//       case 'number':
//       case 'boolean':
//       case 'null':
//         return [];
//     }
//     throw new Error(`Unhandled schema type: ${this.schema.type}`);
//   }
// }

// export class JSONSchemaModel {
//   private tree: JSONSchemaNode;

//   constructor(schema: JSONSchema7) {
//     this.tree = new JSONSchemaNode(schema);
//   }
// }

export default {};

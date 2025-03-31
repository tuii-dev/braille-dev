// import { Node, Definition, FieldDataTypeEnum } from '@jptr/braille-prisma';

// type NodeWithDefinition = Node & { definition: Definition };

// export class JSONNodeTreeTransformer {
//   constructor(
//     private obj: any,
//     private nodes: NodeWithDefinition[],
//     private treeId: string,
//   ) {}

//   private stringifyValue(
//     node: NodeWithDefinition,
//     value: unknown,
//   ): { value: string | null; unit?: string } {
//     if (!value) {
//       return { value: null };
//     }

//     if (node.definition.type === 'CURRENCY') {
//       const { amount, currency } = value as {
//         amount: number;
//         currency: string;
//       };
//       return { value: String(amount), unit: `CURRENCY:${currency}` };
//     }

//     if (typeof value === 'number') {
//       return { value: String(value), unit: 'NUMBER' };
//     }

//     if (typeof value === 'string') {
//       return { value };
//     }

//     if (typeof value === 'boolean') {
//       return { value: value ? 'true' : 'false', unit: 'BOOLEAN' };
//     }

//     return { value: JSON.stringify(value), unit: 'JSON' };
//   }

//   private convertValue(
//     node: NodeWithDefinition,
//     value: unknown,
//     id: string,
//     parentNodeValueId?: string,
//   ) {
//     return {
//       id,
//       parentNodeValueId,
//       tenantId: node.definition.tenantId,
//       definitionId: node.definition.id,
//       nodeId: node.id,
//       ...this.stringifyValue(node, value),
//     };
//   }

//   private valuesFromArray(
//     parentNodeValueId: string,
//     array: Record<string, unknown>[],
//     arrayNode: NodeWithDefinition,
//   ) {
//     return array.reduce((acc, obj, idx) => {
//       const arrayItemId = `${parentNodeValueId}[${idx}]`;

//       return [
//         ...acc,
//         {
//           id: arrayItemId,
//           tenantId: arrayNode.definition.tenantId,
//           definitionId: arrayNode.definition.id,
//           value: `ARRAY[${idx}]`,
//           nodeId: arrayNode.id,
//         },
//         ...this.valuesFromEntries(obj, arrayItemId, arrayNode),
//       ];
//     }, []);
//   }

//   private getRootNodes() {
//     return this.nodes.filter((node) => !node.parentId);
//   }

//   private getChildNodes(nodeId: string) {
//     return this.nodes.filter((node) => {
//       return node.parentId === nodeId;
//     });
//   }

//   private valuesFromObject(
//     parentNodeValueId: string,
//     object: Record<string, unknown>,
//     node: NodeWithDefinition,
//   ) {
//     const objectNodeValueId = `${parentNodeValueId}[${node.id}]`;

//     const objectNodeValue = {
//       id: objectNodeValueId,
//       tenantId: node.definition.tenantId,
//       definitionId: node.definition.id,
//       value: `OBJECT`,
//       nodeId: node.id,
//     };

//     if (typeof object === 'object' && object !== null) {
//       return [
//         objectNodeValue,
//         ...this.valuesFromEntries(object, objectNodeValueId, node),
//       ];
//     }

//     return [objectNodeValue];
//   }

//   private valuesFromEntries(
//     obj: Record<string, unknown>,
//     parentNodeValueId?: string,
//     parentNode?: NodeWithDefinition,
//   ) {
//     const currentNodes = parentNode
//       ? this.getChildNodes(parentNode.id)
//       : this.getRootNodes();

//     return currentNodes.reduce((acc, node, i) => {
//       const value = obj[node.id];

//       if (node.definition.type === FieldDataTypeEnum.ARRAY) {
//         const parentId = `${this.treeId}.${node.definitionId}[${i}]`;
//         const valueArray = Array.isArray(value) ? value : [];

//         return [...acc, ...this.valuesFromArray(parentId, valueArray, node)];
//       }

//       if (node.definition.type === FieldDataTypeEnum.OBJECT) {
//         const parentId = `${this.treeId}.${node.definitionId}`;

//         return [
//           ...acc,
//           ...this.valuesFromObject(parentId, obj[node.id] as any, node),
//         ];
//       }

//       if (node.definition.type === FieldDataTypeEnum.ENTITY) {
//         // TODO
//       }

//       if (parentNodeValueId) {
//         return [
//           ...acc,
//           this.convertValue(
//             node,
//             value,
//             `${parentNodeValueId}.${node.definitionId}`,
//             parentNodeValueId,
//           ),
//         ];
//       }

//       return [
//         ...acc,
//         this.convertValue(node, value, `${this.treeId}.${node.definitionId}`),
//       ];
//     }, []);
//   }

//   toNodeValues() {
//     return this.valuesFromEntries(this.obj);
//   }
// }

export default {};

// import {
//   Definition,
//   FieldDataTypeEnum,
//   NodeValue,
//   NodeValueChange,
// } from "@prisma/client";

// import prisma from "./prisma";

// function processNodeValue(
//   value: NodeValueWithDefinitionAndChanges,
//   nodes: NodeValueWithDefinitionAndChanges[],
// ): any {
//   if (value.definition.type === FieldDataTypeEnum.ARRAY) {
//     const childNodes = nodes.filter((v) => v.parentNodeValueId === value.id);
//     return childNodes.map((v) => processNodeValue(v, nodes));
//   }

//   const changedValue = value.changes[0];

//   if (changedValue) {
//     return parseNodeValue({ ...value, ...changedValue });
//   }

//   return parseNodeValue(value);
// }

// function parseNodeValue(value: NodeValueWithDefinition) {
//   switch (value.definition.type) {
//     case FieldDataTypeEnum.BOOLEAN: {
//       if (value.value === "true") {
//         return true;
//       }
//       if (value.value === "false") {
//         return false;
//       }
//       return null;
//     }
//     case FieldDataTypeEnum.CURRENCY:
//       return Number(value.value);
//     case FieldDataTypeEnum.NUMBER:
//       return Number(value.value);
//     case FieldDataTypeEnum.STRING:
//       return value.value;
//     default:
//       return value.value;
//   }
// }

// function definitionLabelToFieldName(label: string) {
//   return label
//     .toLowerCase()
//     .replace(/\s/g, "_")
//     .replace(/[^a-z0-9_]/g, "")
//     .replace(/^[0-9]/, "");
// }

// function valuesToJson(
//   values: NodeValueWithDefinitionAndChanges[],
//   currentNode?: NodeValueWithDefinition,
// ): any {
//   const currentLevelValues = values.filter((v) => {
//     if (currentNode) {
//       return v.parentNodeValueId === currentNode.id;
//     }
//     return v.parentNodeValueId === null;
//   });

//   return currentLevelValues.reduce<any>((acc, cur) => {
//     if (!cur.definition.name) {
//       return acc;
//     }

//     const fieldName = definitionLabelToFieldName(cur.definition.name);

//     if (cur.definition.type === FieldDataTypeEnum.ARRAY) {
//       const existing = acc[fieldName] ?? [];

//       return {
//         ...acc,
//         [fieldName]: [...existing, valuesToJson(values, cur)],
//       };
//     }

//     return {
//       ...acc,
//       [fieldName]: processNodeValue(cur, values),
//     };
//   }, {});
// }

// export const jobsDataToJSON = async (tenantId: string, jobIds: string[]) => {
//   if (jobIds.length === 0) {
//     return [];
//   }

//   const jobs = await prisma.dataExtractionJob.findMany({
//     where: {
//       tenantId,
//       id: {
//         in: jobIds,
//       },
//       status: {
//         in: ["FINISHED"],
//       },
//     },
//     include: {
//       data: {
//         where: {
//           tenantId,
//         },
//         include: {
//           values: {
//             include: {
//               definition: true,
//               changes: {
//                 where: {
//                   tenantId,
//                 },
//                 take: 1,
//                 orderBy: {
//                   createdAt: "desc",
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   return jobs.map((job) => valuesToJson(job.data?.values ?? []));
// };

export default {};

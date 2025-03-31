import { JSONSchema7 } from 'json-schema';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ useDefaults: 'empty', coerceTypes: true });
ajv.addKeyword('x-primary-key');
ajv.addVocabulary([
  'x-braille-ui',
  'x-entity',
  'x-braille-order',
  'x-foreign-key',
]);
addFormats(ajv);

export const validate = (schema: any, data: unknown) => {
  if (!ajv.validate(schema, data)) {
    console.error(ajv.errors);
    console.error(ajv.errorsText);
    throw new Error(`Data received does not conform to model schema: ${data}`);
  }
};

const nodeDescription = (node: JSONSchema7) => {
  if (node.title && node.description) {
    return `"${node.title}" (${node.description})`;
  }

  if (node.title) {
    return `"${node.title}"`;
  }

  return '';
};

export const nodePromptPart = (node: JSONSchema7, currentDepth = 0) => {
  const depth = currentDepth + 1;

  if (node.type === 'object' && node.properties) {
    const properties = Object.values(node.properties);

    if (currentDepth > 1) {
      const childProperties = properties
        .filter(Boolean)
        .map((schema) => nodePromptPart(schema as any, depth))
        .join('\n');

      const description = nodeDescription(node);

      if (description) {
        return `For the ${nodeDescription(
          node,
        )} describe its following properties:\n${childProperties}`;
      }

      return `Describe the following:\n${childProperties}`;
    }

    if (properties.length) {
      const extendedChildrenMessage =
        properties
          .filter(Boolean)
          .map((schema) => nodePromptPart(schema as any, depth))
          .join(',\n') + '?';

      if (!node.title) {
        return extendedChildrenMessage;
      }

      const childrenMessage =
        properties
          .filter(Boolean)
          .map((schema) => `- the "${(schema as any).title}"`)
          .join(',\n') + '?';

      return `Describe the ${nodeDescription(
        node,
      )} and its following properties:\n${childrenMessage}\n${extendedChildrenMessage}`;
    }

    return `Describe the ${nodeDescription(node)}.`;
  }

  if (node.type === 'array') {
    if (
      typeof node.items === 'object' &&
      !Array.isArray(node.items) &&
      typeof node.items.properties === 'object'
    ) {
      const children = Object.values(node.items.properties);

      const childrenMessage = children
        .filter(Boolean)
        .map((schema) => nodePromptPart(schema as any, depth))
        .join(',\n');

      return `What are the "${node.title}" (${
        node.description
      }) which contain a ${children
        .filter(Boolean)
        .map((child) => (child as any).title)
        .join(', ')}?\nFor each "${
        node.items.title
      }" what is:\n${childrenMessage}`;
    }
  }

  if (depth) {
    return `- the ${nodeDescription(node)}`;
  }

  return `What is the ${nodeDescription(node)}`;
};

export const llmPromptFromJSONSchema = (schema: JSONSchema7) => {
  return `Please provide me with the following information from the document:\n${nodePromptPart(
    schema,
  )}`;
};

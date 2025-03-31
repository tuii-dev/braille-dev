import OpenAI from 'openai';

class Application {
  constructor(private api: any) {}

  getEntity(entity: string) {
    return this.api['x-braille'].entities[entity];
  }

  getEntityRequestSchema(entity: string, key: 'create' | 'update') {
    const action = this.getEntity(entity).actions.find(
      (action: any) => action.key === key,
    );

    return this.api.paths[action.request.path][action.request.method];
  }
}

export class ApplicationSchemaFunctionCall {
  private app: Application;

  constructor(private api: any) {
    this.app = new Application(api);
  }

  /**
   * Extracts a map on entities related to a schema
   */
  extractEntities(schema: any, map?: Map<string, any>): Map<string, any> {
    const entities = map ?? new Map<string, any>();

    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    if ('allOf' in schema && Array.isArray(schema.allOf)) {
      const { allOf, ...rest } = schema;

      const merged = allOf.reduce((acc, v) => {
        return {
          ...acc,
          ...v,
          properties: acc.properties
            ? { ...acc.properties, ...v.properties }
            : v.properties,
        };
      }, rest);

      this.extractEntities(merged, entities);
    }

    if (schema.type === 'string' || schema.type === 'number') {
      if (schema['x-foreign-key']) {
        const entity = schema['x-foreign-key'].split('.')[0];
        entities.set(entity, this.api.components.schemas[entity]);
      }
    }

    if (schema.type === 'array') {
      this.extractEntities(schema.items, entities);
    }

    if (schema.type === 'object') {
      Object.entries(schema.properties).forEach(([, value]) => {
        this.extractEntities(value, entities);
      });
    }

    return entities;
  }

  getEntitiesMap(entity: string) {
    const key = 'create';
    const schema = this.app.getEntityRequestSchema(entity, key);

    return this.extractEntities(
      schema.requestBody.content['application/json'].schema,
    );
  }

  crawlSchema(schema: any) {
    if (Array.isArray(schema)) {
      return schema.map((v) => this.crawlSchema(v));
    }

    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    return Object.entries(schema).reduce<object>((acc, [key, value]) => {
      if (key === 'allOf' && Array.isArray(value)) {
        return {
          ...acc,
          ...(value as any[]).reduce(
            (acc, v) => ({ ...acc, ...this.crawlSchema(v) }),
            {},
          ),
        };
      }

      if (typeof value === 'object' && value !== null) {
        if (value['x-primary-key']) {
          return {
            ...acc,
          };
        }

        // if (value['x-foreign-key']) {
        //   const entity = value['x-foreign-key'].split('.')[0];

        //   return {
        //     ...acc,
        //     [key]: this.crawlSchema(this.api.components.schemas[entity]),
        //   };
        // }

        return {
          ...acc,
          [key]: this.crawlSchema(value),
        };
      }

      if (Array.isArray(value)) {
        return {
          ...acc,
          [key]: value.map((v) => this.crawlSchema(v)),
        };
      }

      return {
        ...acc,
        [key]: value,
      };
    }, {});
  }

  transformSchemaProperties(schema: any) {
    const crawled = this.crawlSchema(schema);

    return crawled.requestBody.content['application/json'].schema.properties;
  }

  toEntityExtractFunctionDefinition(entity: string) {
    const entities = this.getEntitiesMap(entity);

    const properties = Object.entries(entities).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          type: 'array',
          items: {
            type: 'object',
            properties: value,
          },
        },
      };
    }, {});

    return {
      name: 'extract_entities',
      description: 'Extract entities from the data',
      parameters: {
        type: 'object',
        title: 'entities_map',
        description: 'Map of entities to data',
        properties,
      },
    };
  }

  toFunctionDefinition(entity: string): Required<OpenAI.FunctionDefinition> {
    const key = 'create';
    const schema = this.app.getEntityRequestSchema(entity, key);
    const description = schema.summary ?? 'Create the entity';
    const properties = this.transformSchemaProperties(schema);

    return {
      name: key,
      description,
      parameters: {
        type: 'object',
        title: this.app.getEntity(entity).schema.title,
        description: this.app.getEntity(entity).schema.description,
        properties,
        required: [],
      },
    };
  }
}

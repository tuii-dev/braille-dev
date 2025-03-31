import { Test } from '@nestjs/testing';

import { APP_SCHEMA } from '@jptr/braille-integrations';
import { Prisma } from '@jptr/braille-prisma';
import { prisma } from '../src/prisma';
import { OpenAIService } from '../src/openai/openai.service';
import { VectorindexService } from '../src/vectorindex/vectorindex.service';
import { ApplicationsService } from '../src/applications/applications.service';

describe('VectorindexService', () => {
  const createEmbeddings = jest.fn();
  let service: VectorindexService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VectorindexService],
    })
      .useMocker((token) => {
        if (token === ApplicationsService) {
          return {};
        }
        if (token === OpenAIService) {
          return {
            createEmbeddings,
          };
        }
      })
      .compile();

    service = moduleRef.get(VectorindexService);

    createEmbeddings.mockImplementation((strs: string | string[]) => {
      const strings = Array.isArray(strs) ? strs : [strs];

      return {
        data: strings.map((_, i) => ({
          embedding: new Array(1536)
            .fill(null)
            .map(() => Number(((1 / strings.length) * (i + 1)).toFixed(3))),
        })),
      };
    });
  });

  const appSchema = APP_SCHEMA.parse({
    application: {
      name: 'Braille',
    },
    configuration: {
      arguments: {
        static: [],
        computed: [],
      },
    },
    ingestion: {
      entities: [],
      bootstrap: {
        strategy: 'paginate',
        configuration: {
          action: 'list',
          paginate: 'offset',
          maxPageSize: 100,
          paginationInputs: {
            pageSize: '100',
            pageOffset: '0',
          },
        },
      },
    },
    entities: {
      Customer: {
        schema: {},
        actions: [],
        embeddings: ['.name', '.address', '.name + " " + .address.street'],
      },
    },
  });

  const setup = () => {
    return prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: 'tenant',
        },
      });

      const app = await tx.app.create({
        data: {
          name: 'app',
          appPublisher: {
            create: {
              name: 'Braille',
            },
          },
          versions: {
            create: {
              schema: { 'x-braille': appSchema } as Prisma.JsonObject,
            },
          },
        },
        include: {
          versions: true,
        },
      });

      const model = await tx.model.create({
        data: {
          name: 'Customer',
          tenantId: tenant.id,
          versions: {
            create: {
              schema: {
                create: {
                  schema: {},
                },
              },
            },
          },
        },
        include: {
          versions: true,
        },
      });

      await tx.appVersionModelVersion.create({
        data: {
          appVersionId: app.versions[0].id,
          modelVersionId: model.versions[0].id,
        },
      });

      const entity = await tx.entity.create({
        data: {
          id: `Customer:${tenant.id}:1`,
          appId: app.id,
          tenantId: tenant.id,
          modelId: model.id,
          modelVersionId: model.versions[0].id,
          data: {
            name: 'John Smith',
            address: {
              street: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              zip: '62701',
            },
          },
        },
      });

      return { entity, tenant };
    });
  };

  describe('indexEntity', () => {
    describe('when the entity configuration supports embedding filters', () => {
      it('should index an entity against embedding filters', async () => {
        const { entity, tenant } = await setup();

        await service.indexEntity({
          Body: JSON.stringify({
            Message: JSON.stringify({ entityId: entity.id }),
          }),
        });

        expect(createEmbeddings).toHaveBeenCalledWith([
          '{"name":"John Smith","address":{"zip":"62701","city":"Springfield","state":"IL","street":"123 Main St"}}',
          '"John Smith"',
          '{"zip":"62701","city":"Springfield","state":"IL","street":"123 Main St"}',
          '"John Smith 123 Main St"',
        ]);

        expect(
          await prisma.$queryRaw`SELECT id, data, "tenantId", embedding::text FROM public."Entity" WHERE id = ${entity.id} AND "tenantId" = ${tenant.id}`,
        ).toStrictEqual([
          {
            id: `Customer:${tenant.id}:1`,
            tenantId: tenant.id,
            embedding: expect.stringMatching('0.25'),
            data: entity.data,
          },
        ]);

        const entityEmbeddings =
          await prisma.$queryRaw`SELECT "entityId", "embeddingId", "tenantId" FROM public."EntityEmbedding" WHERE "tenantId" = ${tenant.id}`;

        expect(entityEmbeddings).toHaveLength(3);

        expect(
          await prisma.$queryRaw`SELECT "tenantId", embedding::text FROM public."Embedding" WHERE "tenantId" = ${tenant.id}`,
        ).toStrictEqual([
          {
            tenantId: tenant.id,
            embedding: expect.stringMatching('0.5'),
          },
          {
            tenantId: tenant.id,
            embedding: expect.stringMatching('0.75'),
          },
          {
            tenantId: tenant.id,
            embedding: expect.stringMatching('1,1'),
          },
        ]);
      });
    });
  });

  describe('search', () => {
    it('should search for entities', async () => {
      const { entity, tenant } = await setup();

      await service.indexEntity({
        Body: JSON.stringify({
          Message: JSON.stringify({ entityId: entity.id }),
        }),
      });

      const results = await service.search(
        'John Smith',
        entity.modelId,
        tenant.id,
      );

      expect(results).toHaveLength(1);
      expect(results).toStrictEqual([
        {
          data: entity.data,
          id: entity.id,
          similarity: 1,
          tenantId: tenant.id,
        },
      ]);
    });
  });
});

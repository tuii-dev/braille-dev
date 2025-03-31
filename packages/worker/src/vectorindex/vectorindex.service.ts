import { Injectable } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import { VectorStore } from '@langchain/core/vectorstores';
import { Traceable } from '@amplication/opentelemetry-nestjs';
import { run } from 'node-jq';

import type { Message } from '@aws-sdk/client-sqs';
import { TextSplitter } from '@langchain/textsplitters';

import { Prisma } from '@jptr/braille-prisma';

import { Queue } from '../worker/jobs';
import { OpenAIService } from '../openai/openai.service';

import { prisma } from '../prisma';
import { BrailleLogger } from '../logger';

class JSONSplitter extends TextSplitter {
  splitText(str: string): Promise<string[]> {
    const json: unknown = JSON.parse(str);

    return Promise.resolve(this.split(json));
  }

  split(unknown: unknown): string[] {
    if (typeof unknown === 'string') {
      return [unknown];
    }
    if (Array.isArray(unknown)) {
      return this.stringsFromArray(unknown);
    }
    if (typeof unknown === 'object' && unknown !== null) {
      return this.stringsFromObject(unknown);
    }
    return [];
  }

  stringsFromArray(arr: unknown[]): string[] {
    return arr.flatMap((v) => this.split(v));
  }

  stringsFromObject(obj: object): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      if (['string', 'number', 'null'].includes(typeof value)) {
        return [`${key}:${value}`];
      }
      return this.split(value);
    });
  }
}

@Traceable()
@Injectable()
export class VectorindexService {
  private readonly logger = new BrailleLogger(VectorindexService.name);

  jsonSplitter = new JSONSplitter({
    chunkOverlap: 0,
    chunkSize: 32,
  });

  vectorStore: VectorStore;

  constructor(private openAIService: OpenAIService) {}

  private async updateEntityEmbedding(
    entityId: string,
    tenantId: string,
    embedding: number[],
    embeddings: number[][],
  ) {
    return await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`UPDATE public."Entity" SET embedding = ${embedding}::vector WHERE id = ${entityId}`;

        // DELETE EXISTING EMBEDDINGS
        const toDelete: { embeddingId: string }[] =
          await tx.$queryRaw`SELECT "embeddingId" FROM public."EntityEmbedding" WHERE "tenantId" = ${tenantId} AND "entityId" = ${entityId}`;

        if (toDelete.length) {
          await tx.$executeRaw`DELETE FROM public."EntityEmbedding" WHERE "entityId" IN (${Prisma.join(toDelete.map(({ embeddingId }) => embeddingId))})`;
          await tx.$executeRaw`DELETE FROM public."Embedding" WHERE "id" IN (${Prisma.join(toDelete.map(({ embeddingId }) => embeddingId))})`;
        }

        // INSERT NEW EMBEDDINGS
        const rows = embeddings.map((e, i) => [
          `${entityId}_${i}`,
          `[${e.join(',')}]`,
          tenantId,
        ]);

        await tx.$executeRaw`
        INSERT INTO public."Embedding" (id, embedding, "tenantId") 
        VALUES ${Prisma.join(rows.map((row) => Prisma.sql`(${row[0]},${row[1]}::vector,${row[2]})`))}`;

        // INSERT EMBEDDING JOINS
        await tx.$executeRaw`
        INSERT INTO public."EntityEmbedding" ("embeddingId", "entityId", "tenantId") 
        VALUES ${Prisma.join(
          rows.map(
            ([embeddingId]) =>
              Prisma.sql`(${embeddingId},${entityId},${tenantId})`,
          ),
        )}
      `;
      },
      { maxWait: 5000, timeout: 10000 },
    );
  }

  private async getEntity(entityId: string) {
    return await prisma.entity.findUniqueOrThrow({
      include: {
        modelVersion: {
          include: {
            model: true,
            appVersionModelVersion: {
              include: {
                appVersion: true,
              },
            },
          },
        },
      },
      where: {
        id: entityId,
      },
    });
  }

  public async vectorSearch(
    vector: number[],
    modelId: string,
    tenantId: string,
    take = 5,
  ) {
    const embedding = `[${vector.join(',')}]`;

    const results = await prisma.$queryRaw`
      SELECT
        e."id",
        e."data",
        e."tenantId",
        MAX(1 - (emb."embedding" <=> ${embedding}::vector)) as similarity
      FROM public."Entity" e
      INNER JOIN public."EntityEmbedding" ee ON e."id" = ee."entityId"
      INNER JOIN public."Embedding" emb ON ee."embeddingId" = emb."id"
      WHERE
         emb."embedding" IS NOT NULL
         AND emb."tenantId" = ${tenantId}
         AND e."tenantId" = ${tenantId}
         AND e."modelId" = ${modelId}
       GROUP BY e."id", e."data", e."tenantId"
       ORDER BY similarity DESC
       LIMIT ${take};
    `;

    // const results = await prisma.$queryRaw`
    //   SELECT
    //     id,
    //     data,
    //     "tenantId",
    //     1 - (embedding <=> ${embedding}::vector) as similarity
    //   FROM public."Entity"
    //   WHERE
    //     embedding IS NOT NULL
    //     AND "tenantId" = ${tenantId}
    //     AND "modelId" = ${modelId}
    //   ORDER BY similarity DESC
    //   LIMIT ${take};`;

    return results as {
      id: string;
      data: object;
      tenantId: string;
      similarity: number;
    }[];
  }

  public async search(
    query: string,
    modelId: string,
    tenantId: string,
    take = 5,
  ): Promise<
    { id: string; data: object; tenantId: string; similarity: number }[]
  > {
    const {
      data: [{ embedding }],
    } = await this.openAIService.createEmbeddings(query);

    return this.vectorSearch(embedding, modelId, tenantId, take);
  }

  public async retrieve(
    modelId: string,
    tenantId: string,
    take = 5,
  ): Promise<{ id: string; data: object; tenantId: string }[]> {
    return prisma.$queryRaw`
      SELECT 
        id, 
        data, 
        "tenantId"
      FROM public."Entity" 
      WHERE 
        "tenantId" = ${tenantId}
        AND "modelId" = ${modelId}
      LIMIT ${take};`;
  }

  @SqsMessageHandler(Queue.ENTITY_EMBEDDINGS_QUEUE, false)
  public async indexEntity(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }

    const body = JSON.parse(message.Body);
    const { entityId } = JSON.parse(body.Message);

    this.logger.log(`INDEXING ENTITY ${entityId}`);

    const { modelVersion, data, tenantId } = await this.getEntity(entityId);
    const entityJson = JSON.stringify(data);

    const schema = modelVersion.appVersionModelVersion?.appVersion.schema?.[
      'x-braille'
    ] as any;

    const filters: string[] =
      schema?.entities?.[modelVersion.model.name]?.embeddings ?? [];

    const strings = new Set(
      await Promise.all(
        filters.map(async (filter: string) => {
          return (
            (await run(filter, entityJson, {
              input: 'string',
              output: 'string',
            })) as string
          ).trim();
        }),
      ),
    );

    const response = await this.openAIService.createEmbeddings([
      entityJson,
      ...(!!strings.size ? strings : [entityJson]),
    ]);

    const [entityEmbedding, ...embeddings] = response.data.map(
      (r) => r.embedding,
    );

    this.logger.log(`RECEIVED EMBEDDINGS FOR ${entityId}`);

    const update = await this.updateEntityEmbedding(
      entityId,
      tenantId,
      entityEmbedding,
      embeddings,
    );

    this.logger.log(`Indexed entity ${entityId}`);

    return update;
  }

  @SqsConsumerEventHandler(Queue.ENTITY_EMBEDDINGS_QUEUE, 'processing_error')
  public onIndexError(error: Error, message: Message) {
    console.error(
      'error processing Queue.ENTITY_EMBEDDINGS_QUEUE',
      error,
      message,
    );
  }
}

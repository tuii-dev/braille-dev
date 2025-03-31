import { Message } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import {
  SqsConsumerEventHandler,
  SqsMessageHandler,
  SqsService,
} from '@ssut/nestjs-sqs';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { DataExtractionJob, Prisma } from '@jptr/braille-prisma';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import Redis from 'ioredis';
import OpenAI from 'openai';

import { encoding_for_model } from 'tiktoken';
import { JSONSchema7 } from 'json-schema';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
  BaseRetriever,
  type BaseRetrieverInput,
} from '@langchain/core/retrievers';
import { optimiseSchema } from '@jptr/braille-integrations';
import { Document } from '@langchain/core/documents';
import { Traceable } from '@amplication/opentelemetry-nestjs';
import Bluebird from 'bluebird';

import { OpenAIService } from '../openai/openai.service';
import { VectorindexService } from '../vectorindex/vectorindex.service';
import { ApplicationsService } from '../applications/applications.service';
import { Queue } from '../worker/jobs';
import { prisma } from '../prisma';
import { s3 } from '../worker/aws';

import { llmPromptFromJSONSchema, validate } from './utils';
import { ApplicationSchemaFunctionCall } from './function-call';
import { BrailleLogger } from '../logger';

export interface CustomRetrieverInput extends BaseRetrieverInput {
  entities: Record<string, object[]>;
}

export class CustomRetriever extends BaseRetriever {
  lc_namespace = ['langchain', 'retrievers'];
  entities: Record<string, object[]>;

  constructor(fields: CustomRetrieverInput) {
    super(fields);
    this.entities = fields.entities;
  }

  async _getRelevantDocuments(): Promise<Document[]> {
    // Pass `runManager?.getChild()` when invoking internal runnables to enable tracing
    // const additionalDocs = await someOtherRunnable.invoke(params, runManager?.getChild());
    return Object.entries(this.entities).flatMap(([entityType, entities]) => {
      return entities.map((entity) => {
        return new Document({
          pageContent: `${entityType.toUpperCase()}: ${JSON.stringify(entity)}`,
          metadata: {},
        });
      });
    });
  }
}

@Traceable()
@Injectable()
export class DataExtractionService {
  private readonly logger = new BrailleLogger(DataExtractionService.name);
  private enc = encoding_for_model('gpt-4o');
  private readonly openAi = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
    maxTokens: 4096,
  });

  constructor(
    private readonly sqsService: SqsService,
    private readonly openai: OpenAIService,
    private readonly vectorIndex: VectorindexService,
    private readonly applicationsService: ApplicationsService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @SqsMessageHandler(Queue.STRUCTURED_DATA_JOB_SPAWNER_QUEUE, false)
  public async handleMessage(message: Message) {
    console.log(
      Queue.STRUCTURED_DATA_JOB_SPAWNER_QUEUE,
      'JOB RECEIVED',
      message,
    );

    if (!message.Body) {
      throw new Error('No message body');
    }

    const msg = JSON.parse(message.Body).Message;
    const { documentId } = JSON.parse(msg);

    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const pendingJobs = await prisma.dataExtractionJob.findMany({
      where: {
        documentId,
      },
    });

    if (!pendingJobs.length) {
      return;
    }

    await this.sqsService.send(
      Queue.STRUCTURED_DATA_JOB_QUEUE,
      pendingJobs.map((job) => ({
        id: job.id,
        body: {
          jobId: job.id,
          documentId: job.documentId,
          tenantId: job.tenantId,
        },
      })),
    );
  }

  @SqsConsumerEventHandler(
    Queue.STRUCTURED_DATA_JOB_SPAWNER_QUEUE,
    'processing_error',
  )
  public async onProcessingError(error: Error, message: Message) {
    this.logger.error(
      'ERROR OCCURRED PROCESSING STRUCTURED_DATA_JOB_SPAWNER_QUEUE',
    );
    this.logger.error(error);
    this.logger.error(message);
  }

  private async setJobStatus(
    jobId: string,
    tenantId: string,
    documentId: string,
    status: 'RUNNING' | 'FINISHED' | 'FAILED',
  ) {
    this.logger.debug(
      { jobId, tenantId, documentId },
      'EXTRACTION TASK STARTING',
    );

    const job = await prisma.dataExtractionJob.update({
      where: {
        id: jobId,
      },
      include: {
        customPrompts: true,
        document: {
          include: {
            files: {
              where: {
                tenantId,
                type: 'PNG',
              },
              orderBy: {
                idx: 'asc',
              },
            },
          },
        },
        modelVersion: {
          include: {
            schema: true,
            appVersionModelVersion: {
              include: {
                appVersion: {
                  include: {
                    app: true,
                  },
                },
              },
            },
          },
        },
      },
      data: {
        status,
      },
    });

    /**
     * Notify that the job is now running
     */
    await this.redis.publish(
      `${tenantId}:${jobId}`,
      JSON.stringify({
        subject: 'job',
        action: 'updated',
        documentId,
        tenantId,
      }),
    );

    return job;
  }

  private async loadImages(keys: string[]) {
    const images = await Promise.all(
      keys.map(async (imageKey) => {
        const response = await s3.send(
          new GetObjectCommand({
            Bucket: process.env.S3_UPLOAD_BUCKET,
            Key: imageKey,
          }),
        );

        if (!response.Body) {
          throw new Error('No response body');
        }

        return await response.Body.transformToString('base64');
      }),
    );
    if (!images.length) {
      throw new Error('No images found');
    }
    this.logger.debug(`IMAGE COUNT: ${images.length}`);

    return images;
  }

  private getToolCall(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    name: string,
  ) {
    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (!toolCalls) {
      throw new Error('Tool calls were not found');
    }

    const toolCall = toolCalls.find(
      (call) => call.type === 'function' && call.function.name === name,
    );

    if (!toolCall) {
      throw new Error('Tool call was not found');
    }

    return toolCall;
  }

  public get systemMessage() {
    return [
      'You are an intelligent human being, and I am a computer program. I am going to ask you to do something that I cannot do, and that is to extract structured information from a document that I have provided to you.',
      'If you are unsure of a value, please leave it blank (return `undefined`).',
      'If you are more than 50% confident of a value, please provide it.',
      'Do not tell me if you are unsure of a value, only provide the value if you are reasonably confident, or omit (return `undefined`) it if its not present.',
      'I may have provided images from multiple pages of the document. Please provide information from all pages. Favour verbosity not brevity. Do not limit the information to "non-zero" values, give me all values including those that are zero.',
      'Be as perscriptive as possible, and provide as much information as you can. Do not omit any information that I ask for, for example do not omit information by saying "and so on:", it is imperative that you describe all information in as much details as possible.',
      'Remember, I will not be able to respond to you if you to ask further questions so you must respond with all information in one message.',
      'Never provide the value undefined as a string in a function/tool call, unless the document literally says "undefined". Instead leave the value as undefined (do not provide a key).',
      'If asked for an array or list of data, if there are no applicable items to provide, provide an empty list/array.',
    ].join(' ');
  }

  public async handleManualModelExtraction(
    job: Awaited<ReturnType<DataExtractionService['setJobStatus']>>,
  ) {
    const schema = job.modelVersion.schema.schema;

    if (!schema) {
      throw new Error('No schema defined for model version');
    }

    const images = await this.loadImages(
      job.document.files.map((file) => file.key),
    );

    const optimisedSchema = optimiseSchema(schema as JSONSchema7);

    const schemaPrompt = llmPromptFromJSONSchema(optimisedSchema);

    const customPrompts = job.customPrompts
      .map((prompt) => prompt.prompt)
      .join('\n');

    this.logger.debug(schemaPrompt + '\n' + customPrompts);

    const systemMessage = new SystemMessage({
      content:
        'When I send you multiple images that comprise a single document. I will ask you to extract a detailed description of specific information that might be contained in the document.',
    });

    const extendedPrompt = !!job.customPrompts.length
      ? schemaPrompt +
        "\nHere's some corrective information, trust this more than any other found in or inferred from the document:" +
        customPrompts
      : schemaPrompt;

    const message = new HumanMessage({
      content: [
        ...images.map((image) => ({
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${image}`,
          },
        })),
        {
          type: 'text',
          text: extendedPrompt,
        },
      ],
    });

    const model = this.openAi.withStructuredOutput(optimisedSchema);

    const result: Prisma.InputJsonValue = await model.invoke([
      systemMessage,
      message,
    ]);

    validate(optimisedSchema, result);

    await prisma.dataExtractionJob.update({
      where: {
        id: job.id,
      },
      data: {
        status: 'FINISHED',
        data: {
          create: {
            modelVersion: {
              connect: {
                id: job.modelVersionId,
              },
            },
            tenant: {
              connect: {
                id: job.tenantId,
              },
            },
            json: result,
          },
        },
      },
    });

    await this.notifyJobUpdate(job, 'FINISHED');
  }

  public async interpretDocumentContent(
    images: string[],
    prompt: string,
    fn?: OpenAI.FunctionDefinition,
  ) {
    const imagesMessages: OpenAI.ChatCompletionContentPartImage[] = images.map(
      (image) => ({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${image}`,
        },
      }),
    );

    return this.openai.interpretImages(
      [
        {
          role: 'system',
          content: [
            'When I send you multiple images that comprise a single document.',
            'I will ask you to extract a detailed description of specific information that might be contained in the document.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            ...imagesMessages,
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      fn ? { type: 'function', function: fn } : undefined,
    );
  }

  public entitiesToString(entityRetrieval: Record<string, object[]>) {
    return Object.entries(entityRetrieval).reduce(
      (acc, [entityType, entities]) => {
        return (
          acc +
          `---- ${entityType} ----\r\n
          ${entities
            .map((entity) => JSON.stringify(entity))
            .join('\r\n---\r\n')}`
        );
      },
      '',
    );
  }

  public loadPromptWithContext(
    node: JSONSchema7,
    entityRetrieval: Record<string, object[]>,
  ) {
    const maxTokens = 128000;
    const basePrompt =
      llmPromptFromJSONSchema(node) +
      'Some of the information may be references to some in the following entities: ';

    const remainingTokens = maxTokens - this.enc.encode(basePrompt).length;

    if ('Bill' in entityRetrieval) {
      entityRetrieval['Bill'] = entityRetrieval['Bill'].slice(0, 5);
    }

    for (const [entityType, items] of Object.entries(entityRetrieval)) {
      this.logger.log(`RETRIEVED ${items.length} of ${entityType}`);
    }

    const maxIterations = 5;
    let entitiesString = this.entitiesToString(entityRetrieval);
    let entitiesTokens = this.enc.encode(entitiesString).length;
    let iteration = 0;

    while (entitiesTokens > remainingTokens) {
      this.logger.log({ iteration, entitiesTokens, remainingTokens });

      if (++iteration <= maxIterations) {
        entityRetrieval = Object.entries(entityRetrieval).reduce<
          Record<string, object[]>
        >(
          (acc, [entityType, entities]) => ({
            ...acc,
            [entityType]: entities.slice(
              0,
              Math.floor(
                (entities.length * remainingTokens * 0.8) / entitiesTokens,
              ),
            ),
          }),
          {},
        );

        entitiesString = this.entitiesToString(entityRetrieval);
        entitiesTokens = this.enc.encode(entitiesString).length;
      }
    }

    this.logger.log(`RAG REDUCER ITERATION ${iteration}`);
    for (const [entityType, items] of Object.entries(entityRetrieval)) {
      this.logger.log(`RETRIEVED ${items.length} of ${entityType}`);
    }

    return basePrompt + entitiesString;
  }

  async loadContext(
    modelVersion: Awaited<ReturnType<DataExtractionService['getModelVersion']>>,
    tenantId: string,
    entityContextHints: Record<string, string[]>,
  ) {
    if (!modelVersion.appVersionModelVersion) {
      throw new Error('No app version model version found');
    }

    const entityModelIds = new Map<string, string>();

    for (const version of modelVersion.appVersionModelVersion.appVersion
      .modelVersions) {
      if (version.modelVersion.model.name) {
        entityModelIds.set(
          version.modelVersion.model.name,
          version.modelVersion.model.id,
        );
      }
    }

    const entityContextHintsEntries = Object.entries(entityContextHints);

    const entityContext: [
      string,
      {
        id: string;
        data: object;
        tenantId: string;
        similarity: number;
      }[],
    ][] = [];

    for (const [entityType, hints] of entityContextHintsEntries) {
      this.logger.log('INITIAL HINT COUNT');
      this.logger.log(entityType);
      this.logger.log(hints.length);
      const filteredHints = hints.slice(0, 20).filter(Boolean);

      const response = filteredHints.length
        ? await this.openai.createEmbeddings(filteredHints)
        : { data: [] };

      const embeddings = response.data.map((item) => item.embedding);

      this.logger.log('LOADING RESULTS FOR EMBEDDINGS');

      const searchResults = (
        await Bluebird.map(
          embeddings,
          (e) =>
            this.vectorIndex.vectorSearch(
              e,
              entityModelIds.get(entityType)!,
              tenantId,
              3,
            ),
          { concurrency: 2 },
        )
      ).flat();

      this.logger.log(
        `RESULTS LOADED: ${searchResults.length} entities loaded`,
      );

      const dedupeMap = new Map<
        string,
        {
          id: string;
          data: object;
          tenantId: string;
          similarity: number;
        }
      >();

      for (const result of searchResults) {
        const existing = dedupeMap.get(result.id);

        if (existing) {
          if (result.similarity > existing.similarity) {
            dedupeMap.set(result.id, result);
          }
        } else {
          dedupeMap.set(result.id, result);
        }
      }

      this.logger.log('CONTEXT DEDUPLICATED');

      entityContext.push([entityType, Array.from(dedupeMap.values())]);
    }

    this.logger.log('ALL CONTEXT READY. RETURNING');

    return entityContext.reduce<Record<string, object[]>>(
      (acc, [entityType, items]: [string, any[]]) => ({
        ...acc,
        [entityType]: items.map((item) => item.data),
      }),
      {},
    );
  }

  async getModelVersion(modelVersionId: string) {
    return prisma.modelVersion.findUniqueOrThrow({
      where: {
        id: modelVersionId,
      },
      include: {
        model: true,
        schema: true,
        appVersionModelVersion: {
          include: {
            appVersion: {
              include: {
                modelVersions: {
                  include: {
                    modelVersion: {
                      include: {
                        model: true,
                      },
                    },
                  },
                },
                app: true,
              },
            },
          },
        },
      },
    });
  }

  getEntityCreateFunction(schema: Prisma.JsonValue, entityName: string) {
    return new ApplicationSchemaFunctionCall(schema).toFunctionDefinition(
      entityName,
    );
  }

  async getRagFunction(
    appId: string,
    entityName: string,
    actionKey: string,
  ): Promise<{ prompt: string; fn: Required<OpenAI.FunctionDefinition> }> {
    const app = await this.applicationsService.getBrailleApp(appId);

    const action = app.entities[entityName].actions.find(
      (action) => action.key === actionKey,
    );

    const properties = Object.entries(action?.context?.entities ?? {}).reduce(
      (acc, [entityName, config]) => {
        return {
          ...acc,
          [entityName]: {
            description: config.prompt,
            type: 'array',
            items: {
              type: 'string',
            },
          },
        };
      },
      {},
    );

    const propertiesPrompt = Object.entries(
      action?.context?.entities ?? {},
    ).reduce((acc, [entityName, config]) => {
      return acc + `--- ${entityName} ---\r\n${config.prompt}\r\n`;
    }, '');

    const fn = {
      name: 'get_context',
      description:
        "Identify potential information about the document's to query a vector database",
      parameters: {
        type: 'object',
        title: 'Document entities',
        description: 'Record of entities',
        properties,
        required: Object.keys(properties),
      },
    };

    const prompt =
      'Please provide information about the following entities in this document so I can search for them in my vector database. Provide as much information as you can, including any values that you are not confident about.\r\n' +
      propertiesPrompt;

    this.logger.log(prompt);
    this.logger.log(fn);

    return {
      prompt,
      fn,
    };
  }

  public async handleAppEntityExtraction(
    job: Awaited<ReturnType<DataExtractionService['setJobStatus']>>,
  ) {
    const modelVersion = await this.getModelVersion(job.modelVersionId);

    if (!modelVersion.appVersionModelVersion)
      throw new Error('No app version model version found');

    const [images, rag] = await Promise.all([
      this.loadImages(job.document.files.map((file) => file.key)),
      this.getRagFunction(
        modelVersion.appVersionModelVersion.appVersion.appId,
        modelVersion.model.name,
        'create',
      ),
    ]);

    const ragResponse = await this.interpretDocumentContent(
      images,
      rag.prompt,
      rag.fn,
    );

    const ragToolCall = this.getToolCall(ragResponse, rag.fn.name);

    const entityContextHints = JSON.parse(ragToolCall.function.arguments);
    this.logger.log('CONTEXT HINTS', entityContextHints);

    const entityContext = await this.loadContext(
      modelVersion,
      job.tenantId,
      entityContextHints,
    );

    this.logger.log('ENTITY CONTEXT SIZE');
    for (const [entityType, entities] of Object.entries(entityContext)) {
      this.logger.log(`${entityType}:${entities.length}`);
    }

    const fn = this.getEntityCreateFunction(
      modelVersion.appVersionModelVersion.appVersion.schema,
      modelVersion.model.name,
    );

    const messages = new RunnablePassthrough();

    const contextRetriever = new CustomRetriever({ entities: entityContext });

    const context = contextRetriever.pipe((documents: Document[]) =>
      documents
        .map((document) => document.pageContent)
        .join('\n\n')
        .trim(),
    );

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        'I will send you multiple images that comprise a single document. I will ask you to extract a detailed description of specific information that might be contained in the document.',
      ],
      new MessagesPlaceholder('messages'),
      [
        'user',
        '----CONTEXT----\r\n Here are entities I have stored in my database that you may need to reference to populate IDs for entities referenced, or examples of similar documents:\r\n {context}',
      ],
    ]);

    const optimisedSchema = optimiseSchema(fn.parameters);

    const model = this.openAi.withStructuredOutput(optimisedSchema);

    const schemaPrompt = llmPromptFromJSONSchema(fn.parameters);

    const chain = RunnableSequence.from([
      { context, messages },
      promptTemplate,
      model,
    ]);

    const customPrompts = job.customPrompts
      .map((prompt) => prompt.prompt)
      .join('\n');

    this.logger.debug(schemaPrompt + '\n' + customPrompts);

    const extendedPrompt = !!job.customPrompts.length
      ? schemaPrompt +
        "\nHere's some corrective information, trust this more than any other found in or inferred from the document:" +
        customPrompts
      : schemaPrompt;

    const result = await chain.invoke([
      {
        type: 'user',
        content: [
          ...images.map((image) => ({
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${image}`,
            },
          })),
        ],
      },
      {
        type: 'user',
        content: extendedPrompt,
      },
    ]);

    validate(optimisedSchema, result);

    await prisma.dataExtractionJob.update({
      where: {
        id: job.id,
      },
      data: {
        status: 'FINISHED',
        data: {
          create: {
            modelVersion: {
              connect: {
                id: job.modelVersionId,
              },
            },
            tenant: {
              connect: {
                id: job.tenantId,
              },
            },
            json: result,
          },
        },
      },
    });

    await this.notifyJobUpdate(job, 'FINISHED');
  }

  public async handleExtraction({
    jobId,
    tenantId,
    documentId,
  }: {
    jobId: string;
    tenantId: string;
    documentId: string;
  }) {
    const job = await this.setJobStatus(jobId, tenantId, documentId, 'RUNNING');

    try {
      if (job.modelVersion.appVersionModelVersion) {
        this.logger.log('APP MODEL EXTRACTION');
        await this.handleAppEntityExtraction(job);
      } else {
        this.logger.log('CUSTOM MODEL EXTRACTION');
        await this.handleManualModelExtraction(job);
      }
    } catch (err) {
      await prisma.dataExtractionJob.update({
        where: {
          id: jobId,
        },
        data: {
          status: 'FAILED',
        },
      });

      await this.notifyJobUpdate(job, 'FAILED');

      throw err;
    }
  }

  private notifyJobUpdate(job: DataExtractionJob, status: string) {
    try {
      return this.redis.publish(
        `${job.tenantId}:${job.id}`,
        JSON.stringify({
          subject: 'job',
          action: 'updated',
          documentId: job.documentId,
          workspaceDocumentId: job.workspaceDocumentId,
          tenantId: job.tenantId,
          status,
        }),
      );
    } catch (err) {
      this.logger.error('FAILED TO PUBLISH MESSAGE TO REDIS');
      this.logger.error(err);
    }
  }

  @SqsMessageHandler(Queue.STRUCTURED_DATA_JOB_QUEUE, false)
  public async handleDataExtraction(message: Message) {
    console.log(Queue.STRUCTURED_DATA_JOB_QUEUE, 'JOB RECEIVED', message);
    if (!message.Body) {
      throw new Error('No message body');
    }
    const { jobId, tenantId, documentId } = JSON.parse(message.Body);

    return this.handleExtraction({ jobId, tenantId, documentId });
  }

  @SqsConsumerEventHandler(Queue.STRUCTURED_DATA_JOB_QUEUE, 'processing_error')
  public onExtractionError(error: Error, message: Message) {
    // report errors here
    this.logger.error('ERROR OCCURRED PROCESSING STRUCTURED_DATA_JOB_QUEUE');
    this.logger.error(error);
    this.logger.error(message);
  }
}

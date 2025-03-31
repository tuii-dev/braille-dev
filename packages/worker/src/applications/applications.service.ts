import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SwaggerParser from '@apidevtools/swagger-parser';
import template from 'url-template';
import pointer from 'json-pointer';
import jp from 'jsonpath';
import { Liquid } from 'liquidjs';
import { run } from 'node-jq';

import {
  ActionExecution,
  Data,
  DataExtractionJob,
  Prisma,
} from '@jptr/braille-prisma';
import {
  ActionSchema,
  ACTION_ERRORS_SCHEMA,
  APP_SCHEMA,
  AppSchema,
} from '@jptr/braille-integrations';

const engine = new Liquid();

import { prisma } from '../prisma';
import { OAuthService } from './oauth.service';
import { OpenAPI } from 'openapi-types';

@Injectable()
export class ApplicationsService {
  private logger = new Logger(ApplicationsService.name);

  constructor(
    private oauthService: OAuthService,
    private configService: ConfigService,
  ) {}

  public async getApplicationByCurrentVersionId(id: string) {
    const appVersion = await prisma.appVersion.findFirstOrThrow({
      where: {
        app: {
          id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return appVersion.schema;
  }

  public async getApplicationSchema(appId: string) {
    const currentVersion = await this.getApplicationByCurrentVersionId(appId);

    if (!currentVersion) {
      throw new Error('No application found');
    }

    return SwaggerParser.parse(currentVersion as any, {
      dereference: { circular: true },
    });
  }

  public async getBrailleApp(appId: string) {
    const app = await this.getApplicationSchema(appId);

    return APP_SCHEMA.parse(app['x-braille']);
  }

  expandPath(path: string, context: Record<string, any>) {
    const unescapedPath = pointer.unescape(path);
    const parsedTemplate = template.parse(
      unescapedPath.replaceAll('%7B', '{').replaceAll('%7D', '}'),
    );
    return parsedTemplate.expand(context);
  }

  getServerUrl(api: OpenAPI.Document) {
    const server = (api as any).servers.find((server: any) => {
      return server['x-environment'] === this.configService.get('BRAILLE_ENV');
    });

    if (!server) {
      throw new Error('No server configured for application');
    }

    const serverUrl = server.url;
    // TODO: Security. Validate that the DNS for the server is public IP address
    if (!serverUrl) {
      throw new Error('No server url found');
    }

    return serverUrl;
  }

  getAppConnection(applicationId: string, tenantId: string) {
    return prisma.appConnection.findFirst({
      where: {
        tenantId,
        appId: applicationId,
      },
      include: {
        app: true,
        settings: true,
        oauthTokenset: true,
      },
    });
  }

  async loadArguments(
    app: AppSchema,
    action: ActionSchema,
    inputs: Record<string, unknown>,
  ) {
    const argumentsConfig = [
      ...app.configuration.arguments?.static,
      ...(action.request.arguments?.static ?? []),
    ];

    const staticArguments = {};

    for (const config of argumentsConfig) {
      staticArguments[config.name] = await engine.render(
        engine.parse(config.value),
        inputs,
      );
    }

    return staticArguments;
  }

  async performAction(
    tenantId: string,
    applicationId: string,
    entityName: string,
    actionExecution:
      | 'list'
      | (ActionExecution & {
          dataExtractJob: DataExtractionJob & { data: Data | null };
        }),
    page: number = 1,
  ) {
    const api = await this.getApplicationSchema(applicationId);
    const app = await this.getBrailleApp(applicationId);

    const action = app.entities[entityName].actions.find((action) => {
      return typeof actionExecution === 'string' && actionExecution === 'list'
        ? action.key === 'list'
        : action.key === actionExecution.type.toLowerCase();
    });

    if (!action) {
      throw new Error('Could not find action');
    }

    /**
     * Bootstrap Config
     */
    const bootstrapConfig = app.ingestion.bootstrap.configuration;

    /**
     * Pagination Inputs
     */
    const paginationInputsConfig = bootstrapConfig.paginationInputs;

    const pageSize =
      action.inputs?.find(
        (input) => input.name === paginationInputsConfig.pageSize,
      )?.schema.default ??
      bootstrapConfig.maxPageSize ??
      100;

    const inputs = {
      [paginationInputsConfig.pageSize]: pageSize,
      [paginationInputsConfig.pageOffset]: (page - 1) * pageSize,
    };

    const serverUrl = this.getServerUrl(api);
    const connection = await this.getAppConnection(applicationId, tenantId);

    if (!connection) {
      throw new Error('No application configuration found');
    }

    const connectionSettings = await prisma.appConnectionSetting.findMany({
      where: {
        connectionId: connection.id,
      },
    });

    const context = connectionSettings.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.key]: cur.value,
      }),
      {},
    );

    const staticArguments = await this.loadArguments(app, action, inputs);
    const searchParams = new URLSearchParams(staticArguments);
    const expandedPath = this.expandPath(action.request.path, context);
    const url = new URL(`${serverUrl}${expandedPath}?${searchParams}`);
    this.logger.log(url);

    const tokenset = await this.oauthService.ensureFreshToken(
      connection.appId,
      connection.oauthTokenset,
    );

    const response = await fetch(url, {
      method: action.request.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${tokenset.accessToken}`,
      },
      ...(typeof actionExecution !== 'string' &&
      actionExecution.dataExtractJob.data?.json
        ? { body: JSON.stringify(actionExecution.dataExtractJob.data.json) }
        : {}),
    });

    if (response.status < 200 || response.status >= 300) {
      this.logger.log(JSON.stringify(response));
      this.logger.error('FAILED TO PERFORM ACTION');
      this.logger.error({
        url,
        method: action.request.method,
      });

      const data = await response.json();

      if (action.failure?.errors) {
        const errors = ACTION_ERRORS_SCHEMA.parse(
          await run(action.failure.errors, data, {
            input: 'json',
            output: 'json',
          }),
        );

        const log = JSON.stringify(data);

        this.logger.error(log);

        return { errors, log };
      }
    }

    const data = await response.json();

    if (typeof actionExecution !== 'string') {
      if (
        action &&
        action.response &&
        'outputs' in action.response &&
        action.response.outputs
      ) {
        this.logger.log('EXTRACTING OUTPUTS', action.response.outputs);

        const outputs = {};

        for (const [key, value] of Object.entries(action.response.outputs)) {
          if (typeof value === 'string') {
            try {
              outputs[key] = await run(value, data, {
                input: 'json',
                output: 'json',
              });
            } catch (err) {
              this.logger.error('FAILED TO EXTRACT OUTPUT');
              this.logger.error(err);
            }
          }
        }

        this.logger.log('EXTRACTED OUTPUTS', outputs);

        await prisma.actionOuputs.createMany({
          data: Object.entries(outputs).map(([name, data]) => ({
            actionExecutionId: actionExecution.id,
            name,
            data: data as Prisma.InputJsonValue,
            tenantId,
          })),
        });
      }
    }

    if (
      action &&
      action.response &&
      'items' in action.response &&
      action.response &&
      action.response.items
    ) {
      const entities = jp.query(data, action.response.items);

      return {
        entities,
      };
    }

    if (
      action &&
      action.response &&
      'item' in action.response &&
      action.response &&
      action.response.item
    ) {
      const entity = jp.query(data, action.response.item);

      return { entity };
    }

    return {};
  }
}

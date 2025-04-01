/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Factory } from '@app/common/shared/classes/instance-factory';
import { IWorkflowDataResolver } from '../application/interfaces/workflow-data-resolver.interface';
import { IWorkflowEmittedState } from '../application/interfaces/workflow-emitted-state.interface';

@Injectable()
export class SchemaDependencyService {
  private readonly ajv = Factory.create('ajv');

  constructor(
    @InjectPinoLogger(SchemaDependencyService.name)
    private readonly logger: PinoLogger,
  ) {}

  validate(schema: string, data: any): boolean {
    try {
      this.logger.info(
        `Validating schema: ${schema}, data: ${JSON.stringify(data)}`,
      );
      const validate = this.ajv!.compile(JSON.parse(schema));
      return validate(data);
    } catch (error) {
      this.logger.error('Error validating schema', { error });
      return false;
    }
  }

  async resolveDependencies(
    dependencyResolvers: IWorkflowDataResolver[],
    runtimeState: IWorkflowEmittedState[],
  ): Promise<any> {
    this.logger.info('Resolving dependencies', {
      dependencyResolvers,
      runtimeState,
    });
    if (dependencyResolvers.length > 0) {
      const results = await Promise.all(
        dependencyResolvers.map((resolver) => {
          return resolver.type === 'STATIC'
            ? this.resolveStaticDependencies(resolver, runtimeState)
            : this.resolveGenerativeDependencies(resolver, runtimeState);
        }),
      );

      this.logger.info('Merging results', {
        results,
      });

      const mergedResult = results.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {},
      );

      this.logger.info(`Merged results: ${JSON.stringify(mergedResult)}`, {
        mergedResult,
      });
      return mergedResult;
    } else {
      this.logger.info('No input resolvers found', {
        inputResolvers: dependencyResolvers,
        runtimeState,
      });
      return {};
    }
  }

  async resolveStaticDependencies(
    dependencyResolver: IWorkflowDataResolver,
    runtimeState: IWorkflowEmittedState[],
  ): Promise<any> {
    this.logger.info(
      `Resolving static input for input key: ${dependencyResolver.key} with mapping: ${dependencyResolver.mapping}`,
      {
        dependencyResolver,
        runtimeState,
      },
    );
    if (dependencyResolver.mapping) {
      let parts = dependencyResolver.mapping?.split('.');
      const state = runtimeState.find((s) => s.id === parts[0]);
      if (state) {
        parts = parts.slice(1);
        // If you have an array of properties like ['prop1', 'prop2', 'prop3']
        const path = parts.reduce(
          (acc, prop) => `${acc}['${prop}']`,
          'state.data',
        );
        this.logger.info(
          `Evaluating path: ${path} for input key: ${dependencyResolver.key} with mapping: ${dependencyResolver.mapping}`,
          {
            dependencyResolver,
            runtimeState,
          },
        );
        try {
          const value = eval(path); // This will evaluate the result as a JavaScript expression
          this.logger.info(
            `Evaluating path: ${path} for input key: ${dependencyResolver.key} with mapping: ${dependencyResolver.mapping} returned value: ${value}`,
            {
              dependencyResolver,
              runtimeState,
            },
          );
          return Promise.resolve({
            [dependencyResolver.key]: value,
          });
        } catch (error) {
          this.logger.error(
            `Error evaluating path: ${path} for input key: ${dependencyResolver.key} with mapping: ${dependencyResolver.mapping}`,
            {
              dependencyResolver,
              runtimeState,
              error,
            },
          );
        }
      } else {
        this.logger.warn(
          `State not found for input key: ${dependencyResolver.key} with mapping: ${dependencyResolver.mapping}`,
          {
            dependencyResolver,
            runtimeState,
          },
        );
      }
    } else {
      this.logger.warn(
        `No mapping found for input key: ${dependencyResolver.key}`,
        {
          dependencyResolver,
          runtimeState,
        },
      );
    }

    return Promise.resolve({
      [dependencyResolver.key]: undefined,
    });
  }

  async resolveGenerativeDependencies(
    dependencyResolver: IWorkflowDataResolver,
    runtimeState: IWorkflowEmittedState[],
  ): Promise<any> {
    this.logger.info(
      `Resolving generative input for input key: ${dependencyResolver.key} with prompt: ${dependencyResolver.prompt}`,
      {
        dependencyResolver,
        runtimeState,
      },
    );
    return Promise.resolve({
      [dependencyResolver.key]: undefined,
    });
  }
}

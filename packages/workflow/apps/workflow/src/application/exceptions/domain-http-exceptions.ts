import {
  HttpException as BaseHttpException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { DomainException } from '@ocoda/event-sourcing';
import {
  InsufficientOperationsException,
  InvalidTenantException,
  InvalidUuidException,
  SchemaValidationException,
  TenantNotFoundException,
  WorkflowExecutionNotFoundException,
  WorkflowTemplateNotFoundException,
} from '../../domain/exceptions';
import { AcyclicWorkflowGraphException } from '../../domain/exceptions/acyclic-workflow-graph.exception';
import { AppNotFoundException } from '../../domain/exceptions/app-not-found.exception';
import { InvalidAppException } from '../../domain/exceptions/invalid-app.exception';
import { InvalidWorkflowExecutionStepCompletionException } from '../../domain/exceptions/invalid-workflow-execution-step-completion.exception';
import { InvalidWorkflowExecutionStepProgressionException } from '../../domain/exceptions/invalid-workflow-execution-step-progression.exception';
import { RequiredArgsException } from '../../domain/exceptions/required-args.exception';
import { WorkflowStepNotFoundException } from '../../domain/exceptions/workflow-step-not-found.exception';

export class DomainHttpException extends BaseHttpException {
  static fromDomainException(error: DomainException): DomainHttpException {
    switch (error.constructor) {
      case TenantNotFoundException:
      case AppNotFoundException:
      case WorkflowTemplateNotFoundException:
      case WorkflowExecutionNotFoundException:
      case WorkflowStepNotFoundException:
        return new HttpException(
          { id: error.id, message: error.message },
          HttpStatus.NOT_FOUND,
        );
      case InvalidTenantException:
      case InvalidAppException:
      case InsufficientOperationsException:
      case RequiredArgsException:
        return new HttpException(
          { id: error.id, message: error.message },
          HttpStatus.FORBIDDEN,
        );
      case InvalidUuidException:
      case AcyclicWorkflowGraphException:
      case InvalidWorkflowExecutionStepProgressionException:
      case InvalidWorkflowExecutionStepCompletionException:
      case SchemaValidationException:
      default:
        return new HttpException(
          { message: error.message },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}

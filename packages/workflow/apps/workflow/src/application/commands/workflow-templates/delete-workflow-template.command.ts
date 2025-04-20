/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';
import { UtilsService } from '@app/common/services/utils/utils.service';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowTemplateRepository } from '../../repositories/workflow-templates/workflow-template.repository';
import { WorkflowTemplateNotFoundException } from 'apps/workflow/src/domain/exceptions';
import { WorkflowTemplateId } from 'apps/workflow/src/domain/models';
import { WorkflowTemplateDto } from '../../dtos/workflow-template/workflow-template.dto';

export class DeleteWorkflowTemplateCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly templateId: string,
  ) {}
}

@CommandHandler(DeleteWorkflowTemplateCommand)
export class DeleteWorkflowTemplateCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowTemplateRepository: WorkflowTemplateRepository,
    @InjectPinoLogger(DeleteWorkflowTemplateCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: DeleteWorkflowTemplateCommand,
  ): Promise<WorkflowTemplateDto> {
    this.utilsService.validateUuid(command.templateId);

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const templateId = WorkflowTemplateId.from(command.templateId);
    this.logger.info(
      `Deleting workflow template ID: ${templateId.value} for tenant: ${command.tenantId}`,
    );

    const template = await this.workflowTemplateRepository.getById(
      tenantId.value,
      templateId,
    );

    if (!template) {
      throw WorkflowTemplateNotFoundException.withId(templateId);
    }

    template.delete();

    await this.workflowTemplateRepository.save(tenantId.value, template);

    return template.toDto();
  }
}

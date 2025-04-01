/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { WorkflowExecution } from './workflow-execution.aggregate';
import { WorkflowExecutionId } from './workflow-execution-id';

@Snapshot(WorkflowExecution, { name: 'workflowExecution', interval: 5 })
export class WorkflowExecutionSnapshotRepository extends SnapshotRepository<WorkflowExecution> {
  serialize({
    executionId,
    templateId,
    tenantId,
    appId,
    workspaceId,
    startDate,
    endDate,
    nodes,
    runtimeState,
    status,
    name,
    description,
    parentWorkflowExecutionId,
    parentWorkflowExecutionNodeId,
    callbackUrl,
    inputs,
    inputSchemaDependency,
    outputSchemaDependency,
    outputResolvers,
    outputs,
    failedNodeIds,
    failureMessage,
    isRoot,
  }: WorkflowExecution): ISnapshot<WorkflowExecution> {
    return {
      executionId: executionId.value,
      templateId,
      tenantId,
      appId,
      workspaceId,
      startDate,
      endDate,
      nodes,
      runtimeState,
      status,
      name,
      description,
      parentWorkflowExecutionId,
      parentWorkflowExecutionNodeId,
      callbackUrl,
      inputs,
      inputSchemaDependency,
      outputSchemaDependency,
      outputResolvers,
      outputs,
      failedNodeIds,
      failureMessage,
      isRoot,
    };
  }
  deserialize({
    templateId,
    executionId,
    tenantId,
    appId,
    workspaceId,
    startDate,
    endDate,
    nodes,
    runtimeState,
    status,
    name,
    description,
    parentWorkflowExecutionId,
    parentWorkflowExecutionNodeId,
    callbackUrl,
    inputs,
    inputSchemaDependency,
    outputSchemaDependency,
    outputResolvers,
    outputs,
    failedNodeIds,
    failureMessage,
    isRoot,
  }: ISnapshot<WorkflowExecution>): WorkflowExecution {
    const workflowExecution = new WorkflowExecution();
    workflowExecution.templateId = templateId;
    workflowExecution.executionId = WorkflowExecutionId.from(
      executionId as string,
    );
    workflowExecution.tenantId = tenantId;
    workflowExecution.appId = appId;
    workflowExecution.workspaceId = workspaceId;
    workflowExecution.startDate = startDate;
    workflowExecution.endDate = endDate;
    workflowExecution.nodes = nodes;
    workflowExecution.runtimeState = runtimeState;
    workflowExecution.status = status;
    workflowExecution.name = name;
    workflowExecution.description = description;
    workflowExecution.parentWorkflowExecutionId = parentWorkflowExecutionId;
    workflowExecution.parentWorkflowExecutionNodeId =
      parentWorkflowExecutionNodeId;
    workflowExecution.callbackUrl = callbackUrl;
    workflowExecution.inputs = inputs;
    workflowExecution.inputSchemaDependency = inputSchemaDependency;
    workflowExecution.outputSchemaDependency = outputSchemaDependency;
    workflowExecution.outputResolvers = outputResolvers;
    workflowExecution.outputs = outputs;
    workflowExecution.failedNodeIds = failedNodeIds;
    workflowExecution.failureMessage = failureMessage;
    workflowExecution.isRoot = isRoot;

    return workflowExecution;
  }
}

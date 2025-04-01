export interface IWorkflowSchemaDependence extends IWorkflowInputOutputs {
  inputSchemaDependency?: string;
  outputSchemaDependency?: string;
}

export interface IWorkflowInputOutputs {
  inputs?: any;
  outputs?: any;
}

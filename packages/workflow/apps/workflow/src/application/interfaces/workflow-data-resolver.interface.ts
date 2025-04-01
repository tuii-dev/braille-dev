import { DataResolverType } from '@app/common/shared/types/data-resolver-type';

export interface IWorkflowDataResolver {
  type: DataResolverType;
  key: string;
  mapping?: string;
  prompt?: string;
}

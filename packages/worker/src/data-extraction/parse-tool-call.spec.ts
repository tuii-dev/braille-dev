import { FieldDataTypeEnum } from '@jptr/braille-prisma';
import { JSONNodeTreeTransformer } from './parse-tool-call';

describe('JSONNodeTreeTransformer', () => {
  it('should handle basic root properties', () => {
    const nodeValues = new JSONNodeTreeTransformer(
      {
        type: 'object',
        properties: {
          firstname: {
            type: 'string',
            description: 'First name',
          },
          lastname: {
            type: 'string',
            description: 'First name',
          },
        },
      },
      [
        {
          id: '1',
          parentId: null,
          definitionId: 'firstname',
          nextId: null,
          prevId: null,
          modelVersionId: 'modelVersionId',
          createdAt: new Date(),
          definition: {
            id: 'firstname',
            type: FieldDataTypeEnum.STRING,
            label: 'Firstname',
            name: 'firstname',
            description: 'First name',
            enum: [],
            tenantId: 'tenantId',
          },
          tenantId: 'tenantId',
        },
        {
          id: '2',
          parentId: null,
          definitionId: 'lastname',
          nextId: null,
          prevId: null,
          modelVersionId: 'modelVersionId',
          createdAt: new Date(),
          definition: {
            id: 'lastname',
            type: FieldDataTypeEnum.STRING,
            label: 'Lastname',
            name: 'lastname',
            description: 'Last name',
            enum: [],
            tenantId: 'tenantId',
          },
          tenantId: 'tenantId',
        },
      ],
      'treeId',
    ).toNodeValues();

    expect(nodeValues).toStrictEqual([
      {
        id: 'treeId.firstname',
        definitionId: 'firstname',
        nodeId: '1',
        tenantId: 'tenantId',
        parentNodeValueId: undefined,
        value: null,
      },
      {
        id: 'treeId.lastname',
        definitionId: 'lastname',
        nodeId: '2',
        tenantId: 'tenantId',
        parentNodeValueId: undefined,
        value: null,
      },
    ]);
  });

  it('should handle object property type', () => {
    const nodeValues = new JSONNodeTreeTransformer(
      {
        '0': {
          '1': 'John',
          '2': 'Smith',
        },
      },
      [
        {
          id: '0',
          parentId: null,
          definitionId: 'applicant',
          nextId: null,
          prevId: null,
          modelVersionId: 'modelVersionId',
          createdAt: new Date(),
          definition: {
            id: 'applicant',
            type: FieldDataTypeEnum.OBJECT,
            label: 'Applicant',
            name: 'applicant',
            description: 'Person making application',
            enum: [],
            tenantId: 'tenantId',
          },
          tenantId: 'tenantId',
        },
        {
          id: '1',
          parentId: '0',
          definitionId: 'firstname',
          nextId: null,
          prevId: null,
          modelVersionId: 'modelVersionId',
          createdAt: new Date(),
          definition: {
            id: 'firstname',
            type: FieldDataTypeEnum.STRING,
            label: 'Firstname',
            name: 'firstname',
            description: 'First name',
            enum: [],
            tenantId: 'tenantId',
          },
          tenantId: 'tenantId',
        },
        {
          id: '2',
          parentId: '0',
          definitionId: 'lastname',
          nextId: null,
          prevId: null,
          modelVersionId: 'modelVersionId',
          createdAt: new Date(),
          definition: {
            id: 'lastname',
            type: FieldDataTypeEnum.STRING,
            label: 'Lastname',
            name: 'lastname',
            description: 'Last name',
            enum: [],
            tenantId: 'tenantId',
          },
          tenantId: 'tenantId',
        },
      ],
      'treeId',
    ).toNodeValues();

    expect(nodeValues).toStrictEqual([
      {
        id: 'treeId.applicant[0]',
        definitionId: 'applicant',
        nodeId: '0',
        tenantId: 'tenantId',
        value: 'OBJECT',
      },
      {
        id: 'treeId.applicant[0].firstname',
        definitionId: 'firstname',
        nodeId: '1',
        tenantId: 'tenantId',
        parentNodeValueId: 'treeId.applicant[0]',
        value: 'John',
      },
      {
        id: 'treeId.applicant[0].lastname',
        definitionId: 'lastname',
        nodeId: '2',
        tenantId: 'tenantId',
        parentNodeValueId: 'treeId.applicant[0]',
        value: 'Smith',
      },
    ]);
  });
});

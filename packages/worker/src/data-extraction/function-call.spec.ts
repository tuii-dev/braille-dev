import { integrations } from '@jptr/braille-integrations';

import { ApplicationSchemaFunctionCall } from './function-call';

describe('ApplicationSchemaFunctionCall', () => {
  const INTEGRATION = integrations().find((integration) => {
    return integration['x-braille'].application.name === 'Quickbooks';
  });

  it('should create function call for schema given component path', () => {
    const func = new ApplicationSchemaFunctionCall(
      INTEGRATION,
    ).toFunctionDefinition('Bill');

    expect(func).toStrictEqual({
      name: 'create',
      description: 'Create a bill',
      parameters: {
        type: 'object',
        title: 'Bill',
        description:
          'A request-for-payment from a vendor for goods or services rendered.',
        properties: {
          VendorRef: {
            type: 'object',
            title: 'Bill Vendor',
            description: 'The vendor who sent the invoice / produced the bill.',
            properties: {
              value: {
                type: 'object',
                title: 'Vendor',
                properties: {
                  Title: {
                    type: 'string',
                    title: 'Title',
                    description: 'The name of the vendor.',
                    'x-braille-property': 'name',
                  },
                },
              },
            },
          },
          Lines: {
            type: 'array',
            title: 'Lines',
            description: 'The line items for the bill.',
            items: {
              description: 'A line item on a bill.',
              type: 'object',
              title: 'Bill Line Item',
              properties: {
                Amount: {
                  type: 'number',
                  title: 'Amount',
                  description: 'The amount of the line item.',
                },
                DetailType: {
                  type: 'string',
                  title: 'Detail Type',
                  enum: [
                    'AccountBasedExpenseLineDetailforAccount',
                    'ItemBasedExpenseLineDetail',
                  ],
                },
                Description: {
                  title: 'Description',
                  description:
                    'Free form text description of the line item that appears in the printed record.',
                  type: 'string',
                },
                AccountBasedExpenseLineDetail: {
                  type: 'object',
                  properties: {
                    AccountRef: {
                      type: 'object',
                      properties: {
                        value: {
                          type: 'object',
                          title: 'Account',
                          properties: {
                            Name: {
                              type: 'string',
                              description:
                                'User recognizable name for the Account.',
                              title: 'Name',
                              'x-braille-property': 'name',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        required: [],
      },
    });
  });
});

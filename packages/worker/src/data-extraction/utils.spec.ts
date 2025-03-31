import {
  llmPromptFromJSONSchema,
  nodePromptPart,
  optimiseSchema,
  validate,
} from './utils';

describe('validate', () => {
  describe('date', () => {
    it('should coerce an empty string for a date to null', () => {
      const data = {
        date: '',
      };

      const schema = optimiseSchema({
        type: 'object',
        properties: { date: { type: 'string', format: 'date' } },
      });

      validate(schema, data);

      expect(data).toStrictEqual({ date: null });
    });
  });
});

describe('optimiseSchema', () => {
  it('should optimise date description', () => {
    expect(
      optimiseSchema({
        type: 'object',
        title: 'Bill',
        properties: {
          Date: {
            type: 'string',
            format: 'date',
            title: 'Date',
            description: 'The date of the bill',
          },
        },
      }),
    ).toEqual({
      type: 'object',
      title: 'Bill',
      properties: {
        Date: {
          type: 'string',
          format: 'date',
          title: 'Date',
          description: 'The date of the bill (in the format YYYY-MM-DD)',
          nullable: true,
          default: null,
        },
      },
    });
  });
});

describe('nodePromptPart', () => {
  it('should handle an object with title and description', () => {
    const prompt = nodePromptPart({
      type: 'object',
      title: 'Bill',
      description:
        'An invoice which is sent to us by a supplier which we will have to pay.',
      properties: {
        VendorRef: {
          type: 'object',
          title: 'Vendor',
          description: 'The supplier sending the bill',
          properties: {
            Title: {
              type: 'string',
              title: 'Title',
              description:
                'The name of the vendor, which might appear next to a logo, an address, which may or may not be present, an ABN, which may or may not be present.',
            },
          },
        },
        Lines: {
          type: 'array',
          title: 'Line items',
          description: 'The line items for the bill',
          items: {
            type: 'object',
            title: 'Line item',
            properties: {
              Description: {
                type: 'string',
                title: 'Description',
                description:
                  'Free form text description of the line item that appears in the printed record',
              },
              Amount: {
                type: 'number',
                title: 'Amount',
                description:
                  'The total amount is usually at the bottom and should include any tax if applicable.',
              },
            },
          },
        },
      },
    });

    expect(prompt).toMatchInlineSnapshot(`
"Describe the "Bill" (An invoice which is sent to us by a supplier which we will have to pay.) and its following properties:
- the "Vendor",
- the "Line items"?
Describe the "Vendor" (The supplier sending the bill) and its following properties:
- the "Title"?
- the "Title" (The name of the vendor, which might appear next to a logo, an address, which may or may not be present, an ABN, which may or may not be present.)?,
What are the "Line items" (The line items for the bill) which contain a Description, Amount?
For each "Line item" what is:
- the "Description" (Free form text description of the line item that appears in the printed record),
- the "Amount" (The total amount is usually at the bottom and should include any tax if applicable.)?"
`);
  });

  it('should handle an object without title and description', () => {
    const prompt = nodePromptPart({
      type: 'object',
      properties: {
        VendorRef: {
          type: 'object',
          title: 'Vendor',
          description: 'The supplier sending the bill',
          properties: {
            Title: {
              type: 'string',
              title: 'Title',
              description:
                'The name of the vendor, which might appear next to a logo, an address, which may or may not be present, an ABN, which may or may not be present.',
            },
          },
        },
        Lines: {
          type: 'array',
          title: 'Line items',
          description: 'The line items for the bill',
          items: {
            type: 'object',
            title: 'Line item',
            properties: {
              Description: {
                type: 'string',
                title: 'Description',
                description:
                  'Free form text description of the line item that appears in the printed record',
              },
              Amount: {
                type: 'number',
                title: 'Amount',
                description:
                  'The total amount is usually at the bottom and should include any tax if applicable.',
              },
            },
          },
        },
      },
    });

    expect(prompt).toMatchInlineSnapshot(`
"Describe the "Vendor" (The supplier sending the bill) and its following properties:
- the "Title"?
- the "Title" (The name of the vendor, which might appear next to a logo, an address, which may or may not be present, an ABN, which may or may not be present.)?,
What are the "Line items" (The line items for the bill) which contain a Description, Amount?
For each "Line item" what is:
- the "Description" (Free form text description of the line item that appears in the printed record),
- the "Amount" (The total amount is usually at the bottom and should include any tax if applicable.)?"
`);
  });
});

describe('llmPromptFromJSONSchema', () => {
  it('should convert JSON Schema to LLM prompt', () => {
    const prompt = llmPromptFromJSONSchema({
      type: 'object',
      title: 'Bill',
      description:
        'An invoice which is sent to us by a supplier which we will have to pay',
      properties: {
        VendorRef: {
          type: 'object',
          title: 'Vendor',
          description: 'The supplier sending the bill',
          properties: {
            Title: {
              type: 'string',
              title: 'Title',
              description:
                'The name of the vendor, which might appear next to a logo, an address, which may or may not be present, an ABN, which may or may not be present',
            },
          },
        },
        Lines: {
          type: 'array',
          title: 'Line items',
          description: 'The line items for the bill',
          items: {
            type: 'object',
            title: 'Line item',
            properties: {
              Description: {
                type: 'string',
                title: 'Description',
                description:
                  'Free form text description of the line item that appears in the printed record',
              },
              Amount: {
                type: 'number',
                title: 'Amount',
                description:
                  'The total amount is usually at the bottom and should include any tax if applicable',
              },
            },
          },
        },
      },
    });

    expect(prompt).toMatchInlineSnapshot(`
"Please provide me with the following information from the document:
Describe the "Bill" (An invoice which is sent to us by a supplier which we will have to pay) and its following properties:
- the "Vendor",
- the "Line items"?
Describe the "Vendor" (The supplier sending the bill) and its following properties:
- the "Title"?
- the "Title" (The name of the vendor, which might appear next to a logo, an address, which may or may not be present, an ABN, which may or may not be present)?,
What are the "Line items" (The line items for the bill) which contain a Description, Amount?
For each "Line item" what is:
- the "Description" (Free form text description of the line item that appears in the printed record),
- the "Amount" (The total amount is usually at the bottom and should include any tax if applicable)?"
`);
  });
});

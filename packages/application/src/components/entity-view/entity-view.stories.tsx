import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProgressProvider } from "@/components/client";

import { DataViewDialog, DataViewDialogProvider, ListOfTables } from "./client";
import { MockDataContext } from "./data-context/mock";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000,
    },
  },
});

const meta = {
  title: "Example / ListOfTables",
  parameters: {},
  tags: ["autodocs"],
  render: (args) => (
    <QueryClientProvider client={queryClient}>
      <ProgressProvider showUI={false}>
        <MockDataContext {...args}>
          <DataViewDialogProvider>
            <ListOfTables />
            <DataViewDialog />
          </DataViewDialogProvider>
        </MockDataContext>
      </ProgressProvider>
    </QueryClientProvider>
  ),
} satisfies Meta<typeof MockDataContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collection: Story = {
  args: {
    data: {
      applicants: [
        {
          name: "John Doe",
          age: 30,
          dependents: [
            { name: "Jane Doe", age: 5 },
            { name: "Jimmy Doe", age: 10 },
          ],
        },
        {
          name: "Jane Doe",
          age: 28,
          dependents: [{ name: "Jenny Doe", age: 2 }],
        },
      ],
    },
    schema: {
      type: "object",
      properties: {
        applicants: {
          type: "array",
          title: "Applicants",
          items: {
            type: "object",
            properties: {
              name: {
                title: "Name",
                type: "string",
              },
              age: {
                title: "Age",
                type: "number",
              },
              dependents: {
                title: "Children",
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      title: "Name",
                      type: "string",
                    },
                    age: {
                      title: "Age",
                      type: "number",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    isLoading: false,
  },
};

export const Object: Story = {
  args: {
    data: {
      applicant: {
        name: "John Doe",
        age: 30,
        biometrics: {
          height: 180,
          weight: 80,
        },
        education: {
          highschool: [
            {
              name: "Calvary",
              year: 2011,
              achievements: [{ name: "Valedictorian" }],
            },
          ],
          tertiary: [
            {
              name: "MIT",
              year: 2015,
              achievements: [{ name: "Summa Cum Laude" }],
            },
          ],
        },
        dependents: [
          { name: "Jane Doe", age: 5 },
          { name: "Jimmy Doe", age: 10 },
        ],
      },
    },
    schema: {
      type: "object",
      properties: {
        applicant: {
          type: "object",
          title: "Applicant",
          properties: {
            name: {
              title: "Name",
              type: "string",
            },
            age: {
              title: "Age",
              type: "number",
            },
            biometrics: {
              title: "Biometrics",
              type: "object",
              properties: {
                height: {
                  title: "Height",
                  type: "number",
                },
                weight: {
                  title: "Weight",
                  type: "number",
                },
              },
            },
            education: {
              title: "Education",
              type: "object",
              properties: {
                highschool: {
                  type: "array",
                  title: "Highschool",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        title: "Name",
                        type: "string",
                      },
                      year: {
                        title: "Year",
                        type: "number",
                      },
                      achievements: {
                        title: "Achievements",
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: {
                              title: "Name",
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
                tertiary: {
                  type: "array",
                  title: "Tertiary",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        title: "Name",
                        type: "string",
                      },
                      year: {
                        title: "Year",
                        type: "number",
                      },
                      achievements: {
                        title: "Achievements",
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: {
                              title: "Name",
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            dependents: {
              title: "Children",
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    title: "Name",
                    type: "string",
                  },
                  age: {
                    title: "Age",
                    type: "number",
                  },
                },
              },
            },
          },
        },
      },
    },
    isLoading: false,
  },
};

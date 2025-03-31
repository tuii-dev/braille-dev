import { faker } from "@faker-js/faker";

import { ModelTree } from "./entities";

jest.mock("nanoid", () => {
  return {
    nanoid: faker.string.nanoid,
  };
});

describe("Model Tree", () => {
  it("should create a model tree", () => {
    const model = new ModelTree({
      type: "object",
      properties: { name: { type: "string" } },
    }).toJSON();

    expect(model).toStrictEqual({
      nodes: [
        {
          id: "IqGIuM_z8oCkfHADr5Iqi",
          schema: {
            format: undefined,
            title: undefined,
            description: undefined,
            enum: undefined,
            type: "object",
          },
          parent: undefined,
          children: ["uJmpEneZLM1a94TKGvszi"],
          values: [],
        },
        {
          id: "uJmpEneZLM1a94TKGvszi",
          schema: {
            format: undefined,
            title: undefined,
            description: undefined,
            enum: undefined,
            type: "string",
          },
          parent: "IqGIuM_z8oCkfHADr5Iqi",
          children: [],
          values: [],
        },
      ],
    });
  });

  it("should handle arrays", () => {
    const model = new ModelTree({
      type: "object",
      properties: { list: { type: "array" } },
    }).toJSON();

    expect(model).toStrictEqual({
      nodes: [
        {
          id: "IqGIuM_z8oCkfHADr5Iqi",
          schema: {
            format: undefined,
            title: undefined,
            description: undefined,
            enum: undefined,
            type: "object",
          },
          parent: undefined,
          children: ["uJmpEneZLM1a94TKGvszi"],
          values: [],
        },
        {
          id: "uJmpEneZLM1a94TKGvszi",
          schema: {
            format: undefined,
            title: undefined,
            description: undefined,
            enum: undefined,
            type: "array",
          },
          parent: "IqGIuM_z8oCkfHADr5Iqi",
          children: [],
          values: [],
        },
      ],
    });
  });
});

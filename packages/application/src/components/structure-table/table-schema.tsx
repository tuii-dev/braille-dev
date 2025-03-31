"use client";

import { forwardRef, useState } from "react";
import React from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { useProgress } from "@/components/client";
import { EntityNodeDefinition } from "@/lib/model/entities";
import {
  DATA_TYPE_OPTIONS,
  FieldDataType,
  FieldDataTypeEnum,
  determineSchemaDataType,
} from "@/lib/model/ui";

import { FormField } from "../field";
import { Submit } from "../form-submit-button";
import { Button } from "../button";

import { createNewModelVersion } from "./actions";
import { TreeNodeCell } from "./schema";
import { ColumnSchema } from "./types";
import { Select } from "../select";
import { EnumInput } from "../enum-field";
import { validateField } from "./validation-error";
import { Operation } from "fast-json-patch";
import { cn } from "@/lib/utils";

export const TypeField = forwardRef<
  HTMLButtonElement,
  Partial<React.ComponentProps<typeof Select> & { enumValue: string[] }>
>(({ enumValue, form, ...props }, ref) => {
  const [type, setType] = useState(
    props.defaultValue ?? DATA_TYPE_OPTIONS[0].value,
  );
  const className =
    type === FieldDataTypeEnum.ENUM
      ? "rounded-e-none border-r-0 shrink focus:ring-0 focus:ring-offset-0 dark:focus:ring-0 dark:focus:shadow-none basis-32 border-r"
      : "";

  return (
    <div
      className={cn("flex w-full focus-within:ring-2 rounded-md", {
        "focus-within:ring-[#567CF0] dark:focus-within:ring-white/80":
          type === FieldDataTypeEnum.ENUM,
      })}
    >
      <Select
        ref={ref}
        name="type"
        className={cn(className)}
        options={DATA_TYPE_OPTIONS}
        defaultValue={type}
        onChange={(v) => {
          setType(v as (typeof DATA_TYPE_OPTIONS)[number]["value"]);
          props.onChange?.(v);
        }}
        form={form}
        {...props}
      />
      {type === FieldDataTypeEnum.ENUM && (
        <EnumInput
          autoFocus
          form={form}
          name="enum"
          value={enumValue}
          placeholder="Add options"
          className="rounded-s-none border-l-0 grow"
        />
      )}
    </div>
  );
});

TypeField.displayName = "TypeField";

export const TypeUpdateField = ({ node }: { node: EntityNodeDefinition }) => {
  return (
    <TypeField
      name="value"
      defaultValue={determineSchemaDataType(node.schema)}
      defaultOpen={determineSchemaDataType(node.schema) !== "ENUM"}
      enumValue={(node.schema.enum as string[]) ?? []}
      autoFocus
    />
  );
};

export const DATA_TYPE_FIELDS: Record<
  "property" | "title" | "description" | "type",
  React.ReactElement
> = {
  title: (
    <FormField
      aria-label="Field Name"
      type="text"
      name="title"
      placeholder="Field Name"
      form="new-subfield"
      autoFocus
    />
  ),
  property: (
    <FormField
      type="text"
      name="property"
      placeholder="System Name"
      form="new-subfield"
    />
  ),
  description: (
    <FormField
      type="text"
      name="description"
      placeholder="Description"
      form="new-subfield"
    />
  ),
  type: <TypeField form="new-subfield" />,
};

const TITLE_VALIDATOR = z
  .string({ message: "Field name must be provided" })
  .min(1, { message: "Field name must be provided" })
  .max(255, { message: "Field name must not exceed 255 characters" });

const DESCRIPTION_VALIDATOR = z
  .string()
  .max(255, "Description must not exceed 255 characters")
  .optional();

const SYSTEM_NAME_VALIDTOR = z
  .string({ message: "System Name must be of type text" })
  .min(1, { message: "System Name must be provided" })
  .max(255, "System Name must not exceed 255 characters");

export const DATA_TYPE_VALIDATOR = z.nativeEnum(FieldDataTypeEnum);

const ADD_SCHEMA_BASE = z.object({
  title: TITLE_VALIDATOR,
  property: SYSTEM_NAME_VALIDTOR,
  description: DESCRIPTION_VALIDATOR,
});
const ADD_STRING_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.STRING),
});
const ADD_NUMBER_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.NUMBER),
});
const ADD_DATE_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.DATE),
});
const ADD_CURRENCY_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.CURRENCY),
});
const ADD_BOOLEAN_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.BOOLEAN),
});
const ADD_ENUM_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.ENUM),
  enum: z.array(z.string()),
});
const ADD_ARRAY_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.ARRAY),
});
const ADD_OBJECT_SCHEMA = ADD_SCHEMA_BASE.extend({
  type: z.literal(FieldDataTypeEnum.OBJECT),
});

const ADD_PATH_SCHEMA = z.union([
  ADD_STRING_SCHEMA,
  ADD_NUMBER_SCHEMA,
  ADD_BOOLEAN_SCHEMA,
  ADD_DATE_SCHEMA,
  ADD_ENUM_SCHEMA,
  ADD_CURRENCY_SCHEMA,
  ADD_ARRAY_SCHEMA,
  ADD_OBJECT_SCHEMA,
]);

type ActionInsertFormProps = {
  modelId: string;
  parent: EntityNodeDefinition;
  onInsert: () => void;
  children: React.ReactNode;
};

const deriveSystemName = (title: unknown) => {
  if (typeof title === "string") {
    return title?.replace(/\s+/g, "_").toLowerCase();
  }
};

const STRING_TYPE = { type: "string" };
const DATE_TYPE = { ...STRING_TYPE, format: "date", enum: undefined };
const BOOLEAN_TYPE = { type: "boolean" };
const NUMBER_TYPE = { type: "number" };
const OBJECT_TYPE = { type: "object", properties: {} };
const ARRAY_TYPE = {
  type: "array",
  items: {
    type: "object",
    properties: {},
  },
};

export const getTypeBaseProperties = (type: FieldDataType): object => {
  switch (type) {
    case FieldDataTypeEnum.CURRENCY:
      return {
        type: "object",
        properties: {
          value: NUMBER_TYPE,
          currency: { type: "string", enum: ["AUD", "USD"] },
        },
      };
    case FieldDataTypeEnum.ENUM:
      return {
        ...STRING_TYPE,
        enum: [],
      };
    case FieldDataTypeEnum.DATE:
      return DATE_TYPE;
    case FieldDataTypeEnum.OBJECT:
      return OBJECT_TYPE;
    case FieldDataTypeEnum.ARRAY:
      return ARRAY_TYPE;
    case FieldDataTypeEnum.STRING:
      return { type: "string", enum: undefined };
    case FieldDataTypeEnum.NUMBER:
      return NUMBER_TYPE;
    case FieldDataTypeEnum.BOOLEAN:
      return BOOLEAN_TYPE;
  }
  throw new Error(`Unhandled type ${type}`);
};

const ActionInsertForm = ({
  modelId,
  parent,
  onInsert,
  children,
}: ActionInsertFormProps) => {
  const progress = useProgress();
  const queryClient = useQueryClient();

  return (
    <form
      id="new-subfield"
      aria-label="Add field"
      className="flex gap-x-2"
      action={progress.monitorProgress(async (formData) => {
        const form = ADD_PATH_SCHEMA.safeParse({
          title: formData.get("title"),
          description: formData.get("description"),
          type: formData.get("type"),
          property:
            formData.get("property") || deriveSystemName(formData.get("title")),
          enum: formData.getAll("enum"),
        });

        if (form.error) {
          console.error(form.error);
          toast.error(form.error.errors[0].message);
          return;
        }

        try {
          const path =
            parent.dataType === FieldDataTypeEnum.ARRAY
              ? parent.path + "/items/properties/" + form.data.property
              : parent.path + "/properties/" + form.data.property;

          const operations = [
            {
              op: "add",
              path,
              value: validateField({
                title: form.data.title,
                description: form.data.description,
                ...getTypeBaseProperties(form.data.type),
                ...(form.data.type === FieldDataTypeEnum.ENUM
                  ? { enum: form.data.enum }
                  : {}),
              }),
            },
          ] satisfies Operation[];

          const [error, result] = await createNewModelVersion(
            modelId,
            operations,
          );

          if (error) {
            return toast.error(error.error);
          }

          queryClient.setQueryData(["model", modelId], () => result);
          queryClient.invalidateQueries({ queryKey: ["model", modelId] });
          onInsert();
        } catch (err) {
          toast.error("Failed to add field");
        }
      })}
    >
      {children}
    </form>
  );
};

type DeleteFieldFormProps = {
  node: EntityNodeDefinition;
  modelId: string;
};

const DeleteFieldForm = ({ node, modelId }: DeleteFieldFormProps) => {
  const { monitorProgress } = useProgress();
  const queryClient = useQueryClient();

  return (
    <div className="w-full flex justify-start">
      <form
        aria-label="Remove field"
        action={monitorProgress(async () => {
          try {
            const [, result] = await createNewModelVersion(modelId, [
              {
                op: "remove",
                path: node.path,
              },
            ]);

            queryClient.setQueryData(["model", modelId], () => result);
            queryClient.invalidateQueries({ queryKey: ["model", modelId] });
          } catch {
            toast.error("Failed to remove field");
          }
        })}
      >
        <Submit
          variant="danger"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100"
          icon={<TrashIcon className="w-3.5 h-3.5" />}
        />
      </form>
    </div>
  );
};

export const createSchema = (modelId: string) =>
  new Map<string, ColumnSchema>([
    [
      "title",
      {
        label: "Field",
        name: "title",
        width: 200,
        render: {
          cell: ({ node }) => (
            <TreeNodeCell modelId={modelId} node={node} column="title" />
          ),
          insert: () => DATA_TYPE_FIELDS["title"],
        },
      },
    ],
    [
      "description",
      {
        label: "Description",
        name: "description",
        width: 400,
        render: {
          cell: ({ node }) => (
            <TreeNodeCell modelId={modelId} node={node} column="description" />
          ),
          insert: () => DATA_TYPE_FIELDS["description"],
        },
      },
    ],
    [
      "type",
      {
        label: "Type",
        name: "type",
        width: 200,
        render: {
          cell: ({ node }) => (
            <TreeNodeCell modelId={modelId} node={node} column="type" />
          ),
          insert: () => DATA_TYPE_FIELDS["type"],
        },
      },
    ],
    [
      "property",
      {
        label: "System Name",
        name: "property",
        width: 200,
        render: {
          cell: ({ node }) => (
            <TreeNodeCell modelId={modelId} node={node} column="property" />
          ),
          insert: () => DATA_TYPE_FIELDS["property"],
        },
      },
    ],
    [
      "actions",
      {
        label: "Actions",
        name: "actions",
        width: 300,
        srOnly: true,
        render: {
          cell: ({ node }: { node: EntityNodeDefinition }) => (
            <DeleteFieldForm node={node} modelId={modelId} />
          ),
          insert: ({ parent, onInsert, cancel }) => (
            <ActionInsertForm
              parent={parent}
              modelId={modelId}
              onInsert={onInsert}
            >
              <Submit
                icon={<PlusCircleIcon className="w-5 h-5" />}
                variant="primary"
              >
                Add Field
              </Submit>
              <Button onClick={cancel}>Cancel</Button>
            </ActionInsertForm>
          ),
        },
      },
    ],
  ]);

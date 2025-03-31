"use client";

import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";
import type { Operation } from "fast-json-patch";
import { useQueryClient } from "@tanstack/react-query";

import { useProgress } from "@/components/client";
import { createNewModelVersion } from "@/components/structure-table/actions";
import { DATA_TYPE_LABELS } from "@/lib/model/ui";
import { cn } from "@/lib/utils";
import { EntityNodeDefinition } from "@/lib/model/entities";

import { Chip } from "../chip";
import { FormField } from "../field";

import { DataTypeIcon } from "./elements";
import {
  DATA_TYPE_VALIDATOR,
  TypeUpdateField,
  getTypeBaseProperties,
} from "./table-schema";
import { useEditField } from "./editing-context";
import { EditFieldButton } from "./edit-button";
import { ValidationError, validateField } from "./validation-error";
import { InlineEdit } from "../inline-edit";
import { FieldDataTypeEnum } from "@jptr/braille-prisma";

type TreeNodeCellType = {
  modelId: string;
  node: EntityNodeDefinition;
  column: "property" | "title" | "description" | "type";
  children?: React.ReactNode;
};

export const TreeNodeCell = ({ modelId, node, column }: TreeNodeCellType) => {
  const { monitorProgress } = useProgress();
  const { editingField, setEditingField } = useEditField();
  const property = node.path.split("/").pop();
  const queryClient = useQueryClient();

  const onCancel = () =>
    setEditingField((prev) => {
      if (prev?.id === node.path) {
        return null;
      }
      return prev;
    });

  const editing =
    editingField?.id === node.path && editingField?.column === column;

  return (
    <InlineEdit
      editing={editing}
      onBlur={() => {
        onCancel();
      }}
      onCancel={onCancel}
      readView={() => <ViewNodeCell node={node} column={column} />}
      formProps={{
        id: "update-field-form",
        "aria-label": "Edit field",
        action: (formData: FormData) => {
          monitorProgress(async () => {
            const propertyName = String(formData.get("value"));
            const path = node.path;

            const determineOperations = (): Operation[] => {
              switch (column) {
                case "property": {
                  const subPath = node.path.match(/^(.+?)(?:[^\/]+?)$/)![1];
                  if (!propertyName) {
                    throw new ValidationError("System name cannot be empty");
                  }

                  return [
                    {
                      op: "remove",
                      path,
                    },
                    {
                      op: "add",
                      path: subPath + propertyName,
                      value: validateField(node.schema),
                    },
                  ];
                }

                case "type": {
                  const type = DATA_TYPE_VALIDATOR.safeParse(
                    formData.get("value"),
                  );
                  if (!type.success) {
                    throw new ValidationError(type.error.message);
                  }

                  /**
                   * Complex type conversion
                   */
                  if (
                    [FieldDataTypeEnum.ARRAY, FieldDataTypeEnum.OBJECT].some(
                      (t) => t === type.data,
                    ) &&
                    [FieldDataTypeEnum.ARRAY, FieldDataTypeEnum.OBJECT].some(
                      (t) => t === node.dataType,
                    )
                  ) {
                    // Convert between array and object
                    if (
                      type.data === FieldDataTypeEnum.ARRAY &&
                      node.dataType === FieldDataTypeEnum.OBJECT
                    ) {
                      /**
                       * Standard type conversion
                       */
                      return [
                        {
                          op: "replace",
                          path,
                          value: validateField({
                            type: "array",
                            title: node.schema.title,
                            description: node.schema.description,
                            "x-braille-order":
                              "x-braille-order" in node.schema
                                ? node.schema["x-braille-order"]
                                : undefined,
                            items: {
                              type: "object",
                              properties: node.schema.properties,
                            },
                          }),
                        },
                      ];
                    }

                    if (
                      type.data === FieldDataTypeEnum.OBJECT &&
                      node.dataType === FieldDataTypeEnum.ARRAY
                    ) {
                      if (
                        typeof node.schema.items === "object" &&
                        node.schema.items &&
                        "properties" in node.schema.items
                      ) {
                        return [
                          {
                            op: "replace",
                            path,
                            value: validateField({
                              type: "object",
                              title: node.schema.title,
                              description: node.schema.description,
                              "x-braille-order":
                                "x-braille-order" in node.schema
                                  ? node.schema["x-braille-order"]
                                  : undefined,
                              properties: node.schema.items.properties,
                            }),
                          },
                        ];
                      }
                    }
                  }

                  /**
                   * Standard type conversion
                   */
                  return [
                    {
                      op: "replace",
                      path,
                      value: validateField({
                        title: node.schema.title,
                        description: node.schema.description,
                        ...getTypeBaseProperties(type.data),
                        ...(type.data === "ENUM"
                          ? { enum: formData.getAll("enum") }
                          : {}),
                        "x-braille-order":
                          "x-braille-order" in node.schema
                            ? node.schema["x-braille-order"]
                            : undefined,
                      }),
                    },
                  ];
                }

                case "title":
                case "description":
                  return [
                    {
                      op: "replace",
                      path,
                      value: validateField({
                        ...node.schema,
                        [column]: formData.get("value"),
                        "x-braille-order":
                          "x-braille-order" in node.schema
                            ? node.schema["x-braille-order"]
                            : undefined,
                      }),
                    },
                  ];
              }
            };

            try {
              const operations = determineOperations();
              setEditingField(null);

              const [error, data] = await createNewModelVersion(
                modelId,
                operations,
              );

              if (error) {
                throw new ValidationError(error.error);
              }

              queryClient.setQueryData(["model", modelId], () => data);
              queryClient.invalidateQueries({
                queryKey: ["model", modelId],
              });
              toast.success("Field updated");
            } catch (err) {
              if (err instanceof ValidationError) {
                toast.error(err.message);
                console.error(err);
              } else {
                console.error(err);
                toast.error("Something went wrong");
              }
            }
          })();
        },
      }}
      editView={() => (
        <div className="flex gap-x-2 w-full">
          {column === "type" ? (
            <TypeUpdateField node={node} />
          ) : (
            <div style={{ width: "calc(100% + 0.75rem)" }} className="-ml-3">
              <FormField
                autoFocus
                type="text"
                name="value"
                placeholder={node.schema.title}
                defaultValue={
                  // PROPERTY IS SYSTEM NAME
                  column === "property" ? property : node.schema[column]
                }
              />
            </div>
          )}
        </div>
      )}
    />
  );
};

const ViewNodeCell = ({
  node,
  column,
}: Pick<TreeNodeCellType, "node" | "column">) => {
  const property = node.path.split("/").pop();

  const isEditable = ["property", "title", "description", "type"].includes(
    column,
  );

  if (column === "type") {
    return (
      <div className="flex items-center gap-x-4 group">
        <Chip
          className="py-2 min-w-30 text-center"
          label={DATA_TYPE_LABELS[node.dataType]}
          icon={
            <DataTypeIcon dataType={node.dataType} className="w-4 h-4 mr-2" />
          }
        />
        {node.schema.enum && (
          <div className="flex items-center gap-x-2">
            {node.schema.enum.map((v, i) => (
              <Chip key={i} className="py-2" label={String(v)} />
            ))}
          </div>
        )}
        {isEditable && <EditFieldButton fieldId={node.path} column={column} />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-4">
      <span
        className={cn({
          "font-mono": ["type", "property"].includes(column),
        })}
      >
        {column === "property"
          ? property
          : node.schema[column] || <span className="opacity-50">(none)</span>}
      </span>
      {isEditable && <EditFieldButton fieldId={node.path} column={column} />}
    </div>
  );
};

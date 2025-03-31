"use client";

import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  EntityNodeDefinitionType,
  EntityNodeValueType,
} from "@/lib/model/entities";

import { getTopLevelTables } from "./utils";

import { useDataContext } from "./data-context/context";

import { toast } from "sonner";

import { useMutation } from "@tanstack/react-query";

import { formatNodeValue } from "@jptr/braille-integrations";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

import { DATA_TYPE_ICON_MAP, FieldDataTypeEnum } from "@/lib/model/ui";
import { useProgress } from "@/components/client";

import { cn } from "@/lib/utils";

import { Currency } from "../currency";
import { Cell, Table } from "../table";
import {
  TableCollapseProvider,
  TableExpandButton,
  TableExpandCollpaseCellButton,
  useTableCollapse,
} from "./table-collapse";
import { useEditability } from "./editability-controller";
import { NumericAlignment, useNumericAlignment } from "./numeric-alignment";
import { DataViewDepthProvider, useDataViewDepth } from "./depth-provider";
import { EntityNodeReadView, RelatedEntityNode } from "./entity-dropdown";
import { IconWrapper } from "./icon-wrapper";
import { InlineEdit, useOnFocusOut } from "../inline-edit";

import { EditButton } from "../edit-button";

import { Select } from "../select";
import { TextInput } from "../textinput";
import { NodeComponentProps } from "./render-node/types";
import { ButtonCell } from "./cell-button";
import { Dialog, DialogContent, DialogHeader } from "../dialog";
import { TableProperties } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const ListOfTables = ({ path = "" }: { path?: string }) => {
  const { id, data, definitionStore } = useDataContext();

  const { nodes } = data ?? { nodes: [], nodeValues: [] };

  const topLevelTables = getTopLevelTables(nodes, definitionStore, path);

  return (
    <ul className="flex flex-col gap-y-6">
      {topLevelTables.map((definition) => {
        const headingId = `${id}-${definition.path}`;

        return (
          <li className="flex flex-col gap-y-4" key={definition.path}>
            <TableCollapseProvider>
              {definition.schema.title && (
                <div className="flex gap-x-3 items-center flex-row-reverse justify-end">
                  <h2 id={headingId} className="text font-semibold rr-mask">
                    {definition.schema.title}
                  </h2>
                  <TableExpandButton />
                </div>
              )}
              <CollapsibleValueTable
                defaultOpen={!!definition.parent}
                ariaLabelledBy={headingId}
                definition={definition}
              />
            </TableCollapseProvider>
          </li>
        );
      })}
    </ul>
  );
};

const useEditableCell = (action: (data: FormData) => Promise<void>) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { monitorProgress } = useProgress();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const { invalidateData } = useDataContext();
  const shouldFocusEditButton = useRef<boolean>(false);

  const { mutate, isPending } = useMutation({
    mutationFn: monitorProgress(action),
    onSettled: () => {
      invalidateData();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { onFocus, onBlur } = useOnFocusOut(() => {
    formRef.current?.requestSubmit();
    setIsEditing(false);
  });

  useEffect(() => {
    if (shouldFocusEditButton.current) {
      editButtonRef.current?.focus();
      shouldFocusEditButton.current = false;
    }
  });

  const editButton = (
    <CellEditButton
      ref={editButtonRef}
      aria-disabled={isPending}
      className={cn({
        "opacity-50": isPending,
      })}
      onClick={() => {
        if (!isPending) {
          setIsEditing(true);
        }
      }}
    />
  );

  return {
    formProps: {
      ref: formRef,
      onFocus,
      onBlur,
      onKeyDown: (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Escape") {
          setIsEditing(false);
          shouldFocusEditButton.current = true;
        }
      },
      onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsEditing(false);
        mutate(new FormData(e.target as HTMLFormElement));
      },
    },
    mutate,
    isPending,
    isEditing,
    setIsEditing,
    editButton,
  };
};

const ReadViewContainer = ({
  node,
  children,
}: NodeComponentProps & {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const alignment = useNumericAlignment();

  const alignRight =
    alignment === "right" &&
    [FieldDataTypeEnum.NUMBER, FieldDataTypeEnum.CURRENCY].some(
      (dataType) => dataType === node.definition.dataType,
    );

  return (
    <div
      className={cn(
        "min-h-10 min-w-30 h-full w-full flex items-center gap-2 relative",
        {
          "flex-row-reverse": alignRight,
          "px-3": node.definition.dataType !== FieldDataTypeEnum.OBJECT,
        },
      )}
    >
      {children}
    </div>
  );
};

const StringCell = ({ node }: NodeComponentProps) => {
  const { editable } = useEditability();
  const { mutate } = useDataContext();
  const { formProps, isEditing, setIsEditing, editButton } = useEditableCell(
    async (data: FormData) => {
      const op = "value" in node ? "replace" : "add";
      const nextValue = data.get("value");
      if (node.value === nextValue) {
        return;
      }

      const result = await mutate({
        op,
        path: node.path,
        value: nextValue,
      });

      if ("errors" in result) {
        if (result.errors?.[0].keyword === "maxLength") {
          throw new Error(
            `Must not exceed ${result.errors?.[0].params.limit} characters`,
          );
        }
        if (result.errors?.[0].keyword === "format") {
          switch (result.errors?.[0].params.format) {
            case "date":
              throw new Error("Invalid date format");
          }
          throw new Error("Invalid format");
        }
        throw new Error("Something went wrong");
      }
    },
  );

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <InlineEdit
      editing={isEditing}
      formProps={formProps}
      hideActions
      submitOnBlur
      readView={() => (
        <ReadViewContainer node={node}>
          <div className="flex gap-x-2 w-full items-center group/custom-inline-edit h-full">
            <NodeValue node={node} />
            {editButton}
          </div>
        </ReadViewContainer>
      )}
      editView={() => (
        <TextInput
          className={cn(
            "w-full h-full rounded-none border-0 border-none  bg-transparent dark:bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 py-0  text-[length:inherit]",
          )}
          name="value"
          defaultValue={node.value}
          type="text"
          autoFocus
        />
      )}
      onCancel={() => {
        setIsEditing(false);
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
    />
  );
};

const DateCell = ({ node }: NodeComponentProps) => {
  const { editable } = useEditability();
  const { mutate } = useDataContext();

  const { formProps, isEditing, setIsEditing, editButton } = useEditableCell(
    async (data: FormData) => {
      const op = "value" in node ? "replace" : "add";
      const nextValue = data.get("value");
      if (node.value === nextValue) {
        return;
      }

      const result = await mutate({
        op,
        path: node.path,
        value: nextValue || null,
      });

      if ("errors" in result) {
        if (result.errors?.[0].keyword === "maxLength") {
          throw new Error(
            `Must not exceed ${result.errors?.[0].params.limit} characters`,
          );
        }
        if (result.errors?.[0].keyword === "format") {
          switch (result.errors?.[0].params.format) {
            case "date":
              throw new Error("Invalid date format");
          }
          throw new Error("Invalid format");
        }
        throw new Error("Something went wrong");
      }
    },
  );

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <InlineEdit
      editing={isEditing}
      formProps={formProps}
      hideActions
      submitOnBlur
      readView={() => (
        <ReadViewContainer node={node}>
          <div className="flex gap-x-2 w-full items-center group/custom-inline-edit h-full">
            <NodeValue node={node} />
            {editButton}
          </div>
        </ReadViewContainer>
      )}
      editView={() => (
        <div
          className={cn(
            "w-full h-full focus-within:ring-inset focus-within:ring-[#567CF0] focus-within:ring-1 px-3 min-h-10 min-w-30 flex items-center relative",
          )}
        >
          <IconWrapper
            className="w-full"
            icon={DATA_TYPE_ICON_MAP[FieldDataTypeEnum.DATE]}
          >
            <TextInput
              className="w-full h-full rounded-none border-0 border-none bg-transparent dark:bg-transparent focus:ring-inset focus:ring-0 px-0 text-[length:inherit]"
              name="value"
              defaultValue={node.value}
              type="text"
              autoFocus
            />
          </IconWrapper>
        </div>
      )}
      onCancel={() => {
        setIsEditing(false);
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
    />
  );
};

const BooleanCell = ({ node }: NodeComponentProps) => {
  const { mutate } = useDataContext();
  const { editable } = useEditability();

  const { formProps, isEditing, setIsEditing, editButton } = useEditableCell(
    async (data: FormData) => {
      const op = "value" in node ? "replace" : "add";
      const nextValue = ["TRUE", "true"].some((v) => v === data.get("value"));

      if (node.value === nextValue) {
        return;
      }

      const result = await mutate({
        op,
        path: node.path,
        value: nextValue,
      });

      if ("errors" in result) {
        if (result.errors?.[0].keyword === "maxLength") {
          throw new Error(
            `Must not exceed ${result.errors?.[0].params.limit} characters`,
          );
        }
        if (result.errors?.[0].keyword === "format") {
          switch (result.errors?.[0].params.format) {
            case "date":
              throw new Error("Invalid date format");
          }
          throw new Error("Invalid format");
        }
        throw new Error("Something went wrong");
      }
    },
  );

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <InlineEdit
      editing={isEditing}
      formProps={formProps}
      readView={() => (
        <ReadViewContainer node={node}>
          <div className="flex gap-x-2 w-full items-center group/custom-inline-edit h-full">
            <NodeValue node={node} />
            {editButton}
          </div>
        </ReadViewContainer>
      )}
      editView={() => (
        <Select
          className="h-full w-full rounded-none border-0 text-[length:inherit] bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 focus:inset-0 focus:ring-offset-0"
          defaultValue={!!node.value ? "true" : "false"}
          defaultOpen
          name="value"
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ]}
          renderOption={(option) => (
            <span className="flex gap-x-2 text-[13px]">
              <IconWrapper
                icon={option.value === "true" ? CheckCircleIcon : XCircleIcon}
              >
                {option.label}
              </IconWrapper>
            </span>
          )}
        />
      )}
      onCancel={() => {
        setIsEditing(false);
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
    />
  );
};

const NumberCell = ({ node }: NodeComponentProps) => {
  const { editable } = useEditability();
  const { mutate, valueStore: store } = useDataContext();
  const alignment = useNumericAlignment();

  const { formProps, isEditing, setIsEditing, editButton } = useEditableCell(
    async (data: FormData) => {
      const op = "value" in node ? "replace" : "add";
      const nextValue = Boolean(data.get("value"))
        ? Number(data.get("value"))
        : null;

      if (node.value === nextValue) {
        return;
      }

      const result = await mutate({
        op,
        path: node.path,
        value: nextValue,
      });

      if ("errors" in result) {
        if (result.errors?.[0].keyword === "maxLength") {
          throw new Error(
            `Must not exceed ${result.errors?.[0].params.limit} characters`,
          );
        }
        if (result.errors?.[0].keyword === "format") {
          switch (result.errors?.[0].params.format) {
            case "date":
              throw new Error("Invalid date format");
          }
          throw new Error("Invalid format");
        }
        throw new Error("Something went wrong");
      }
    },
  );

  const alignRight =
    alignment === "right" &&
    node.definition.dataType === FieldDataTypeEnum.NUMBER;

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <InlineEdit
      editing={isEditing}
      formProps={formProps}
      hideActions
      readView={() => (
        <ReadViewContainer node={node}>
          <div
            className={cn(
              "flex gap-x-2 w-full items-center group/custom-inline-edit h-full",
              {
                "flex-row-reverse":
                  store.get(store.get(node.parent!)!.parent!)?.definition
                    .dataType === FieldDataTypeEnum.ARRAY,
              },
            )}
          >
            <NodeValue node={node} />
            {editButton}
          </div>
        </ReadViewContainer>
      )}
      editView={() => (
        <TextInput
          className={cn(
            "w-full h-full rounded-none border-0 border-none bg-transparent dark:bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 py-0  text-[length:inherit]",
            {
              "text-right": alignRight,
            },
          )}
          name="value"
          defaultValue={node.value}
          type="text"
          autoFocus
        />
      )}
      onCancel={() => {
        setIsEditing(false);
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
    />
  );
};

const CurrencyCell = ({ node }: NodeComponentProps) => {
  const { mutate } = useDataContext();
  const { editable } = useEditability();

  const { formProps, isEditing, setIsEditing, editButton } = useEditableCell(
    async (data: FormData) => {
      const op = "value" in node ? "replace" : "add";
      const nextValue = Boolean(data.get("value"))
        ? Number(data.get("value"))
        : null;

      if (node.value.value === nextValue) {
        return;
      }

      const result = await mutate({
        op,
        path: node.path,
        value: { ...node.value, value: nextValue },
      });

      if ("errors" in result) {
        if (result.errors?.[0].keyword === "maxLength") {
          throw new Error(
            `Must not exceed ${result.errors?.[0].params.limit} characters`,
          );
        }

        if (result.errors?.[0].keyword === "format") {
          switch (result.errors?.[0].params.format) {
            case "date":
              throw new Error("Invalid date format");
          }
          throw new Error("Invalid format");
        }
        throw new Error("Something went wrong");
      }
    },
  );

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <InlineEdit
      editing={isEditing}
      formProps={formProps}
      readView={() => (
        <div className="flex gap-x-2 px-3 w-full items-center group/custom-inline-edit h-full">
          <NodeValue node={node} />
          {editButton}
        </div>
      )}
      editView={() => (
        <TextInput
          className="w-full h-full rounded-none border-0 border-none bg-transparent dark:bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 py-0  text-[length:inherit]"
          name="value"
          defaultValue={node.value.value}
          type="text"
          autoFocus
        />
      )}
      onBlur={() => {
        setIsEditing(false);
      }}
      onCancel={() => {
        setIsEditing(false);
      }}
    />
  );
};

const EnumCell = ({ node }: NodeComponentProps) => {
  const { editable } = useEditability();
  const { mutate } = useDataContext();

  const { formProps, isEditing, setIsEditing, editButton } = useEditableCell(
    async (data: FormData) => {
      const op = "value" in node ? "replace" : "add";
      const nextValue = data.get("value");
      if (node.value === nextValue) {
        return;
      }

      const result = await mutate({
        op,
        path: node.path,
        value: nextValue,
      });

      if ("errors" in result) {
        if (result.errors?.[0].keyword === "maxLength") {
          throw new Error(
            `Must not exceed ${result.errors?.[0].params.limit} characters`,
          );
        }
        if (result.errors?.[0].keyword === "format") {
          switch (result.errors?.[0].params.format) {
            case "date":
              throw new Error("Invalid date format");
          }
          throw new Error("Invalid format");
        }
        throw new Error("Something went wrong");
      }
    },
  );

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <InlineEdit
      editing={isEditing}
      formProps={formProps}
      readView={() => (
        <div className="flex gap-x-2 px-3 w-full items-center group/custom-inline-edit h-full">
          <NodeValue node={node} />
          {editButton}
        </div>
      )}
      editView={() => (
        <Select
          className="h-full w-full rounded-none border-0 text-[length:inherit] bg-none dark:bg-none focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 focus:inset-0 focus:ring-offset-0"
          defaultValue={node.value}
          defaultOpen
          name="value"
          options={(node.definition.schema.enum ?? [])
            .filter((e) => typeof e === "string")
            .map((e) => ({
              label: e,
              value: e,
            }))}
        />
      )}
      onBlur={() => {
        setIsEditing(false);
      }}
      onCancel={() => {
        setIsEditing(false);
      }}
    />
  );
};

const EntityCell = ({ node }: NodeComponentProps) => {
  const { editable } = useEditability();

  if (!editable) {
    return (
      <ReadViewContainer node={node}>
        <NodeValue node={node} />
      </ReadViewContainer>
    );
  }

  return (
    <RelatedEntityNode
      className="min-w-64"
      path={node.path}
      entityModelId={node.entityModelId!}
      value={
        node.entityId || typeof node.value === "string"
          ? {
              label: node.views.option?.label || "",
              sublabel: node.views.option?.sublabel,
              value: node.entityId || "",
            }
          : null
      }
    />
  );
};

const DataViewDialogContext = React.createContext<{
  setPath: React.Dispatch<React.SetStateAction<string | undefined>>;
  path?: string;
} | null>(null);

export const DataViewDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [path, setPath] = React.useState<string | undefined>(undefined);

  return (
    <DataViewDialogContext.Provider
      value={useMemo(() => ({ path, setPath }), [path])}
    >
      {children}
    </DataViewDialogContext.Provider>
  );
};

const useDataViewDialog = () => {
  const context = React.useContext(DataViewDialogContext);

  if (!context) {
    throw new Error(
      "useDataViewDialog must be used within DataViewDialogProvider",
    );
  }

  return context;
};

export const DataViewDialog = () => {
  const { valueStore: store } = useDataContext();
  const ref = useRef<HTMLDivElement>();
  const { path, setPath } = useDataViewDialog();

  if (typeof path !== "string") {
    return null;
  }

  const node = store.get(path);

  if (!node) {
    setPath(undefined);
    return null;
  }

  const getBreadcrumbs = () => {
    const breadcrumbs = [];

    let current = node;

    while (current) {
      if (current.path !== "") {
        breadcrumbs.unshift(current);
      }
      current = store.get(current.parent!)!;
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const getDialogHeading = () => {
    if (node.path === "") {
      return "Data";
    }

    const nodeTitle =
      node.definition.schema.title ||
      (typeof node.definition.values[0]?.value === "string"
        ? node.definition.values[0]?.value
        : null) ||
      node.path;

    if (node.definition.dataType === "ARRAY") {
      const parent = node.parent && store.get(node.parent);

      if (parent) {
        const parentTitlePart =
          parent.definition.schema.title ||
          parent.definition.values[0]?.value ||
          parent.path;

        return `${parentTitlePart}'s ${nodeTitle}`;
      }
    }

    return nodeTitle;
  };

  return (
    <Dialog
      open={typeof path === "string"}
      onOpenChange={() => setPath(undefined)}
    >
      <DialogContent
        style={{
          width: "calc(100% - 4rem)",
          height: "90vh",
          overflow: "hidden",
        }}
        className="text-center max-w-full items-stretch flex gap-y-6 flex-col"
      >
        <DialogHeader>
          <h1 className="text-lg font-semibold flex items-center">
            <button
              onClick={() => setPath("")}
              className={cn("text-gray-400 hover:text-gray-500 mr-3", {
                "text-black": node.path === "",
              })}
            >
              <TableProperties
                aria-hidden="true"
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="sr-only">Data</span>
            </button>
            {getDialogHeading()}
          </h1>
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center h-8 mt-0">
              <ol role="list" className="flex items-center space-x-1">
                {breadcrumbs.map((n, i) => {
                  const current = path === n.path;

                  return (
                    <li key={n.path}>
                      <div className="flex items-center">
                        {i !== 0 && (
                          <svg
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="h-5 w-4 flex-shrink-0 text-gray-300"
                          >
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                          </svg>
                        )}
                        <button
                          onClick={() => {
                            setPath(n.path);
                          }}
                          aria-current={path === n.path ? "page" : undefined}
                          className={cn(
                            "ml-1 text-xs font-medium text-gray-500 hover:text-gray-700",
                            {
                              "font-bold text-black": current,
                            },
                          )}
                        >
                          {n.definition.schema.title ||
                            n.definition.values[0]?.value ||
                            n.path}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </DialogHeader>
        <DataViewDepthProvider depth={0}>
          <div className="flex w-full relative">
            <AnimatePresence>
              <motion.div
                key={node.path}
                style={{ width: "100%", flexShrink: 0, position: "absolute" }}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
              >
                <NodeValue node={node} />
              </motion.div>
            </AnimatePresence>
          </div>
        </DataViewDepthProvider>
      </DialogContent>
    </Dialog>
  );
};

const ArrayCell = ({ node }: NodeComponentProps) => {
  const { setPath } = useDataViewDialog();
  const depth = useDataViewDepth();

  const itemCount = node.children.length;

  if (depth === 0) {
    return (
      <DataViewDepthProvider>
        <ValueTable definition={node.definition} defaultOpen={false} />
      </DataViewDepthProvider>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="flex gap-x-2 px-3 w-full items-center group/custom-inline-edit h-full">
        &mdash;
      </div>
    );
  }

  return (
    <ButtonCell
      className="px-3"
      onClick={() => {
        setPath(node.path);
      }}
    >
      <span className="font-semibold">View Collection</span>{" "}
      <span className="ml-1 text-xs opacity-30">
        ({itemCount} item{itemCount === 1 ? "" : "s"})
      </span>
    </ButtonCell>
  );
};

const ObjectCell = ({ node }: NodeComponentProps) => {
  return <NodeValue node={node} />;
};

const CellEditButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof EditButton>
>(({ className, ...props }, ref) => {
  return (
    <EditButton
      ref={ref}
      className={cn(
        "opacity-0 focus:opacity-100 group-hover/custom-inline-edit:opacity-100 h-6 w-8 p-1 shrink-0",
        className,
      )}
      size="sm"
      {...props}
    />
  );
});

export const NodeValue = ({
  node,
}: NodeComponentProps): React.JSX.Element | null => {
  const depth = useDataViewDepth();

  const schema = node.definition.schema;

  if (typeof schema !== "object" || schema === null) {
    return null;
  }

  if ("allOf" in schema) {
    return <NodeValue node={node} />;
  }

  switch (node.definition.dataType) {
    case FieldDataTypeEnum.ENTITY:
      return (
        <div className="max-w-64 min-w-64 h-full flex items-center">
          <EntityNodeReadView
            label={node.views.option?.label || node.value}
            sublabel={node.views.option?.sublabel}
          />
        </div>
      );

    case FieldDataTypeEnum.BOOLEAN:
      return (
        <IconWrapper icon={node.value ? CheckCircleIcon : XCircleIcon}>
          {node.value ? "Yes" : "No"}
        </IconWrapper>
      );

    case FieldDataTypeEnum.DATE:
      return (
        <IconWrapper icon={DATA_TYPE_ICON_MAP[FieldDataTypeEnum.DATE]}>
          {node.value || <>&mdash;</>}
        </IconWrapper>
      );

    case FieldDataTypeEnum.STRING:
    case FieldDataTypeEnum.NUMBER:
    case FieldDataTypeEnum.ENUM:
      return (
        <span className="rr-mask">
          {formatNodeValue({ value: node.value, schema: schema as any })}
        </span>
      );

    case FieldDataTypeEnum.CURRENCY:
      return (
        <Currency value={node.value.value} currency={node.value.currency} />
      );

    case FieldDataTypeEnum.OBJECT:
      if (depth === 0) {
        return <ListOfTables path={node.path} />;
      }

      if (depth < 2) {
        return (
          <DataViewDepthProvider>
            <CollapsibleValueTable
              className="border-0 rounded-none"
              definition={node.definition}
              fallback={<TableExpandCollpaseCellButton />}
            />
          </DataViewDepthProvider>
        );
      }

      return <span className="flex gap-x-1 items-center">View More</span>;

    case FieldDataTypeEnum.ARRAY:
      const itemCount = node.children.length;

      if (depth < 1) {
        return (
          <DataViewDepthProvider>
            <ValueTable definition={node.definition} defaultOpen={false} />
          </DataViewDepthProvider>
        );
      }

      if (itemCount === 0) {
        return <span>&mdash;</span>;
      }

      return (
        <span>
          View Collection ({itemCount} item{itemCount === 1 ? "" : "s"})
        </span>
      );
  }
};

const getChildren = ({
  node,
  store,
}: NodeComponentProps & { store: Map<string, EntityNodeValueType> }) => {
  return node.children.map((c) => store.get(c)!);
};

const TableCell: typeof Cell = (props) => {
  return <Cell {...props} className={cn("px-3 py-4", props.className)} />;
};

const NodeCell = ({
  node,
  className,
}: NodeComponentProps & { className?: string }) => {
  return (
    <Cell
      className={cn(
        "min-w-20 h-12 border-b border-slate-200 dark:border-midnight-400 w-auto p-0 relative",
        className,
      )}
    >
      <EditableViewNode node={node} />
    </Cell>
  );
};

const ObjectNodeCell: typeof NodeCell = (props) => {
  return <NodeCell {...props} />;
};

const ArrayNodeCell: typeof NodeCell = (props) => {
  return (
    <NodeCell
      {...props}
      className={cn(
        "min-w-20 h-12 border-b border-slate-200 dark:border-midnight-600 text-wrap py-0 px-0",
        {
          "min-w-96":
            props.node.definition.dataType === FieldDataTypeEnum.STRING,
          "min-w-40":
            props.node.definition.dataType === FieldDataTypeEnum.NUMBER,
        },
        props.className,
      )}
    />
  );
};

const ObjectTable = ({ definition, ariaLabelledBy, className }: TableProps) => {
  const isRoot = typeof definition.parent === "undefined";
  const nodes = isRoot
    ? definition.values.filter(
        (value) => value.definition.dataType !== FieldDataTypeEnum.ARRAY,
      )
    : definition.values;

  return (
    <Table
      className={className}
      aria-labelledby={ariaLabelledBy}
      scrollable={false}
    >
      <tbody>
        {nodes.map((node) => (
          <TableCollapseProvider key={node.path}>
            <tr key={node.path} className="border-b dark:border-white group">
              <TableCell
                as="th"
                scope="row"
                className="text-wrap h-12 py-0 border-r border-b border-b-slate-200 border-r-slate-200 dark:border-midnight-400 w-56"
              >
                <div className="flex gap-x-2">
                  <span className="rr-mask">
                    {node.definition.schema.title}
                  </span>
                  {node.definition.dataType === FieldDataTypeEnum.OBJECT && (
                    <TableExpandButton />
                  )}
                </div>
              </TableCell>
              <ObjectNodeCell node={node} />
            </tr>
          </TableCollapseProvider>
        ))}
      </tbody>
    </Table>
  );
};

const ArrayTableHeader = ({
  className,
  dataType,
  children,
}: {
  dataType: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const alignment = useNumericAlignment();
  const alignRight =
    alignment === "right" &&
    [FieldDataTypeEnum.NUMBER, FieldDataTypeEnum.CURRENCY].some(
      (t) => dataType === t,
    );

  return (
    <TableCell
      as="th"
      scope="col"
      className={cn(
        "border-b",
        {
          "text-right": alignRight,
        },
        className,
      )}
    >
      {children}
    </TableCell>
  );
};

const ArrayTable = ({ definition, ariaLabelledBy, className }: TableProps) => {
  const depth = useDataViewDepth();
  const { valueStore: store } = useDataContext();
  const firstRow = getChildren({ store, node: definition.values[0] });

  return (
    <NumericAlignment alignment="right">
      <Table
        aria-labelledby={ariaLabelledBy}
        className={cn(
          {
            "w-full": depth > 0,
          },
          className,
        )}
      >
        <thead className="sticky top-0 z-10">
          <tr className="group">
            {firstRow.map((value) => (
              <ArrayTableHeader
                dataType={value.definition.dataType}
                key={value.definition.schema.title}
              >
                {value.definition.schema.title}
              </ArrayTableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {definition.values.map((value, i) => (
            <tr
              key={i}
              className="border-b dark:border-midnight-500 border-dashed"
            >
              {getChildren({ store, node: value }).map((node) => (
                <ArrayNodeCell
                  key={node.path}
                  node={node}
                  className={cn({
                    "dark:bg-midnight-900 bg-stone-50/50": i % 2 === 1,
                  })}
                />
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {firstRow.map((col, i) => {
              if (col.definition.dataType !== FieldDataTypeEnum.NUMBER) {
                return (
                  <Cell
                    as="th"
                    scope="col"
                    key={i}
                    className="px-7 py-3 dark:border-t text-right"
                  />
                );
              }

              const sum = definition.values
                .reduce((acc, cur) => {
                  const value = getChildren({ store, node: cur })[i];
                  if (typeof value.value !== "number") return acc;
                  return acc + value.value;
                }, 0)
                .toFixed(2);

              return (
                <Cell
                  as="th"
                  scope="col"
                  key={i}
                  className="px-4 py-3 dark:border-t text-right"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold">Total</span>
                    <span>{sum}</span>
                  </div>
                </Cell>
              );
            })}
          </tr>
        </tfoot>
      </Table>
    </NumericAlignment>
  );
};

type TableProps = {
  definition: EntityNodeDefinitionType;
  ariaLabelledBy?: string;
  defaultOpen?: boolean;
  className?: string;
};

const ValueTable = ({ definition, ariaLabelledBy, className }: TableProps) => {
  if (!definition.children.length) {
    return <div className="text-sm">No properties defined</div>;
  }

  if (definition.dataType === FieldDataTypeEnum.OBJECT) {
    return (
      <ObjectTable
        definition={definition}
        ariaLabelledBy={ariaLabelledBy}
        className={className}
      />
    );
  }

  if (definition.dataType === FieldDataTypeEnum.ARRAY) {
    if (!definition.values.length) {
      return <div>No items found</div>;
    }

    return (
      <ArrayTable
        definition={definition}
        ariaLabelledBy={ariaLabelledBy}
        className={className}
      />
    );
  }

  return null;
};

const getCellView = (node: EntityNodeValueType) => {
  switch (node.definition.dataType) {
    case FieldDataTypeEnum.STRING:
      return StringCell;
    case FieldDataTypeEnum.NUMBER:
      return NumberCell;
    case FieldDataTypeEnum.CURRENCY:
      return CurrencyCell;
    case FieldDataTypeEnum.DATE:
      return DateCell;
    case FieldDataTypeEnum.BOOLEAN:
      return BooleanCell;
    case FieldDataTypeEnum.ENUM:
      return EnumCell;
    case FieldDataTypeEnum.ARRAY:
      return ArrayCell;
    case FieldDataTypeEnum.ENTITY:
      return EntityCell;
    case FieldDataTypeEnum.OBJECT:
      return ObjectCell;
  }
};

export const EditableViewNode = ({ node }: NodeComponentProps) => {
  const Component = getCellView(node);

  return <Component node={node} />;
};

export const CollapsibleValueTable = ({
  defaultOpen,
  fallback,
  ...tableProps
}: Omit<TableProps, "node"> & {
  definition: EntityNodeDefinitionType;
  fallback?: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const { expanded } = useTableCollapse();

  if (!expanded) {
    return fallback ?? null;
  }

  return (
    <DataViewDepthProvider>
      <ValueTable {...tableProps} />
    </DataViewDepthProvider>
  );
};

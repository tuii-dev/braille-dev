"use client";

import { Fragment, useState } from "react";

import { PlusCircleIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { EntityNodeDefinition } from "@/lib/model/entities";
import { FieldDataType, FieldDataTypeEnum } from "@/lib/model/ui";

import {
  DepthProvider,
  useDepth,
  useModel,
  useStructureTable,
} from "./context";
import { RowCell, TableHeadCell, TableRow } from "./elements";
import { ListExpandButton } from "./list-expand-button";

const NESTING_GAP = 36;

type ChildToParentLinesProps = {
  nodeType?: FieldDataType;
};

const ChildToParentLines = ({ nodeType }: ChildToParentLinesProps) => {
  const isExpandable =
    nodeType &&
    [FieldDataTypeEnum.ARRAY, FieldDataTypeEnum.OBJECT].find(
      (type) => type === nodeType,
    );

  const depth = useDepth();

  return (
    <Fragment>
      {!!depth && (
        <>
          {isExpandable ? (
            <span
              data-testid="horizontal-bar"
              style={{
                left: isExpandable
                  ? (depth + 1) * NESTING_GAP + 1
                  : depth * NESTING_GAP + NESTING_GAP + 1,
                right: NESTING_GAP * 2,
                top: "calc(50% - 1px)",
              }}
              className="h-[1px] bg-slate-200 dark:bg-white/20 absolute"
            />
          ) : (
            <span
              data-testid="horizontal-bar"
              style={{
                left: isExpandable
                  ? (depth + 1) * NESTING_GAP + 1
                  : depth * NESTING_GAP + NESTING_GAP + 1,
                right: -((depth - 1) * NESTING_GAP + NESTING_GAP * 0.5),
                top: "calc(50% - 1px)",
              }}
              className="h-[1px] bg-slate-200 dark:bg-white/20 absolute"
            />
          )}
          {!!nodeType && !isExpandable && (
            <span
              data-testid="horizontal-bar-end"
              style={{
                height: 3,
                width: 3,
                right: -((depth - 1) * NESTING_GAP + NESTING_GAP * 0.5),
                top: "calc(50% - 1px)",
              }}
              className="rounded-full bg-slate-200 dark:bg-white/50 absolute -translate-y-1/2"
            />
          )}
        </>
      )}
      {new Array(depth).fill(null).map((_, i, arr) => (
        <span
          data-testid="vertical-bars"
          key={i}
          style={{
            top: -1,
            left: (i + 1) * NESTING_GAP + NESTING_GAP,
            height:
              !nodeType && i === arr.length - 1 ? "50%" : "calc(100% + 2px)",
          }}
          className={cn(["bg-slate-200 dark:bg-white/20 w-px absolute"])}
        />
      ))}
    </Fragment>
  );
};

const isNodeExpandable = (node: EntityNodeDefinition) => {
  return [FieldDataTypeEnum.ARRAY, FieldDataTypeEnum.OBJECT].find(
    (type) => type === node.dataType,
  );
};

type TreeNodeRowProps = {
  nodeId: string;
  bgColor: string;
};

export const TreeNodeRow = ({ nodeId, bgColor }: TreeNodeRowProps) => {
  const { state, nodes, tableSchema } = useStructureTable();
  const depth = useDepth();
  const node = nodes.get(nodeId);

  if (!node) {
    throw new Error("Could not access node");
  }

  const isExpanded = state.expandedLists.has(node.path);

  return (
    <Fragment>
      <TableRow
        className={cn(bgColor, "group")}
        cells={{ className: cn(["relative pr-3 text-right"]) }}
      >
        <RowCell
          className={["text-left relative z-10"]}
          style={{ paddingLeft: NESTING_GAP * 1.5 }}
        >
          <ChildToParentLines nodeType={node.dataType} />
          {isNodeExpandable(node) && (
            <Fragment>
              <div
                className="inline-flex justify-center"
                style={{
                  width: NESTING_GAP,
                  transform: `translateX(${depth * NESTING_GAP}px)`,
                }}
              >
                <ListExpandButton path={node.path} />
              </div>
              {state.expandedLists.has(node.path) && (
                <span
                  data-testid="expand-vertical-bar"
                  style={{
                    top: "calc(50% + 12px)",
                    height: "calc(50% - 12px)",
                    left: depth * NESTING_GAP + NESTING_GAP * 2,
                  }}
                  className="bg-slate-200 dark:bg-white/20  w-px absolute h-1/2"
                />
              )}
            </Fragment>
          )}
        </RowCell>
        {[...tableSchema.values()].map((schema, i) => {
          const style =
            i === 0 && depth ? { paddingLeft: depth * NESTING_GAP } : undefined;

          return (
            <RowCell key={schema.name} style={style}>
              {schema.render?.cell?.({ node })}
            </RowCell>
          );
        })}
      </TableRow>
      {isExpanded && (
        <DepthProvider>
          {"children" in node &&
            Array.from(node.children.values())
              .toSorted((a, b) => a.path.localeCompare(b.path))
              .map((child, i) => (
                <TreeNodeRow
                  key={child.path}
                  nodeId={child.path}
                  bgColor={
                    i % 2 === 1
                      ? "dark:bg-midnight-850"
                      : "dark:bg-midnight-800"
                  }
                />
              ))}
          {isNodeExpandable(node) && (
            <TableRow
              className={cn(bgColor)}
              cells={{ className: cn(["pl-6", "relative"]) }}
            >
              <InsertTreeNodeCells parentNodeId={node.path} />
            </TableRow>
          )}
        </DepthProvider>
      )}
    </Fragment>
  );
};

type InsertTreeNodeCellsProps = {
  parentNodeId: string;
};

export const InsertTreeNodeCells = ({
  parentNodeId,
}: InsertTreeNodeCellsProps) => {
  const { tableSchema } = useStructureTable();
  const [state, setState] = useState<"insert" | null>(null);
  const depth = useDepth();
  const { nodes } = useModel();

  const parent = nodes.get(parentNodeId);

  if (!parent) {
    throw new Error("Could not access parent node");
  }

  if (state === "insert") {
    return (
      <Fragment>
        <RowCell className="border-b-0">
          <ChildToParentLines />
        </RowCell>
        {[...tableSchema.values()].map((schema, i) => {
          const paddingLeft =
            i === 0 ? depth * NESTING_GAP - NESTING_GAP / 2 : undefined;

          return (
            <RowCell
              key={schema.name}
              className="border-b-0"
              style={{
                paddingLeft,
              }}
            >
              {schema.render?.insert?.({
                parent,
                onInsert: () => setState(null),
                cancel: () => setState(null),
              })}
            </RowCell>
          );
        })}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <RowCell className="px-0 border-b-0">
        <ChildToParentLines />
      </RowCell>
      <RowCell
        className="px-0 border-b-0 py-6"
        style={{ paddingLeft: depth * NESTING_GAP - NESTING_GAP / 2 }}
        colSpan={tableSchema.size}
      >
        <div className={"flex gap-x-4 items-baseline"}>
          <Button
            onClick={() => setState("insert")}
            className="border-slate-300"
            variant="minimal"
            icon={<PlusCircleIcon className="w-5 h-5" />}
            size="sm"
          >
            Add Field
          </Button>
        </div>
      </RowCell>
    </Fragment>
  );
};

export const Rows = () => {
  const { nodes } = useModel();
  const rootNode = Array.from(nodes.values()).find((node) => !node.parent)!;

  const rootProperties = Array.from(rootNode.children.values())
    .toSorted((a, b) => a.path.localeCompare(b.path))
    .toSorted((a, b) =>
      isNodeExpandable(a) == isNodeExpandable(b)
        ? 0
        : !isNodeExpandable(a)
          ? -1
          : 1,
    );

  return (
    <tbody>
      {rootProperties.map((node, i) => (
        <TreeNodeRow
          key={node.path}
          nodeId={node.path}
          bgColor={
            i % 2 === 0
              ? "bg-gray-300/10 dark:bg-midnight-800"
              : " bg-gray-100/20 dark:bg-midnight-700"
          }
        />
      ))}
      <TableRow>
        <InsertTreeNodeCells parentNodeId={rootNode.path} />
      </TableRow>
    </tbody>
  );
};

export const Head = () => {
  const { tableSchema } = useStructureTable();

  const columns = [
    {
      label: "Expand",
      name: "expand",
      width: 48,
      srOnly: true,
    },
    ...tableSchema.values(),
  ];

  return (
    <thead>
      <TableRow cells={{ className: "pl-2" }}>
        {columns.map((column) => (
          <TableHeadCell key={column.name} width={column.width}>
            {column.srOnly ? (
              <span className="sr-only">{column.label}</span>
            ) : (
              column.label
            )}
          </TableHeadCell>
        ))}
      </TableRow>
    </thead>
  );
};

"use client";

import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";
import { DATA_TYPE_ICON_MAP, FieldDataType } from "@/lib/model/ui";

export const DataTypeIcon = ({
  dataType,
  className,
}: {
  dataType: FieldDataType;
  className?: string;
}) => {
  const Icon = DATA_TYPE_ICON_MAP[dataType];

  return <Icon className={className} />;
};

const TableRowContext = createContext<{
  className?: string;
}>({});

export const TableRow = ({
  cells,
  className,
  children,
}: {
  cells?: {
    className?: string;
  };
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <TableRowContext.Provider value={{ className: cells?.className }}>
      <tr className={className}>{children}</tr>
    </TableRowContext.Provider>
  );
};

export const RowCell = ({
  className,
  children,
  colSpan,
  width,
  style,
}: {
  width?: number;
  colSpan?: number;
  className?: string | string[];
  children?: React.ReactNode;
  style?: {};
}) => {
  const rowContext = useContext(TableRowContext);

  return (
    <td
      style={style}
      className={cn(
        rowContext.className,
        // "dark:border-midnight-500/50 whitespace-nowrap px-3 py-4 text-sm dark:text-gray-100 pr-3 h-20 border-b border-gray-200/40",
        "dark:border-midnight-500/50 whitespace-nowrap px-3 py-3.5 text-sm dark:text-gray-100 pr-3 h-20 border-b border-gray-200/40",
        ...[Array.isArray(className) ? className.filter(Boolean) : [className]],
      )}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export const TableHeadCell = ({
  className,
  minWidth,
  width,
  children,
}: {
  width?: number;
  minWidth?: number;
  className?: string;
  children?: React.ReactNode;
}) => {
  const rowContext = useContext(TableRowContext);

  return (
    <th
      scope="col"
      style={{ width, minWidth }}
      className={cn(
        rowContext.className,
        className,
        "sticky top-0 z-10 border-b dark:bg-midnight-900 dark:border-midnight-500 border-t py-3.5 pr-3 text-left text-sm font-semibold dark:text-gray-200 backdrop-blur backdrop-filter",
      )}
    >
      {children}
    </th>
  );
};

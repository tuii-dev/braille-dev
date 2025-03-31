import { Scrollbars } from "@/components/scrollbars";
import { cn } from "@/lib/utils";
import React from "react";

export const Table = ({
  "aria-labelledby": ariaLabelledBy,
  className,
  scrollable,
  autoHeightMax,
  children,
}: React.DetailedHTMLProps<
  React.TableHTMLAttributes<HTMLTableElement>,
  HTMLTableElement
> & { scrollable?: boolean; autoHeightMax?: string | number }) => {
  if (scrollable === false) {
    return (
      <div
        className={cn(
          "rounded border border-slate-300 dark:border-midnight-400 overflow-visible",
          className,
        )}
      >
        <table
          aria-labelledby={ariaLabelledBy}
          className="w-full whitespace-nowrap text-left table-auto"
        >
          {children}
        </table>
      </div>
    );
  }

  return (
    <Scrollbars
      autoHeight
      autoHeightMax={autoHeightMax ?? 5000}
      className={cn(
        "rounded border border-slate-300 dark:border-midnight-400",
        className,
      )}
    >
      <table
        aria-labelledby={ariaLabelledBy}
        className="w-full whitespace-nowrap text-left table-auto"
      >
        {children}
      </table>
    </Scrollbars>
  );
};

export const THead = ({ children }: { children?: React.ReactNode }) => {
  return (
    <thead className="dark:text-gray-200 sticky top-0 z-10">{children}</thead>
  );
};

export const Cell = ({
  as = "td",
  scope,
  className,
  children,
  colSpan,
}: {
  as?: "th" | "td";
  scope?: "col" | "row";
  className?: string;
  colSpan?: number;
  children?: React.ReactNode;
}) => {
  const Component = as;

  return (
    <Component
      scope={scope}
      colSpan={colSpan}
      className={cn(
        "py-2 p-4 dark:text-white text-xs xl:text-[13px] border-slate-200 dark:border-midnight-400",
        {
          "bg-slate-50 dark:bg-midnight-700": !!scope,
          "dark:bg-midnight-800": !scope,
          "border-r": scope === "row",
          "border-b": scope === "col",
        },
        className,
      )}
    >
      {children}
    </Component>
  );
};

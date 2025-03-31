import React, { createContext, useContext, useState } from "react";

import { Expand, Minus } from "lucide-react";

import { Button } from "@/components/button";

import { ExpandButton } from "../../expand-button";
import { ButtonCell } from "../cell-button";

const TableCollapseContext = createContext<{
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}>({ expanded: false, setExpanded: () => {} });

export const TableCollapseProvider = ({
  defaultOpen,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? true); // Default to open

  return (
    <TableCollapseContext.Provider
      value={{ expanded: isOpen, setExpanded: setIsOpen }}
    >
      {children}
    </TableCollapseContext.Provider>
  );
};

export const useTableCollapse = () => {
  return useContext(TableCollapseContext);
};

export const withTableCollapse =
  <Props extends {}>(Component: React.ComponentType<Props>) =>
  (props: Props) => {
    return (
      <TableCollapseProvider>
        <Component {...props} />
      </TableCollapseProvider>
    );
  };

export const TableExpandCollpaseCellButton = () => {
  const { expanded, setExpanded } = useTableCollapse();
  const Icon = expanded ? Minus : Expand;

  return (
    <ButtonCell
      onClick={() => setExpanded((prev) => !prev)}
      className="px-3 group"
    >
      <span className="inline-flex gap-2 items-center">
        <Icon className="w-4 h-4" />
        <span>{expanded ? "Collapse" : "Expand"}</span>
      </span>
    </ButtonCell>
  );
};

export const TableExpandCollapseButton = () => {
  const { expanded, setExpanded } = useTableCollapse();

  const Icon = expanded ? Minus : Expand;
  return (
    <Button
      variant="minimal"
      icon={<Icon className="w-5 h-5" />}
      size="sm"
      onClick={() => setExpanded((prev) => !prev)}
    >
      {expanded ? "Collapse" : "Expand"}
    </Button>
  );
};

export const TableExpandButton = () => {
  const { expanded, setExpanded } = useTableCollapse();

  return (
    <ExpandButton
      expanded={expanded}
      variant="plusminus"
      className="w-5 h-5"
      onClick={() => setExpanded((prev) => !prev)}
    />
  );
};

"use client";

import { forwardRef } from "react";

import { useStructureTable } from "../context";
import { ExpandButton } from "../../expand-button";

export const ListExpandButton = forwardRef<HTMLButtonElement, { path: string }>(
  ({ path }, ref) => {
    const { state, setState } = useStructureTable();

    return (
      <ExpandButton
        ref={ref}
        expanded={state.expandedLists.has(path)}
        onClick={() => {
          setState((prev) => {
            const expanded = prev.expandedLists.has(path);

            return {
              ...prev,
              expandedLists: expanded
                ? new Set([
                    ...Array.from(prev.expandedLists).filter((x) => x !== path),
                  ])
                : new Set([...Array.from(prev.expandedLists), path]),
            };
          });
        }}
      />
    );
  },
);

ListExpandButton.displayName = "ListExpandButton";

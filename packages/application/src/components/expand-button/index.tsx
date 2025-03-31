"use client";

import { forwardRef } from "react";

import {
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";

import { cn } from "@/lib/utils";

import { Button } from "../button";

type ExpandButtonProps = {
  expanded: boolean;
  onClick: () => void;
  className?: string;
  variant?: "chevron" | "plusminus";
};

export const ExpandButton = forwardRef<HTMLButtonElement, ExpandButtonProps>(
  ({ expanded, onClick, className, variant = "chevron" }, ref) => {
    return (
      <Button
        ref={ref}
        variant="minimal"
        type="button"
        className={cn(
          "w-6 h-6 shrink-0 rounded-full p-0 flex items-center justify-center border-slate-300 dark:bg-midnight-900 dark:hover:bg-midnight-600 relative",
          className,
        )}
        icon={
          variant === "chevron" ? (
            <ChevronDownIcon
              className={cn(["w-4 h-4", expanded ? "rotate-0" : "-rotate-90"])}
            />
          ) : expanded ? (
            <MinusIcon className="w-3 h-3" />
          ) : (
            <PlusIcon className="w-3 h-3" />
          )
        }
        onClick={onClick}
      />
    );
  },
);

ExpandButton.displayName = "ExpandButton";

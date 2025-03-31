"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/app/_helpers/workspace-settings-context";

type ColorProps = {
  workspaceId: string;
  name: string;
  value?: string;
  className?: string;
  form?: string;
  type?: string;
  defaultValue?: string;
};

export const ColorInput = ({
  workspaceId,
  name,
  type = "color",
  form,
  className,
  defaultValue,
  value,
}: ColorProps) => {
  const { color, setOverride } = useWorkspaceContext(workspaceId);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOverride(event.target.value);
  };

  return (
    <label
      className={cn(
        "w-1/4 rounded-md cursor-pointer min-h-10 border-0 dark:bg-midnight-500 py-1.5 dark:text-white shadow-sm ring-2 ring-inset ring-[#C9C9C9] dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <input
        style={{
          background: "none",
          padding: 0,
          visibility: "hidden", // Keeps the input hidden
        }}
        id={name}
        name={name}
        type={type}
        form={form}
        value={color}
        onChange={handleColorChange}
      />
    </label>
  );
};

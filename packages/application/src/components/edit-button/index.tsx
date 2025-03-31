"use client";

import { forwardRef } from "react";

import { PencilSquareIcon } from "@heroicons/react/20/solid";

import { Button } from "../button";

export const EditButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  return (
    <Button
      ref={ref}
      className="py-1 px-2"
      variant="minimal"
      size="sm"
      icon={<PencilSquareIcon className="w-3 h-3" />}
      {...props}
    />
  );
});

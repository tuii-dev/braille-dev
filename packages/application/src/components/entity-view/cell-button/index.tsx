import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const ButtonCell = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        "w-full h-full flex justify-start items-center hover:bg-slate-400/20 dark:hover:bg-midnight-400/20 ",
        props.className,
      )}
    />
  );
});

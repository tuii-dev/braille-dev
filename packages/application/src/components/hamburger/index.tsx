import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type HamburgerProps = { isOpen?: boolean; onClick?: () => void };

export const Hamburger = forwardRef<HTMLButtonElement, HamburgerProps>(
  ({ onClick, isOpen }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "appearance-none justify-between p-2 hover:bg-slate-100 dark:hover:bg-midnight-400 rounded",
          {
            "hover:bg-slate-100 dark:bg-midnight-400": isOpen,
          },
        )}
      >
        <span className="w-[16px] flex flex-col gap-[2px] xl:w-[20px] xl:gap-[4px]">
          <span className="h-[2px] bg-black dark:bg-white"></span>
          <span className="h-[2px] bg-black dark:bg-white"></span>
          <span className="h-[2px] bg-black dark:bg-white"></span>
        </span>
      </button>
    );
  },
);

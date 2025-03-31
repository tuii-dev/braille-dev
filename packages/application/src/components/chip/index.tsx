import { Fragment } from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export const Chip = ({
  icon,
  label,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) => {
  const stylesBase =
    "inline-flex items-center rounded-md dark:border-0 border border-indigo-600 text-indigo-600 dark:bg-indigo-400/10 px-2 py-1 text-xs font-medium dark:text-indigo-100";

  const children = (
    <Fragment>
      {icon}
      {label}
    </Fragment>
  );

  if (onClick) {
    return (
      <button
        className={cn(
          stylesBase,
          "hover:bg-red-400/20 hover:text-red-400 hover:ring-red-400/30 focus:bg-red-400/20 focus:text-red-400 focus:ring-red-400/30 dark:hover:bg-red-400/20",
          className,
        )}
        onClick={onClick}
      >
        {children}{" "}
        <div>
          <XCircleIcon className="ml-1 w-3 h-3" />
        </div>
      </button>
    );
  }
  return <span className={cn(stylesBase, className)}>{children}</span>;
};

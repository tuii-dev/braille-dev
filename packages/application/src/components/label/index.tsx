import { cn } from "@/lib/utils";

export const Label = ({
  name,
  className,
  children,
  required,
}: {
  name: string;
  className?: string;
  children: string;
  required?: boolean;
}) => {
  return (
    <label
      htmlFor={name}
      className={cn(
        "w-full block text-sm font-semibold leading-6 text-neutral-800 dark:text-gray-200",
        className,
      )}
    >
      {children}
      {required && <span className="super text-red-400">*</span>}
    </label>
  );
};

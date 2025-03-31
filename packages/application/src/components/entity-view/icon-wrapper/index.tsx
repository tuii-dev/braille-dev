import { CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const IconWrapper = ({
  icon: Icon,
  iconClassname,
  className,
  children,
}: {
  icon: typeof CheckCircleIcon;
  className?: string;
  iconClassname?: string;
  children: React.ReactNode;
}) => {
  return (
    <span className={cn("flex items-center gap-x-2", className)}>
      <Icon
        className={cn(
          "h-5 w-5 text-gray-800 dark:text-gray-300 shrink-0",
          iconClassname,
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
};

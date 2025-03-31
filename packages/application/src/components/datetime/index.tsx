import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function TimeString({
  children,
  className,
}: {
  children?: Date;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <span className={cn("dark:text-gray-200", className)}>
      {children?.toLocaleTimeString("en-AU", {
        timeStyle: "short",
        timeZone: "Australia/Brisbane",
      })}
    </span>
  );
}

export function DateString({
  children,
  className,
}: {
  children?: Date;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <span className={cn("dark:text-gray-200", className)}>
      {children?.toLocaleDateString("en-AU", {
        timeZone: "Australia/Brisbane",
      })}
    </span>
  );
}

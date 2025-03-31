"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "../button";
import { Fragment, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useProgress } from "../client";

export const Submit = ({
  children,
  className,
  ...props
}: ButtonProps & {
  children?: React.ReactNode;
}) => {
  const { pending } = useFormStatus();
  const { busy } = useProgress();
  const ref = useRef<HTMLButtonElement>(null);
  const widthRef = useRef(60);
  const heightRef = useRef(38);

  useEffect(() => {
    if (pending) {
      return busy();
    }
  }, [pending, busy]);

  useEffect(() => {
    widthRef.current = ref.current?.offsetWidth || 60;
    heightRef.current = ref.current?.offsetHeight || 38;
  });

  return (
    <Button
      ref={ref}
      as="button"
      type="submit"
      variant="primary"
      style={{
        minWidth: pending ? `${widthRef.current}px` : 0,
        minHeight: pending ? `${heightRef.current}px` : 0,
      }}
      className={cn("justify-center", className)}
      onClick={(e) => {
        if (props["aria-disabled"] || pending) {
          e.preventDefault();
        }
      }}
      {...props}
      icon={pending ? null : props.icon}
    >
      {children && (
        <Fragment>
          {pending ? (
            <svg
              className="animate-spin h-4 w-4 text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            children
          )}
        </Fragment>
      )}
    </Button>
  );
};

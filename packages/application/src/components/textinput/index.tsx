import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

type CommonProps = {
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  form?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  defaultValue?: string;
  value?: string;
  readOnly?: boolean;
};

type InputProps = Omit<
  React.HTMLAttributes<HTMLInputElement>,
  keyof CommonProps
> &
  CommonProps;

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      type = "text",
      required,
      placeholder,
      form,
      autoFocus,
      onBlur,
      defaultValue,
      value,
      className,
      readOnly,
      ...props
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        {...props}
        readOnly={readOnly}
        id={name}
        name={name}
        type={type}
        autoComplete="off"
        required={required}
        form={form}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={onBlur}
        className={cn(
          "block w-full rounded-[6px] min-h-10 font-normal text-sm focus:border-transparent border-transparent bg-[#ECECEC] focus:bg-white dark:bg-[#111111] py-2 dark:text-white focus:dark:ring-[#C9C9C9] dark:focus:ring-white/80 focus:ring-2 focus:ring-cyan-400 sm:leading-6",
          {
            "bg-blue-100": readOnly,
          },
          className,
        )}
        defaultValue={defaultValue}
        value={value}
        spellCheck={false}
      />
    );
  },
);

TextInput.displayName = "TextInput";

type TextareaProps = Omit<
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >,
  keyof CommonProps
> &
  CommonProps;

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      name,
      required,
      placeholder,
      form,
      autoFocus,
      onBlur,
      defaultValue,
      value,
      readOnly,
      rows,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <textarea
        ref={ref}
        {...props}
        rows={rows}
        spellCheck={false}
        readOnly={readOnly}
        id={name}
        name={name}
        autoComplete="off"
        required={required}
        form={form}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={onBlur}
        className={cn(
          "block w-full max-w-full rounded min-h-10 border border-slate-200 dark:border-midnight-400 bg-white dark:bg-midnight-700 py-1.5 dark:text-white focus:dark:ring-[#C9C9C9] dark:focus:ring-white/80 focus:ring-2 focus:ring-[#567CF0] sm:text-sm sm:leading-6",
          {
            "bg-blue-100": readOnly,
          },
          className,
        )}
        defaultValue={defaultValue}
        value={value}
      />
    );
  },
);

TextArea.displayName = "TextArea";

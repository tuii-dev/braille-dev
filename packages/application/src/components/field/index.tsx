"use client";

import React, { Fragment } from "react";
import { useZorm, type Zorm } from "react-zorm";
import { TextInput } from "../textinput";
import { Select } from "../select";
import { cn } from "@/lib/utils";
import { EnumInput } from "../enum-field";
import { ColorInput } from "../color-picker-field";
import { Combobox, ComboboxProps } from "../combobox";
import { Label } from "../label";
import { useProgress } from "../client";

const zoContext = React.createContext<Zorm<any> | null>(null);

export const Form = ({
  name,
  schema,
  action,
  children,
  onSuccess,
  onError,
  ...props
}: Omit<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >,
  "action"
> & {
  schema: any;
  name: string;
  action: (
    formData: FormData,
  ) => Promise<any | { error: Record<string, string[]> }>;
  onSuccess?: (result: unknown) => void;
  onError?: (err: string | { error: Record<string, string[]> }) => void;
}) => {
  const zo = useZorm(name, schema);
  const { monitorProgress } = useProgress();

  return (
    <zoContext.Provider value={zo}>
      <form
        action={monitorProgress(async (formData) => {
          const result = await action(formData);

          if (result && "error" in result) {
            onError?.(result.error);
          } else {
            onSuccess?.(result);
          }
        })}
        {...props}
      >
        {children}
      </form>
    </zoContext.Provider>
  );
};

const useFormFieldValidation = () => {
  return React.useContext(zoContext);
};

type BaseProps = {
  label?: string;
  name: string;
  errors?: string[];
  helperText?: string;
};

type TextFieldProps = {
  type: "text";
} & React.ComponentProps<typeof TextInput>;

type EmailFieldProps = {
  type: "email";
} & React.ComponentProps<typeof TextInput>;

type SelectFieldProps = {
  type: "select";
} & React.ComponentProps<typeof Select>;

type EnumFieldProps = {
  type: "enum";
} & React.ComponentProps<typeof EnumInput>;

type ColorFieldProps = {
  type: "color";
} & React.ComponentProps<typeof ColorInput>;

type ComboBoxFieldProps = { type: "combobox" } & ComboboxProps<
  { value: string; label: string },
  string
>;

type FieldProps =
  | TextFieldProps
  | EmailFieldProps
  | SelectFieldProps
  | ComboBoxFieldProps
  | EnumFieldProps
  | ColorFieldProps;

export default function Field({
  label,
  name,
  errors,
  helperText,
  ...props
}: BaseProps & FieldProps) {
  const zo = useFormFieldValidation();

  return (
    <div>
      {label && (
        <Label
          className="mb-2"
          name={name}
          required={"required" in props && props.required}
        >
          {label}
        </Label>
      )}
      <div className={cn({ flex: helperText, "w-full": true })}>
        <div className={cn({ "w-full": true }, { "w-1/2": helperText })}>
          {props.type === "text" && (
            <TextInput name={name} placeholder={label} {...props} />
          )}
          {props.type === "email" && (
            <TextInput name={name} placeholder={label} {...props} />
          )}
          {props.type === "select" && <Select name={name} {...props} />}
          {props.type === "combobox" && <Combobox name={name} {...props} />}
          {props.type === "enum" && (
            <EnumInput name={name} placeholder={label} {...props} />
          )}
          {props.type === "color" && <ColorInput name={name} {...props} />}
          {errors && <p>{errors.toString()}</p>}
        </div>
        {helperText && (
          <aside className="px-4 w-1/2">
            <p className="text-xs text-gray-500">{helperText}</p>
          </aside>
        )}
      </div>
    </div>
  );
}

export const FormField = Field;

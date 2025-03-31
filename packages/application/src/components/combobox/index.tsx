"use client";

import React, {
  useState,
  ChangeEvent,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { mergeRefs } from "react-merge-refs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/chadcn/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { useThrottle } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";
import { ProgressBar } from "@/components/client";
import { genericForwardRef } from "@/lib/forward-ref";

// Custom CommandInput component
const CommandInput = React.forwardRef<
  React.ElementRef<"input">,
  React.ComponentPropsWithoutRef<"input">
>(({ onChange, className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <input
      ref={ref}
      className={cn(
        "flex h-11 text-sm w-full rounded-md bg-transparent py-3 text-inherit outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onChange={onChange}
      {...props}
    />
  </div>
));

CommandInput.displayName = "CommandInput";

const TriggerContent = <
  Option extends { label: string; value: string },
  Value extends string | Option,
>({
  renderOption,
  options,
  value,
}: {
  value: Value;
  options: Option[];
  renderOption?: (option: Option) => React.ReactNode;
}) => {
  if (!value) {
    return "Select data...";
  }

  if (renderOption) {
    return renderOption(value as Option);
  }

  if (options) {
    const option = options.find((option) => option.value === value)?.label;

    if (option) {
      return option;
    }

    return "Select data...";
  }

  return typeof value === "string" ? value : value.label;
};

export type ComboboxProps<
  Option extends { label: string; value: string },
  Value = string | Option,
> = {
  value?: (Value extends string ? Value : Option) | null;
  defaultValue?: string;
  onChange: Value extends string
    ? (value: string) => void
    : (value: Option) => void;
  options?: Array<Option>;
  name?: string;
  fetchOptions?: (query: string) => Promise<Array<Option>>;
  className?: string;
  renderOption?: (option: Option) => React.ReactNode;
  width?: number;
  onBlur?: () => void;
  queryKey?: any[];
  autoFocus?: boolean;
  form?: string;
};

const ComboboxBase = <
  Option extends { label: string; value: string },
  Value = string | Option,
>(
  {
    options: optionsProp,
    value,
    defaultValue,
    onChange,
    autoFocus,
    form,
    fetchOptions,
    className,
    renderOption,
    name,
    onBlur,
    width,
    queryKey = [],
  }: ComboboxProps<Option, Value>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) => {
  const [open, setOpen] = useState(Boolean(autoFocus));
  const [query, setQuery] = useState("");
  const q = useThrottle(query, 200);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // const containerRef = React.useRef<HTMLDivElement>(null);
  const prevFocusWithin = useRef(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const handleFocusWithin = () => {
    setFocusWithin(true);
  };

  const handleBlurWithin = () => {
    setFocusWithin(false);
  };

  useEffect(() => {
    if (prevFocusWithin.current !== focusWithin) {
      if (focusWithin === false) {
        onBlur?.();
      }
    }
    prevFocusWithin.current = focusWithin;
  });

  const { data: fetchedOptions = [], isFetching } = useQuery({
    queryKey: [...queryKey, q],
    queryFn: () => {
      if (!fetchOptions) {
        return [];
      }
      return fetchOptions(q);
    },
  });

  const options = useMemo(() => {
    if (!fetchOptions) {
      return (optionsProp ?? []).filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (typeof value === "string") {
      return [
        ...fetchedOptions.filter(
          (option) =>
            !(optionsProp ?? []).find((data) => data.value === option.value),
        ),
      ];
    }

    if (!value?.value) {
      return [...(optionsProp ?? []), ...fetchedOptions].filter(
        (option) => value?.value !== option.value,
      );
    }

    return [
      value as Option,
      ...[...(optionsProp ?? []), ...fetchedOptions].filter(
        (option) => value?.value !== option.value,
      ),
    ];
  }, [optionsProp, fetchOptions, fetchedOptions, query, value]);

  return (
    // <div
    //   ref={containerRef}
    //   onBlur={handleBlurWithin}
    //   onFocus={handleFocusWithin}
    // >
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={mergeRefs([buttonRef, ref])}
          role="combobox"
          variant="minimal"
          autoFocus={autoFocus}
          aria-expanded={open}
          className={cn(
            "justify-between w-full text-sm font-normal",
            className,
          )}
        >
          <span className="flex w-full justify-between items-center">
            <TriggerContent
              options={options}
              value={value ?? ""}
              renderOption={renderOption}
            />
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        style={width ? { width } : {}}
        align="start"
        className="w-full p-0"
      >
        <Command defaultValue={defaultValue}>
          <CommandInput
            autoFocus={autoFocus}
            className={cn(
              "border-0 outline-none shadow-none ring-0 focus:ring-0 text-sm",
            )}
            placeholder="Search..."
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
          />
          <CommandList>
            {fetchOptions && <ProgressBar busy={isFetching} />}
            <CommandEmpty>No data found.</CommandEmpty>
            <CommandGroup>
              {options.map((data) => {
                const selected =
                  typeof value === "string"
                    ? data.value === value
                    : data.value === value?.value;

                return (
                  <CommandItem
                    key={data.value}
                    value={data.value}
                    onSelect={(changedValue) => {
                      buttonRef.current?.focus();
                      setOpen(false);

                      if (!onChange) {
                        return;
                      }

                      if (typeof value === "string") {
                        if (changedValue === value) {
                          onChange("" as any);
                        } else {
                          onChange(changedValue as any);
                        }
                      } else {
                        if (value?.value === changedValue) {
                          onChange({} as any);
                        } else {
                          onChange(data as any);
                        }
                      }
                    }}
                    className={cn("cursor-pointer")}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4 shrink-0", {
                        "opacity-100": selected,
                        "opacity-0": !selected,
                      })}
                    />
                    {renderOption ? renderOption(data) : data.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    // </div>
  );
};

export const Combobox = genericForwardRef(ComboboxBase);

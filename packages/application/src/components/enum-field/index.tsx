"use client";

import { ElementRef, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Chip } from "../chip";

type EnumProps = {
  name: string;
  value?: string | string[];
  className?: string;
  placeholder?: string;
  form?: string;
  autoFocus?: boolean;
};

export const EnumInput = ({
  name,
  value: _value = [],
  className,
  placeholder,
  form,
  autoFocus,
}: EnumProps) => {
  const [value, setValue] = useState(
    new Set(typeof _value === "string" ? _value.split(",") : _value),
  );
  const [input, setInput] = useState("");
  const inputRef = useRef<ElementRef<"input">>(null);

  return (
    <div
      className={cn(
        "flex w-full min-w-80 rounded-s-md rounded-e-md border  px-2 py-1.5 min-h-10 border-slate-200 shadow-none text-black bg-white dark:bg-midnight-600 dark:border-midnight-400 dark:text-white shadow-inner-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6",
        className,
      )}
    >
      <div className="flex gap-x-1 mr-2">
        {Array.from(value).map((v) => (
          <Chip
            key={v}
            label={v}
            onClick={() => {
              setValue((prev) => {
                const next = new Set(prev);
                next.delete(v);
                return next;
              });
              inputRef.current?.focus();
            }}
          />
        ))}
      </div>
      <input
        ref={inputRef}
        form="none"
        autoFocus={autoFocus}
        value={input}
        placeholder={placeholder}
        className="appearance-none w-full bg-transparent border-0 dark:text-white dark:placeholder-white/50 focus:ring-0 focus:border-0 p-0 text-sm"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const trimmed = input.trim();
            if (trimmed.length > 0) {
              setValue(
                (prev) => new Set([...Array.from(prev.values()), trimmed]),
              );

              setInput("");
              inputRef.current?.focus();
            }
          }
        }}
      />
      {Array.from(value).map((v) => (
        <input key={v} form={form} type="hidden" name={name} value={v} />
      ))}
    </div>
  );
};

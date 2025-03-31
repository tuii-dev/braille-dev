"use client";

import {
  useState,
  useId,
  createContext,
  useContext,
  SetStateAction,
  Dispatch,
  useRef,
  useEffect,
} from "react";

import { ArrowDownTrayIcon, CheckIcon } from "@heroicons/react/20/solid";

import { cn } from "@/lib/utils";
import { Thumbnail } from "@/app/workspaces/[id]/[workspaceDocument]/thumbnail";
import { DropdownMenuItem } from "@/components/dropdown-menu";

type CheckboxProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  form?: string;
  children?: ({ checked }: { checked: boolean }) => React.ReactNode;
};

export const Checkbox = ({
  className,
  name,
  value,
  checked,
  onChange,
  form,
  children,
}: CheckboxProps) => {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const pointerDownRef = useRef(false);

  return (
    <>
      {children?.({ checked })}
      <label
        htmlFor={id}
        onPointerDown={(e) => {
          pointerDownRef.current = true;
          e.preventDefault();
          onChange(!checked);
        }}
        onClick={(e) => {
          e.preventDefault();
        }}
        onMouseEnter={(e) => {
          if (e.buttons === 1 && !pointerDownRef.current) {
            onChange(!checked);
          }
          pointerDownRef.current = false;
        }}
        className={cn(
          "cursor-pointer relative block select-none focus-visible:ring-2 ring-black dark:ring-white rounded",
          className,
          {
            "opacity-100": checked || isFocused,
          },
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all m-auto inset-0 absolute h-4 w-4 rounded-sm bg-black-900/40 border dark:border-gray-200 border-slate-400",
            {
              "h-4 w-4 opacity-100 border-gray-400 dark:border-gray-100 shadow-black dark:shadow-xl":
                checked,
            },
          )}
        >
          {checked && (
            <div
              className={cn(
                "transition-all m-auto inset-0 absolute h-4 w-4 bg-slate-200 dark:bg-gray-200 flex justify-center items-center",
                {
                  "opacity-100": checked,
                },
              )}
            >
              <CheckIcon className="w-3.5 h-3.5 text-black" />
            </div>
          )}
        </div>
      </label>
      <input
        onFocus={() => setIsFocused(true)}
        onKeyDown={(e) => e.key === "Enter" && onChange(!checked)}
        onBlur={() => setIsFocused(false)}
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        className="h-0 w-0 absolute opacity-0"
        tabIndex={0}
        onChange={(e) => onChange(e.target.checked)}
        value={value}
        form={form}
      />
    </>
  );
};

type DocumentCheckboxProps = Omit<CheckboxProps, "checked" | "onChange"> & {
  status?: string | null;
  thumbnail: string | null;
};

export const DocumentCheckbox = ({
  status,
  thumbnail,
  value,
  ...checkboxProps
}: DocumentCheckboxProps) => {
  const { checked, setChecked } = useDocumentCheckbox(value);

  useEffect(() => {
    if (typeof checked !== "boolean") {
      setChecked(false);
    }
  }, [checked, setChecked]);

  return (
    <div className="w-8 relative group cursor-pointer">
      <div style={{ paddingBottom: "128%" }}></div>
      <Checkbox
        {...checkboxProps}
        value={value}
        checked={checked ?? false}
        onChange={setChecked}
        className="absolute inset-0 m-auto opacity-0 hover:opacity-100 group"
      >
        {({ checked }) => (
          <Thumbnail
            src={thumbnail}
            className={cn(
              status === "PENDING" ? "animate-pulse" : null,
              "w-8 absolute inset-0 group-hover:opacity-40 transition-all group-hover:scale-110 rounded=[2px]",
              {
                "opacity-40 group-hover:opacity-40": checked,
              },
            )}
          />
        )}
      </Checkbox>
    </div>
  );
};

const DocumentCheckboxContext = createContext<{
  state: Record<string, boolean>;
  setState: Dispatch<SetStateAction<{}>>;
}>({
  state: {},
  setState: () => {},
});

export const DocumentCheckboxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState({});

  return (
    <DocumentCheckboxContext.Provider value={{ state, setState }}>
      {children}
    </DocumentCheckboxContext.Provider>
  );
};

export const useDocumentCheckboxes = () => {
  const { state, setState } = useContext(DocumentCheckboxContext);

  return {
    state,
    setState,
    deselectAll: () => {
      setState((state) =>
        Object.keys(state).reduce(
          (acc, key) => ({
            ...acc,
            [key]: false,
          }),
          {},
        ),
      );
    },
  };
};

export const useDocumentCheckbox = (value: string) => {
  const { state, setState } = useDocumentCheckboxes();

  return {
    checked: state[value],
    setChecked: (checked: boolean) => {
      setState((prev: any) => ({
        ...prev,
        [value]: checked,
      }));
    },
  };
};

export const DownloadDocumentsButton = ({
  format,
}: {
  format: "csv" | "json";
}) => {
  const { state } = useContext(DocumentCheckboxContext);
  const selected = Object.entries(state).filter(([, checked]) => checked);

  return (
    <DropdownMenuItem asChild>
      <a
        className="flex items-center gap-x-2"
        download
        href={`/api/download?jobId=${selected
          .map(([k]) => k)
          .join(",")}&format=${format}`}
      >
        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
        {format === "json" ? `Download as JSON` : `Download as CSV`}
      </a>
    </DropdownMenuItem>
  );
};

import { useCallback, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Operation } from "fast-json-patch";
import { toast } from "sonner";

import { useProgress } from "@/components/client";
import { cn } from "@/lib/utils";

import { Combobox } from "../../combobox";
import { useDataContext } from "../data-context/context";

export const EntityNodeReadView = ({
  label,
  sublabel,
  className,
}: {
  label: string;
  sublabel?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-y-1 items-start justify-center w-full",
        className,
      )}
    >
      <span className="font-bold leading-none w-full text-ellipsis whitespace-nowrap overflow-hidden">
        {label}
      </span>
      {sublabel && (
        <span className="w-full text-nowrap text-[length:0.8em] dark:text-white/60 leading-none overflow-hidden text-ellipsis">
          {sublabel}
        </span>
      )}
    </div>
  );
};

export const RelatedEntityNode = ({
  value: defaultValue,
  path,
  autoFocus,
  className,
  entityModelId,
}: {
  value: { label: string; value: string; sublabel: string | undefined } | null;
  entityModelId: string;
  autoFocus?: boolean;
  className?: string;
  path: string;
}) => {
  const { id, mutate, invalidateData } = useDataContext();

  const [value, setValue] = useState<{
    label: string;
    value: string;
    sublabel: string | undefined;
  } | null>(defaultValue);

  const { monitorProgress } = useProgress();

  const mutation = useMutation({
    mutationFn: monitorProgress(
      async (data: { id: string; patch: Operation }) => {
        const result = await mutate(data.patch);

        if ("errors" in result) {
          console.error(result);
          throw new Error("Something went wrong");
        }
      },
    ),
    onSettled: () => {
      invalidateData();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const fetchOptions = useCallback(
    async (query: string) => {
      const response = await fetch(
        `/api/entities/options?${new URLSearchParams({ entityModelId, query })}`,
      );

      const { data } = await response.json();

      return data;
    },
    [entityModelId],
  );

  const onChange = useCallback(
    monitorProgress(
      async (nextValue: {
        label: string;
        value: string;
        sublabel: string | undefined;
      }) => {
        setValue(nextValue);

        if (typeof value?.value !== "string") {
          return mutate({
            op: "add",
            path,
            value: nextValue.value ? nextValue.value.split(":").pop() : "",
          });
        }

        if (nextValue.value === "") {
          return mutate({
            op: "replace",
            path,
            value: "",
          });
        }

        return mutate({
          op: "replace",
          path,
          value: nextValue.value?.split(":").pop() ?? "",
        });
      },
    ),
    [mutation, path, id, value],
  );

  return (
    <Combobox<
      { label: string; value: string; sublabel: string | undefined },
      { label: string; value: string; sublabel: string | undefined }
    >
      autoFocus={autoFocus}
      className={cn(
        "min-h-full rounded-none border-none dark:border-none bg-transparent",
        className,
      )}
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      queryKey={[entityModelId]}
      renderOption={(option) => (
        <EntityNodeReadView
          label={option.label}
          sublabel={option.sublabel}
          className="pr-4"
        />
      )}
    />
  );
};

import { EntityNodeValueType } from "@/lib/model/entities";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { FieldDataTypeEnum } from "@jptr/braille-prisma";

import { DATA_TYPE_ICON_MAP } from "@/lib/model/ui";
import { cn } from "@/lib/utils";

import { Select } from "../../select";
import { TextInput } from "../../textinput";
import { RelatedEntityNode } from "../entity-dropdown";
import { IconWrapper } from "../icon-wrapper";
import { useNumericAlignment } from "../numeric-alignment";

export const EditCell = ({ value }: { value: EntityNodeValueType }) => {
  const alignment = useNumericAlignment();

  switch (value.definition.dataType) {
    case FieldDataTypeEnum.ENUM:
      return (
        <Select
          className="h-full w-full rounded-none border-0 text-[length:inherit] bg-none dark:bg-none focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 focus:inset-0 focus:ring-offset-0"
          defaultValue={value.value}
          defaultOpen
          name="value"
          options={(value.definition.schema.enum ?? [])
            .filter((e) => typeof e === "string")
            .map((e) => ({
              label: e,
              value: e,
            }))}
        />
      );

    case FieldDataTypeEnum.BOOLEAN:
      return (
        <Select
          className="h-full w-full rounded-none border-0 text-[length:inherit] bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 focus:inset-0 focus:ring-offset-0"
          defaultValue={!!value.value ? "true" : "false"}
          defaultOpen
          name="value"
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ]}
          renderOption={(option) => (
            <span className="flex gap-x-2 text-[13px]">
              <IconWrapper
                icon={option.value === "true" ? CheckCircleIcon : XCircleIcon}
              >
                {option.label}
              </IconWrapper>
            </span>
          )}
        />
      );

    case FieldDataTypeEnum.STRING:
    case FieldDataTypeEnum.NUMBER:
      const alignRight =
        alignment === "right" &&
        value.definition.dataType === FieldDataTypeEnum.NUMBER;

      return (
        <TextInput
          className={cn(
            "w-full h-full rounded-none border-0 border-none  bg-transparent dark:bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 py-0  text-[length:inherit]",
            {
              "text-right": alignRight,
            },
          )}
          name="value"
          defaultValue={value.value}
          type="text"
          autoFocus
        />
      );

    case FieldDataTypeEnum.CURRENCY:
      return (
        <TextInput
          className="w-full h-full rounded-none border-0 border-none bg-transparent dark:bg-transparent focus:ring-[#567CF0] dark:focus:ring-[#567CF0] focus:ring-inset focus:ring-1 py-0  text-[length:inherit]"
          name="value"
          defaultValue={value.value.value}
          type="text"
          autoFocus
        />
      );

    case FieldDataTypeEnum.DATE:
      return (
        <div
          className={cn(
            "w-full h-full focus-within:ring-inset focus-within:ring-[#567CF0] focus-within:ring-1 px-3 min-h-10 min-w-30 flex items-center relative",
          )}
        >
          <IconWrapper
            className="w-full"
            icon={DATA_TYPE_ICON_MAP[FieldDataTypeEnum.DATE]}
          >
            <TextInput
              className="w-full h-full rounded-none border-0 border-none bg-transparent dark:bg-transparent focus:ring-inset focus:ring-0 px-0 text-[length:inherit]"
              name="value"
              defaultValue={value.value}
              type="text"
              autoFocus
            />
          </IconWrapper>
        </div>
      );

    case FieldDataTypeEnum.ENTITY:
      return (
        <RelatedEntityNode
          className="min-w-64"
          autoFocus
          path={value.path}
          entityModelId={value.entityModelId!}
          value={
            value.entityId || typeof value.value === "string"
              ? {
                  label: value.views.option?.label || "",
                  sublabel: value.views.option?.sublabel,
                  value: value.entityId || "",
                }
              : null
          }
        />
      );
  }
};

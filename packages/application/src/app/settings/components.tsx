"use client";

export const SidebarLink = () => {
  return null;
};

import { Fragment, useOptimistic, useRef, useState } from "react";
import { flushSync, useFormState } from "react-dom";

import { TenantRole } from "@jptr/braille-prisma";

import Field from "@/components/field";

import { updateRole } from "./actions";
import { useProgress } from "@/components/client";
import { toast } from "sonner";
import { InlineEdit } from "@/components/inline-edit";
import { EditButton } from "@/components/edit-button";

const hasError = (
  state: unknown,
): state is { errors: Record<string, unknown> } => {
  return (
    typeof state === "object" &&
    !!state &&
    !!("errors" in state) &&
    !!state.errors &&
    typeof state.errors === "object"
  );
};

const getError = (state: unknown, name: string): string | undefined => {
  const error =
    hasError(state) && name in state.errors ? state.errors[name] : undefined;

  if (typeof error === "string") {
    return error;
  }
};

export const FormError = ({
  action,
  name,
}: {
  action: Parameters<typeof useFormState>[0];
  name: string;
}) => {
  const [state, formAction] = useFormState(action, undefined);
  const error =
    hasError(state) && name in state.errors ? state.errors[name] : undefined;

  return <p>{getError(state, name)}</p>;
};

const ROLE_OPTIONS = [
  {
    label: "User",
    value: "USER",
  },
  {
    label: "Administrator",
    value: "ADMIN",
  },
];

type UpdateRoleFormType = {
  userId: string;
  currentRole: TenantRole | "USER" | undefined;
  disabled: boolean;
};

export const UpdateRoleForm = ({
  userId,
  currentRole,
  disabled,
}: UpdateRoleFormType) => {
  const ref = useRef<HTMLFormElement>(null);
  const { busy } = useProgress();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [value, setFieldState] = useState(currentRole || "USER");

  const [optimisticValue, addOptimisticMessage] = useOptimistic<
    TenantRole | "USER",
    TenantRole | "USER"
  >(value, (_, newRole) => newRole);

  const action = async (formData: FormData) => {
    setEditing(false);
    const done = busy();
    try {
      const role = formData.get("role") as any;
      addOptimisticMessage(role);
      const result = await updateRole(formData);

      if ("status" in result) {
        setFieldState(role);
        toast.success("Role updated");
      } else {
        toast.error(result.errors?.form?.[0] || "Something went wrong");
      }

      return result;
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      done();
    }
  };

  return (
    <InlineEdit
      editing={editing}
      editView={
        !disabled
          ? () => (
              <Fragment>
                <input type="hidden" name="userId" value={userId} />
                <Field
                  type="select"
                  name="role"
                  defaultOpen={true}
                  options={ROLE_OPTIONS}
                  defaultValue={value}
                  disabled={disabled}
                />
              </Fragment>
            )
          : undefined
      }
      readView={() => (
        <span className="group flex gap-4 items-center">
          {
            ROLE_OPTIONS.find((option) => option.value === optimisticValue)
              ?.label
          }
          {!disabled && (
            <EditButton
              ref={editButtonRef}
              onClick={() => {
                setEditing(true);
              }}
            />
          )}
        </span>
      )}
      formProps={{ ref, action }}
      onBlur={() => {
        setEditing(false);
      }}
      onCancel={() => {
        flushSync(() => {
          setEditing(false);
        });
        editButtonRef.current?.focus();
      }}
    />
  );
};

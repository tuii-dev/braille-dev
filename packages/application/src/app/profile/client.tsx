"use client";

import { Save } from "lucide-react";

import Field, { Form } from "@/components/field";

import { updateUser } from "./action";
import { UpdateUserSchema, UpdateUserType } from "./schema";
import { Submit } from "@/components/form-submit-button";
import { toast } from "sonner";

type DefaultValues = UpdateUserType;

export const UpdateUserForm = ({
  defaultValues,
}: {
  defaultValues: DefaultValues;
}) => {
  return (
    <Form
      className="flex flex-col gap-x-4"
      name="update-user"
      schema={UpdateUserSchema}
      action={updateUser}
      onSuccess={() => {
        toast.success("Your profile has been updated!");
      }}
      onError={(error) => {
        toast.error(
          typeof error === "string" ? error : Object.entries(error)[0][1],
        );
      }}
    >
      <Field
        type="text"
        label="Name"
        name="name"
        defaultValue={defaultValues.name}
      />
      <footer className="mt-6 flex w-full justify-end">
        <Submit icon={<Save className="w-3 h-3" />}>Save</Submit>
      </footer>
    </Form>
  );
};

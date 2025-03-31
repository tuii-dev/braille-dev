"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import Field from "@/components/field";
import { Submit } from "@/components/form-submit-button";
import { useProgress } from "@/components/client";

import { systemAdminCreateTenant } from "./actions";
import { useState } from "react";

const Form = () => {
  const { monitorProgress } = useProgress();
  const { pending } = useFormStatus();
  const [error, setError] = useState<string[]>();

  return (
    <form
      className="flex flex-col gap-3"
      action={monitorProgress(async (formData) => {
        const result = await systemAdminCreateTenant(formData);

        if ("error" in result) {
          if ("form" in result.error && Array.isArray(result.error.form)) {
            setError(result.error.form);
          } else {
            setError(Object.entries(result.error)[0][1]);
          }
        } else {
          toast.success(`Tenant ${result.name} created!`);
        }
      })}
    >
      {!pending && error && (
        <div className="dark:text-white bg-midnight-500 text-sm p-4 rounded text-center mb-2">
          {error.map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
      )}
      <Field type="text" label="Tenant Name" name="tenantName" />
      <div className="mt-3">
        <h2 className="text-md font-semibold dark:text-white">Admin User</h2>
      </div>
      <Field type="text" label="Email Address" name="adminUserEmail" />
      <Field type="text" label="Name" name="adminUserName" />
      <Submit className="mt-4">Create</Submit>
    </form>
  );
};

export const CreateTenantButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="minimal">Create Tenant</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex gap-2 items-baseline">
          {/* <ArrowPathIcon className="w-5 h-5 pt-1" /> */}
          <h1 className="text-lg font-semibold dark:text-white">New Tenant</h1>
        </div>
        <Form />
      </DialogContent>
    </Dialog>
  );
};

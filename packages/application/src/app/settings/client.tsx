"use client";

import { Button } from "@/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import { Submit } from "@/components/form-submit-button";
import { inviteUser, updateOrganisationName } from "./actions";
import Field from "@/components/field";
import { Send, UserPlus } from "lucide-react";
import { useProgress } from "@/components/client";
import { toast } from "sonner";
import { useState } from "react";
import { DropdownMenuItem } from "@/components/dropdown-menu";
import { sendInviteEmail } from "@/lib/auth0/sendInviteEmail";

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

export const InviteUserButton = () => {
  const [open, setOpen] = useState(false);
  const { monitorProgress } = useProgress();

  const action = async (formData: FormData) => {
    const result = await inviteUser(formData);

    if (result && "error" in result) {
      console.error(result.error);
      if ("form" in result.error) {
        toast.error(result.error.form[0]);
      }
    } else {
      setOpen(false);
      toast.success("User invited!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="minimal" icon={<UserPlus className="w-4 h-4" />}>
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex gap-2 items-center">
          <UserPlus className="w-5 h-5 dark:stroke-white" />
          <h1 className="text-lg font-semibold dark:text-white">Invite User</h1>
        </div>
        <form action={monitorProgress(action)}>
          <div className="flex flex-col gap-3">
            <Field type="text" label="Email Address" name="email" />
            <Field type="text" label="Name" name="name" />
            <Submit className="mt-4">Create</Submit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const InviteUserForm = () => {
  const { monitorProgress } = useProgress();

  return (
    <form
      id="invite-user"
      action={monitorProgress(async (formData) => {
        await inviteUser(formData);
      })}
    >
      <div>
        <Field type="email" name="email" placeholder="Email" />
        <Field type="text" name="name" placeholder="Name" />
        <Field
          className="w-full"
          type="select"
          name="role"
          defaultValue="USER"
          options={ROLE_OPTIONS}
        />
      </div>
      <Submit>Invite User</Submit>
    </form>
  );
};

export const UpdateOrgNameForm = ({
  defaultValue,
}: {
  defaultValue: string;
}) => {
  return (
    <form action={updateOrganisationName}>
      <Field
        label="Organisation Name"
        type="text"
        name="name"
        defaultValue={defaultValue}
      />
    </form>
  );
};

type SendInviteEmailMenuItemProps = {
  email: string;
  username: string | null;
};

export const SendInviteEmailMenuItem = ({
  email,
  username,
}: SendInviteEmailMenuItemProps) => {
  const { monitorProgress } = useProgress();

  return (
    <DropdownMenuItem
      onClick={monitorProgress(async () => {
        const send = sendInviteEmail({
          email,
          username: username || email,
          type: "invite",
        });
        toast.promise(send, {
          loading: `Sending...`,
          success: `You have successfully invited ${email} to Braille`,
          error: `Failed to send invite to ${email}`,
        });
        await send;
      })}
    >
      <Send className="mr-2 h-4 w-4" />
      <span>Send Invitation</span>
    </DropdownMenuItem>
  );
};

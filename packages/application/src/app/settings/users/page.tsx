import Field from "@/components/field";

import prisma from "@/lib/prisma";
import getCurrentAdminUser from "@/lib/getAdminUser";
import { KeyRound, Mail, UserPlus } from "lucide-react";

import { UpdateRoleForm } from "../components";
import { Cell, Table, THead } from "@/components/table";
import {
  InviteUserButton,
  InviteUserForm,
  SendInviteEmailMenuItem,
  UpdateOrgNameForm,
} from "../client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { DropDownMenu } from "@/components/dropdownmenu";

export default async function Page() {
  const { user: currentUser, tenantId } = await getCurrentAdminUser();

  const users = await prisma.user.findMany({
    where: {
      tenants: {
        some: {
          id: tenantId,
        },
      },
    },
    include: {
      userTenantRoles: {
        where: {
          tenantId,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <div className="py-12 flex flex-col gap-16">
      <div className="mx-auto w-full max-w-7xl px-12">
        <div className="flex justify-end items-baseline mb-6">
          <h1 className="sr-only">Users</h1>
          <InviteUserButton />
        </div>
        <Table>
          <THead>
            <tr className="border-b border-slate-200 dark:border-midnight-500">
              <Cell className="py-4 pr-2 bg-gray-50/50" as="th">
                Email
              </Cell>
              <Cell className="py-4 px-2 bg-gray-50/50" as="th">
                Name
              </Cell>
              <Cell className="py-4 px-2 bg-gray-50/50" as="th">
                Role
              </Cell>
              <Cell className="py-4 pl-2 bg-gray-50/50" as="th">
                <div className="sr-only">Actions</div>
              </Cell>
            </tr>
          </THead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b dark:border-midnight-500">
                <Cell className="h-20 pl-4 pr-2 w-64">
                  <div className="flex items-center">
                    <div className="rounded-full w-8 h-8 dark:text-white shrink-0 border mr-3">
                      {user.avatar && (
                        <img
                          src={`${user.avatar}?d=mp`}
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                        />
                      )}
                    </div>
                    <div className="text-sm">{user.email}</div>
                  </div>
                </Cell>
                <Cell className="h-20 px-2 w-64">{user.name || "-"}</Cell>
                <Cell className="h-20 px-2 w-64">
                  <UpdateRoleForm
                    userId={user.id}
                    disabled={currentUser.id === user.id}
                    currentRole={user.userTenantRoles[0]?.role || "USER"}
                  />
                </Cell>
                <Cell className="h-20 pl-2 text-right w-0">
                  <DropDownMenu>
                    <DropdownMenuLabel>Member Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <SendInviteEmailMenuItem
                        email={user.email}
                        username={user.name}
                      />
                    </DropdownMenuGroup>
                  </DropDownMenu>
                </Cell>
              </tr>
            ))}
          </tbody>
          <tfoot className="h-8 bg-gray-50/50 dark:bg-midnight-800">
            <tr>
              <Cell colSpan={4} />
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );
}

import getCurrentAdminUser from "@/lib/getAdminUser";

import { UpdateOrgNameForm } from "../client";

export default async function Page() {
  const { user: currentUser } = await getCurrentAdminUser();

  return (
    <div className="py-12 flex flex-col gap-16">
      <div className="mx-auto w-full max-w-7xl px-12">
        <h2 className="sr-only">Organisation Details</h2>
        <UpdateOrgNameForm defaultValue={currentUser.tenants[0]?.name} />
      </div>
    </div>
  );
}

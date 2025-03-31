import { getSystemAdmin } from "@/lib/getCurrentSessionUser";
import { SettingsTabs } from "@/app/workspaces/[id]/settings/components";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getSystemAdmin();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-12">
        <SettingsTabs
          tabs={[
            {
              href: `/admin`,
              label: "Admin",
            },
            {
              href: `/admin/tenants`,
              label: "Tenants",
            },
            {
              href: `/admin/apps`,
              label: "Apps",
            },
          ]}
        />
      </div>
      {children}
    </div>
  );
}

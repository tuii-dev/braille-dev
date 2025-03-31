import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { UpdateUserForm } from "./client";

export default async function Page() {
  const user = await getCurrentSessionUser();

  return (
    <div className="my-12 px-12 max-w-3xl mx-auto w-full">
      <div className="w-full flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <header>
            <h2 className="text-base font-semibold leading-7">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
              A little bit of information to help others in your team identify
              you.
            </p>
          </header>
          <UpdateUserForm defaultValues={{ name: user.user.name || "" }} />
        </section>
        {/* <div className="h-[1px] w-full bg-gray-300"></div> */}
      </div>
    </div>
  );
}

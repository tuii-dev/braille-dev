import getCurrentAdminUser from "@/lib/getAdminUser";
import { Fragment } from "react";

export default async function Layout({ children }: { children: React.ReactNode }) {
    await getCurrentAdminUser();
    return <Fragment>{children}</Fragment>
}
import { redirect } from "next/navigation";

export default function Page({ params }: { params: any }) {
    return redirect(`/workspaces/${params.id}/settings/workspace-settings`)
}
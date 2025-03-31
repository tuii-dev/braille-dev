import { FormFieldSkeleton } from "@/components/skeletons/field";

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden max-w-xl">
      <div className="px-12 py-10 flex flex-col gap-6">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
    </div>
  );
}

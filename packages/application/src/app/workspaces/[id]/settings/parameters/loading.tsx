import { FormFieldSkeleton } from "@/components/skeletons/field";

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="px-12 py-10 flex flex-col gap-6 max-w-xl">
        <FormFieldSkeleton />
      </div>
      <div className="flex flex-col">
        <div className="animate-pulse dark:bg-charcoal-980 bg-gray-100 h-[40px] w-full " />
        <div className="animate-pulse dark:bg-charcoal-950 bg-gray-50 h-[80px] w-full " />
        <div className="animate-pulse dark:bg-charcoal-900 bg-gray-100 h-[80px] w-full " />
        <div className="animate-pulse dark:bg-charcoal-950/90 bg-gray-50 h-[80px] w-full " />
        <div className="animate-pulse dark:bg-charcoal-900/90 bg-gray-100 h-[80px] w-full " />
      </div>
    </div>
  );
}

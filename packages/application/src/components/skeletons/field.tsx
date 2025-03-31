export const FormFieldSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="animate-pulse dark:bg-charcoal-980 bg-gray-100 h-[12px] w-24 rounded" />
      <div className="animate-pulse dark:bg-charcoal-980 bg-gray-100 h-[40px] w-full rounded" />
    </div>
  );
};

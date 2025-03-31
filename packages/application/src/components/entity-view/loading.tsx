export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col absolute overflow-hidden top-0 left-0 right-0">
      <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[109px] w-full shrink-0" />
      <div className="px-7 py-6 flex gap-x-2">
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-24 rounded" />
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-24 rounded" />
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-24 rounded" />
      </div>
    </div>
  );
}

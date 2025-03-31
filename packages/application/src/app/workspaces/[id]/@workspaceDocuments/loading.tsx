export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col absolute overflow-hidden top-0 left-0 right-0">
      <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[109px] w-full shrink-0" />
      <div className="px-7 py-6 flex gap-x-2">
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-24 rounded" />
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-24 rounded" />
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-24 rounded" />
      </div>
      <div className="px-7 py-6 border-t border-gray-100 dark:border-midnight-500 gap-y-4 flex flex-col w-full">
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-48 rounded" />
        <div className="flex gap-x-2">
          <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[200px] w-[150px] rounded-lg" />
          <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[200px] w-[150px] rounded-lg" />
          <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[200px] w-[150px] rounded-lg" />
        </div>
      </div>
      <div className="px-7 py-6 border-t border-gray-100 dark:border-midnight-500 gap-y-4 flex flex-col w-full">
        <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-[40px] w-48 rounded" />
        <div className="flex flex-col gap-y-2">
          <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-80 w-full rounded-lg" />
          <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-80 w-full rounded-lg" />
          <div className="animate-pulse dark:bg-midnight-700 bg-gray-100 h-80 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

import { Scrollbars } from "@/components/scrollbars";

export default function Loading() {
  return (
    <Scrollbars className="flex h-full justify-center grow">
      <div className="flex h-full flex-col w-full grow dark:text-white">
        <div className="flex flex-col relative h-full @container">
          <div className="flex h-full items-stretch dark:bg-charcoal-900 @container">
            <div className="@[1200px]:block hidden w-4/12 border-r bg-slate-50 dark:bg-charcoal-950 dark:border-midnight-400">
              <div className="flex w-full h-full items-stretch"></div>
            </div>
            <div className="flex flex-col grow w-7/12 h-full">
              <div className="w-full flex flex-col relative overflow-hidden">
                <div className="animate-pulse dark:bg-charcoal-950 bg-gray-100 h-[113px] w-full shrink-0" />
                <div className="px-7 py-6 border-t border-gray-100 dark:border-midnight-400 gap-y-4 flex flex-col w-full">
                  <div className="animate-pulse dark:bg-charcoal-950 bg-gray-100 h-[40px] w-48 rounded" />
                  <div className="flex flex-col gap-y-2">
                    <div className="animate-pulse dark:bg-charcoal-950 bg-gray-100 h-80 w-full rounded-lg" />
                    <div className="animate-pulse dark:bg-charcoal-950 bg-gray-100 h-80 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Scrollbars>
  );
}

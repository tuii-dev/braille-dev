import { cn } from "@/lib/utils";
import { SettingsTabs } from "@/app/workspaces/[id]/settings/components";

import { Scrollbars } from "../scrollbars";

type LayoutWithTitleProps = {
  title: string;
  centered?: boolean;
  className?: string;
  width?: "narrow";
  headerAfter?: React.ReactNode;
  tabs?: { href: string; label: string }[];
  children: React.ReactNode;
};

export const LayoutWithTitle = ({
  title,
  headerAfter,
  centered,
  className,
  width,
  tabs,
  children,
}: LayoutWithTitleProps) => {
  return (
    <Scrollbars>
      <div className={cn("flex w-full h-full", className)}>
        <div className="flex flex-col shrink w-full h-full dark:border-gray-800 border-r bg-white dark:bg-charcoal-900">
          <div className=" dark:border-midnight-500">
            <div style={{ height: 41 }}></div>
            <div
              className={cn(
                "h-16 flex items-center mx-auto w-full max-w-7xl px-12",
                {
                  "justify-center": centered,
                  "max-w-7xl": !width,
                  "max-w-3xl": width === "narrow",
                },
              )}
            >
              <h1 className="text-xl font-bold dark:text-gray-100 my-2">
                {title}
              </h1>
              {headerAfter}
            </div>
            <div>
              <div
                className={cn("mx-auto px-12", {
                  "max-w-7xl": !width,
                  "max-w-3xl": width === "narrow",
                })}
              >
                {tabs && <SettingsTabs tabs={tabs} />}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col w-full grow bg-stone-50/50 dark:bg-charcoal-950",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Scrollbars>
  );
};

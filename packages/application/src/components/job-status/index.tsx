import { DataExtractionJobStatus } from "@jptr/braille-prisma";
import { cn } from "@/lib/utils";
import { StatusLight } from "../status-light";
import {
  ArrowTopRightOnSquareIcon,
  RocketLaunchIcon,
} from "@heroicons/react/16/solid";

const statusText = {
  PENDING: "text-yellow-50",
  RUNNING: "text-cyan-50",
  FINISHED: "text-green-50",
  FAILED: "text-rose-50",
};

const statusBg = {
  PENDING: "bg-yellow-500/90",
  RUNNING: "bg-cyan-500/90",
  FINISHED: "bg-green-500/90",
  FAILED: "bg-rose-500/90",
};

export const JobStatus = ({
  status,
  pill,
  className,
}: {
  status: DataExtractionJobStatus;
  pill?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center min-w-24 grow-0 h-[1.5em]",
        className,
        {
          "rounded-full pl-1 pr-2 py-1": pill,
          [statusBg[status]]: pill,
        },
      )}
    >
      <StatusLight status={status} />
      <span
        className={cn(
          statusText[status],
          "ml-1.5 font-mono text-[11px] xl:text-xs font-bold leading-none grow text-center w-full text-white",
        )}
      >
        {status}
      </span>
    </div>
  );
};

export const ActionStatus = ({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) => {
  const c = cn(
    "inline-flex items-center min-w-24 dark:text-white rounded-full pl-1 pr-2 py-1 border border-black",
    className,
  );

  if (href) {
    return (
      <a
        className={cn(
          c,
          "hover:bg-black hover:text-white hover:dark:bg-midnight-400 dark:border-midnight-400",
        )}
        href={href}
        target="_blank"
      >
        <ArrowTopRightOnSquareIcon className="ml-1.5 w-4 h-4" />
        <span
          className={cn(
            "ml-1.5 font-mono font-bold leading-none grow text-center w-full uppercase",
          )}
          style={{ fontSize: 12 }}
        >
          Deployed
        </span>
      </a>
    );
  }

  return (
    <div className={cn(c, "border-gray-200 dark:border-midnight-600")}>
      <RocketLaunchIcon className="ml-1.5 w-4 h-4" />
      <span
        className={cn(
          "ml-1.5 font-mono font-bold leading-none grow text-center w-full uppercase",
        )}
        style={{ fontSize: 12 }}
      >
        Deployed
      </span>
    </div>
  );
};

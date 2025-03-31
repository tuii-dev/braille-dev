import { cn } from "@/lib/utils";

const statuses = {
  PENDING: "text-yellow-100 bg-yellow-200/40",
  RUNNING: "text-cyan-100 bg-cyan-200/40",
  FINISHED: "text-green-100 bg-green-200/40",
  FAILED: "text-rose-100 bg-rose-200/40",
};

export const StatusLight = ({
  status,
  className,
}: {
  status: keyof typeof statuses;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        statuses[status],
        "h-4 w-4 flex justify-center items-center flex-none rounded-full p-1 grow-0 overflow-hidden relative animate-pulse",
        className,
      )}
    >
      {status === "RUNNING" && (
        <div className="absolute h-full w-full animate-spin">
          <div className="w-1/2 h-1/2 absolute bg-current opacity-50 top-0 left-0"></div>
          <div className="w-1/2 h-1/2 absolute bg-current opacity-50 bottom-0 right-0"></div>
        </div>
      )}
      <div className="h-1.5 w-1.5 rounded-full bg-current grow-0" />
    </div>
  );
};

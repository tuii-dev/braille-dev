"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useMemo } from "react";

type MonitorProgress = <
  Args extends any[],
  ReturnValue extends any,
  T extends (...args: Args) => Promise<ReturnValue>,
>(
  cb: T,
) => (...args: Args) => Promise<ReturnValue>;

const ProgressContext = React.createContext<{
  subscribe: (listener: (busy: boolean) => void) => () => void;
  busy: () => () => void;
  monitorProgress: MonitorProgress;
} | null>(null);

export const useProgress = () => {
  const value = React.useContext(ProgressContext);
  if (!value) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return value;
};

type ProgresProviderProps = {
  showUI?: boolean;
  children: React.ReactNode;
};

export const ProgressProvider = ({
  showUI = true,
  children,
}: ProgresProviderProps) => {
  const value = useMemo(() => {
    const states = new Set();
    const subscribers = new Set<(busy: boolean) => void>();

    const busy = (taskName = "BUSY") => {
      const symbol = Symbol(taskName);
      states.add(symbol);
      subscribers.forEach((listener) => listener(Boolean(states.size)));

      return () => {
        states.delete(symbol);
        subscribers.forEach((listener) => listener(Boolean(states.size)));
      };
    };

    const subscribe = (listener: (busy: boolean) => void) => {
      subscribers.add(listener);

      return () => {
        subscribers.delete(listener);
      };
    };

    const monitorProgress: MonitorProgress = (fn) => {
      return async (...args) => {
        const done = busy();

        try {
          const userPromise = fn(...args);

          await Promise.all([
            userPromise,
            new Promise((r) => setTimeout(r, 700)),
          ]);

          return userPromise;
        } finally {
          done();
        }
      };
    };

    return {
      subscribe,
      busy,
      monitorProgress,
    };
  }, []);

  return (
    <ProgressContext.Provider value={value}>
      {showUI && <ProgressUI />}
      {children}
    </ProgressContext.Provider>
  );
};

const useProgressState = () => {
  const [busy, setBusy] = React.useState(false);

  const progress = useProgress();

  useEffect(() => progress.subscribe(setBusy), [progress]);

  return busy;
};

export const ProgressBar = ({
  busy,
  className,
}: {
  busy: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-[3px] dark:h-[3px] w-full overflow-hidden bg-gray-200 dark:bg-charcoal-980 transition-opacity",
        { "opacity-50 duration-350": !busy, "opacity-100 duration-50": busy },
        className,
      )}
    >
      <div
        className={cn("transition-opacity w-full h-full", {
          "opacity-0 duration-350": !busy,
          "opacity-100 duration-50": busy,
        })}
      >
        <div className="w-full h-full bg-blue-400 dark:bg-gray-400 animate-[progress-bar_1s_infinite_linear] origin-left"></div>
      </div>
    </div>
  );
};

export const ProgressUI = () => {
  const busy = useProgressState();

  return (
    <ProgressBar className="top-0 left-0 right-0 absolute z-50" busy={busy} />
  );
};

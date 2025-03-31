"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export const Thumbnail = ({
  className,
  src,
}: {
  className?: string;
  src?: string | null;
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Wrapper className={className} mockHeight={!loaded}>
      {src && (
        <img
          className={cn("transition-all", {
            "opacity-0 absolute": !loaded,
          })}
          onLoad={() => setLoaded(true)}
          src={src}
          alt=""
        />
      )}
    </Wrapper>
  );
};

function Wrapper({
  mockHeight,
  className,
  children,
}: {
  mockHeight: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("w-12 max-h-16 shrink-0", className)}>
      <div
        className={cn(
          "shadow-md shadow-gray-200 dark:shadow-gray-950 border-gray-300 dark:border-midnight-400 rounded bg-white overflow-hidden border",
          {
            "pb-[128%]": mockHeight,
          },
        )}
      >
        {children}
      </div>
    </div>
  );
}

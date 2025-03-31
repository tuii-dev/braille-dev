"use client";

import { useSelectedLayoutSegment } from "next/navigation";

type ConditionalSegmentProps = {
  fallback: React.ReactNode;
  children: React.ReactNode;
};

export const ConditionalSegment = ({
  fallback,
  children,
}: ConditionalSegmentProps) => {
  const segment = useSelectedLayoutSegment();

  if (segment !== "settings") {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

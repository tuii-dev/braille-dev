"use client";

import React from "react";

import dynamic from "next/dynamic";

const Animation = dynamic(() => import("./animation"), { ssr: false });

export const LoadingOverlayController = () => {
  return (
    <div
      // initial={false}
      // exit={{ opacity: 0 }}
      // transition={{
      //   duration: 0.2,
      //   delay: 1,
      // }}
      className="fixed inset-0 bg-white dark:bg-midnight-950 z-50 text-black dark:text-white flex items-center justify-center"
    >
      <Animation />
    </div>
  );
};

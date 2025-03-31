import React from "react";

export const EmptyState = ({
  image,
  title,
  children,
}: {
  title: string;
  image?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full flex flex-col justify-center w-full text-center">
      <div className="text-center">
        <div>{image}</div>
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        <div className="mt-2 text-sm text-gray-500 m-auto">{children}</div>
      </div>
    </div>
  );
};

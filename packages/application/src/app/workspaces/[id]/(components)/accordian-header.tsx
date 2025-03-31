import React from "react";

type AccordianHeaderProps = {
    title: string;
    expanded?: boolean;
    headerColor?: string;
    onExpand?: () => void;
    icon?: React.ReactNode;
    expandAxis?: "x" | "y";
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
  
  export const AccordianHeader = ({
    title,
    headerColor,
    icon,
    style,
    children,
  }: AccordianHeaderProps) => {
    return (
      <header
        style={{ backgroundColor: headerColor, ...style }}
        className="h-12 flex items-center justify-between px-4 shrink-0 dark:text-white"
      >
        <h2 className="flex items-center relative max-w-full overflow-hidden text-ellipsis">
          <span className="shrink-0">{icon}</span>
          <span className="font-bold text-sm whitespace-nowrap">{title}</span>
        </h2>
        {children}
      </header>
    );
  };
  
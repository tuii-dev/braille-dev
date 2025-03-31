"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useSelectedLayoutSegment } from "next/navigation";

import { ClipboardIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";
import { AccordianHeader } from "./(components)/accordian-header";

type AccordianProps = {
  expanded?: boolean;
  expandAxis: "x" | "y";
  className?: string;
  title: string;
  icon?: React.ReactNode;
  headerColor?: string;
  headerStyle?: React.CSSProperties;
  children?: React.ReactNode;
  headerChildren?: React.ReactNode;
  onExpand?: () => void;
};

const Accordian = forwardRef<HTMLElement, AccordianProps>(
  (
    {
      title,
      expanded = true,
      onExpand,
      className,
      icon,
      headerColor,
      headerStyle,
      expandAxis,
      children,
      headerChildren,
    },
    ref,
  ) => {
    const contentVisible = expandAxis !== "x" || expanded;

    return (
      <motion.section
        ref={ref}
        className={cn(
          "font-lg rounded-[5px] xl:rounded-[8px] max-h-full shadow-[0px_4px_6px_1px_rgba(0,0,0,0.03)] dark:shadow-[0px_4px_6px_1px_rgba(0,0,0,0.15)] h-full w-full flex flex-col border border-[#e4e9ed] dark:border-[1px] overflow-hidden bg-white dark:border-midnight-400 dark:bg-charcoal-900",
          className,
          { "flex-grow": expanded },
        )}
      >
        <AccordianHeader
          headerColor={headerColor}
          expanded={expanded}
          style={headerStyle}
          onExpand={onExpand}
          title={title}
          icon={icon}
          expandAxis={expandAxis}
        >
          {headerChildren}
        </AccordianHeader>
        <motion.div
          initial={{
            height: contentVisible ? "100%" : "0",
            overflow: "hidden",
          }}
          className="border-box w-full flex items-stretch grow  relative"
        >
          {contentVisible && (
            <motion.div className="w-full flex items-stretch h-full">
              {children}
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    );
  },
);

Accordian.displayName = "Accordian";

export const MotionAccordian = motion(Accordian);

export const DocumentListAccordion = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <MotionAccordian
      animate="enter"
      icon={<ClipboardIcon className="w-4 h-4 mr-2" />}
      title="Workspace Jobs"
      expanded
      expandAxis="y"
      className="flex grow basis-3/4"
    >
      {children}
    </MotionAccordian>
  );
};

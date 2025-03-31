import { Fragment, forwardRef } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BaseProps = {
  variant?:
    | "primary"
    | "danger"
    | "secondary"
    | "minimal"
    | "ghost"
    | "link"
    | "none";
  icon?: React.ReactNode;
  subtext?: React.ReactNode;
  shape?: "square" | "rounded" | "pill";
  size?: "sm" | "md";
};

export type ButtonProps = BaseProps & {
  as?: "button";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type LinkProps = BaseProps & {
  as: "link";
  target?: "_blank";
} & React.ComponentProps<typeof Link>;

export type AnchorProps = BaseProps & {
  as: "a";
} & React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;

type Props = ButtonProps | LinkProps | AnchorProps;

export const Button = forwardRef<HTMLAnchorElement | HTMLButtonElement, Props>(
  (componentProps, ref) => {
    const {
      as = "button",
      variant: propVariant,
      icon,
      className: propsClassName,
      subtext,
      size = "md",
      "aria-disabled": ariaDisabled,
      shape = "square",
      ...props
    } = componentProps;

    const content = (
      <>
        {icon && (
          <span className={props.children ? "-ml-0.5 mr-2" : undefined}>
            {icon}
          </span>
        )}
        {subtext ? (
          <span className="flex flex-col">
            <span>{props.children}</span>
            <span className="text-xxs font-normal dark:text-white/50 text-nowrap font-mono">
              {subtext}
            </span>
          </span>
        ) : (
          <Fragment>{props.children}</Fragment>
        )}
      </>
    );

    const variant = propVariant
      ? propVariant
      : props.type === "submit"
        ? "primary"
        : undefined;

    const className = cn(
      "transition-colors whitespace-nowrap text-left grow-0 font-semibold hover:bg-[#fffefc] dark:text-gray-200 transition-bg border border-black border-[1px] dark:border-white/40 inline-flex items-center px-3.5 py-2.5 text-sm",
      "dark:hover:ring-indigo-400/20",
      "focus-visible:ring-2 focus-visible:border-transparent focus-visible:ring-inset-0 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 dark:focus-visible:ring-midnight-900",
      {
        "bg-cyan-400 hover:bg-stone-50 dark:hover:bg-white text-black dark:text-black border-0":
          variant === "primary",
        "text-red-500 border-transparent bg-red-100 hover:border-red-200 hover:ring-red-400 hover:bg-red-200 hover:text-red-700 hover:border-red-800 border-[1px] dark:bg-red-600 dark:hover:bg-red-800":
          variant === "danger",
        "border-transparent dark:border-transparent shadow-none bg-[#ECECEC] dark:bg-[#111111] hover:dark:bg-charcoal-950 hover:bg-gray-200":
          variant === "minimal",
        "border border-transparent dark:border-transparent shadow-none bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent hover:border-current hover:dark:border-current":
          variant === "ghost",
        "p-0 bg-transparent border-0 py-0.5 rounded-none hover:no-underline":
          variant === "link",
        "rounded-full justify-center": !props.children,
        "text-gray-900 dark:text-gray-300 hover:bg-transparent hover:border-none hover:shadow-none p-0 border-none bg-transparent":
          variant === "none",
        "text-gray-900 dark:text-gray-300 p-0 border-none": variant === "none",
        "rounded-full":
          (shape === "rounded" && !props.children) || shape === "pill",
        "min-w-40": !!subtext,
        "text-sm": size === "md",
        "text-xs": size === "sm",
        "border border-transparent shadow-none dark:border-gray-50/20 border-gray-50/20 bg-gray-100 hover:bg-gray-100 text-black dark:bg-transparent cursor-not-allowed opacity-50 dark:text-white dark:hover:bg-transparent":
          !!ariaDisabled,
        "bg-transparent border-transparent hover:bg-transparent hover:border-transparent dark:border-transparent":
          variant === "ghost" && ariaDisabled,
        "rounded-[6px]": shape === "square",
        "rounded-[8px]": shape === "rounded",
        "p-2 px-2.5": shape === "square" && !props.children,
      },
      propsClassName,
    );

    if ("as" in componentProps && componentProps.as === "a") {
      return (
        <a {...componentProps} className={className} ref={ref as any}>
          {content}
        </a>
      );
    }

    if ("href" in componentProps) {
      if ("download" in componentProps) {
        return (
          <a
            {...componentProps}
            href={componentProps.href.toString()}
            className={className}
            ref={ref as any}
          >
            {content}
          </a>
        );
      }

      const { as, variant, icon, size, ...linkProps } = componentProps;

      return (
        <Link {...linkProps} className={className} ref={ref as any}>
          {content}
        </Link>
      );
    }

    {
      const { as, variant, icon, size, ...buttonProps } = componentProps;

      return (
        <button
          type="button"
          {...buttonProps}
          className={className}
          ref={ref as any}
        >
          {content}
        </button>
      );
    }
  },
);

Button.displayName = "Button";

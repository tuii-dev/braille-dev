"use client";

import { default as NextLink } from "next/link";
import { usePathname } from "next/navigation";

export const Link = ({
  href: hrefProp,
  className,
  children,
  onClick,
  onDoubleClick,
  style,
  prefetch = true,
  scroll = true,
}: Pick<
  React.ComponentProps<typeof NextLink>,
  | "children"
  | "className"
  | "scroll"
  | "href"
  | "onClick"
  | "prefetch"
  | "style"
  | "onDoubleClick"
>) => {
  const pathname = usePathname();

  const href =
    typeof hrefProp === "string"
      ? hrefProp.startsWith("/")
        ? hrefProp
        : `${pathname}/${hrefProp}`
      : "";

  return (
    <NextLink
      prefetch={prefetch}
      href={href}
      className={className}
      draggable={false}
      scroll={scroll}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </NextLink>
  );
};

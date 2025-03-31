import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";

export const DropDownMenu = ({
  sideOffset = 8,
  icon,
  align = "end",
  size,

  label,
  children,
}: {
  size?: "sm";
  icon?: React.ReactNode;
  sideOffset?: number;
  align?: "start" | "end";
  label?: string;
  children: React.ReactNode | React.ReactNode[];
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant="minimal"
          icon={icon ?? <EllipsisHorizontalIcon className="w-3 h-3" />}
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={sideOffset}
        align={align}
        className="w-56 shadow"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

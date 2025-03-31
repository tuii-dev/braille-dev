import type { Meta, StoryObj } from "@storybook/react";

import { Button } from ".";
import { Settings } from "lucide-react";

const meta = {
  title: "Button/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger Button",
  },
};

export const Icon: Story = {
  args: {
    variant: "primary",
    size: "md",
    icon: <Settings className="w-4 h-4" />,
  },
};

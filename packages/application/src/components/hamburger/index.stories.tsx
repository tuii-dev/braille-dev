import type { Meta, StoryObj } from "@storybook/react";

import { Hamburger } from "./index";

const meta = {
  title: "Example/Hamburger",
  component: Hamburger,
  parameters: {},
  tags: ["autodocs"],
} satisfies Meta<typeof Hamburger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};

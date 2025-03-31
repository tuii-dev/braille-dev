import type { Meta, StoryObj } from "@storybook/react";

import { Logo } from "./index";

const meta = {
  title: "Example/Logo",
  component: Logo,
  parameters: {},
  tags: ["autodocs"],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};

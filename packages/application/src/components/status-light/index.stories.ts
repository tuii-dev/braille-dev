
import type { Meta, StoryObj } from "@storybook/react";

import { StatusLight } from "./index";

const meta = {
  title: "Example/StatusLight",
  component: StatusLight,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StatusLight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    status: "RUNNING",
  },
};

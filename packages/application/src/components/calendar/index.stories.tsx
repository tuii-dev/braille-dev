import type { Meta, StoryObj } from "@storybook/react";

import { Calendar } from "./index";

const meta = {
  title: "Example/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};

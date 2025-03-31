import type { Meta, StoryObj } from "@storybook/react";

import { EditButton } from "./index";

const meta = {
  title: "Button/EditButton",
  component: EditButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EditButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};

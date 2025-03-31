import type { Meta, StoryObj } from "@storybook/react";

import { DatePickerWithRange } from "./index";

const meta = {
  title: "Form/DatePickerWithRange",
  component: DatePickerWithRange,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DatePickerWithRange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    numberOfMonths: 1,
    from: "2022-01-01",
    to: "2022-01-31",
  },
};

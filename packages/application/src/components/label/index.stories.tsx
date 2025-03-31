import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './index';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    name: 'example',
    children: 'Label Text',
  },
};

export const Required: Story = {
  args: {
    name: 'example',
    children: 'Required Field',
    required: true,
  },
};

export const CustomClass: Story = {
  args: {
    name: 'example',
    children: 'Custom Styled Label',
    className: 'text-blue-600 text-lg',
  },
};

export const DarkMode: Story = {
  args: {
    name: 'example',
    children: 'Dark Mode Label',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

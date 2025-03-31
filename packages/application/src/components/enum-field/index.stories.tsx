import type { Meta, StoryObj } from '@storybook/react';
import { EnumInput } from './index';

const meta = {
  title: 'Components/EnumInput',
  component: EnumInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EnumInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    name: 'tags',
    placeholder: 'Add tags...',
  },
};

export const WithPrefilledValues: Story = {
  args: {
    name: 'tags',
    value: ['react', 'typescript', 'tailwind'],
    placeholder: 'Add more tags...',
  },
};

export const WithStringValue: Story = {
  args: {
    name: 'tags',
    value: 'react,typescript,tailwind',
    placeholder: 'Add more tags...',
  },
};

export const WithCustomClass: Story = {
  args: {
    name: 'tags',
    className: 'max-w-md',
    placeholder: 'Add tags...',
  },
};

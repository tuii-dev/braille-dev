import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './index';
import { BeakerIcon } from '@heroicons/react/20/solid';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Example Chip',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'With Icon',
    icon: <BeakerIcon className="mr-1 h-4 w-4" />,
  },
};

export const WithOnClick: Story = {
  args: {
    label: 'Clickable Chip',
    onClick: () => alert('Chip clicked!'),
  },
};

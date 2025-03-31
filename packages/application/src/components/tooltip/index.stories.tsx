import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './index';
import { Button } from '../button';

const meta = {
  title: 'Components/Tooltip',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Complex tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p className="font-bold mb-1">Tooltip Title</p>
          <p className="text-gray-500">Additional information goes here</p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithCustomPosition: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Dark mode tooltip</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip in dark mode</p>
      </TooltipContent>
    </Tooltip>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

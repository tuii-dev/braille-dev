import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index';

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 rounded-md bg-blue-500 text-white">Open Menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 rounded-md bg-blue-500 text-white">Settings</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Show status</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Show notifications</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithRadioItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 rounded-md bg-blue-500 text-white">Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value="medium">
          <DropdownMenuLabel>Size</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="small">Small</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="large">Large</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 rounded-md bg-blue-500 text-white">More</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Back</DropdownMenuItem>
        <DropdownMenuItem>Forward</DropdownMenuItem>
        <DropdownMenuItem>Reload</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Save Page As...</DropdownMenuItem>
            <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
            <DropdownMenuItem>Name Window...</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

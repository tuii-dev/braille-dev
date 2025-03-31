import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './index';

const meta = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/example',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof Link>;

export const AbsolutePath: Story = {
  args: {
    href: '/dashboard',
    children: 'Go to Dashboard',
    className: 'text-blue-600 hover:underline',
  },
};

export const RelativePath: Story = {
  args: {
    href: 'settings',
    children: 'Go to Settings',
    className: 'text-blue-600 hover:underline',
  },
};

export const WithCustomStyle: Story = {
  args: {
    href: '/profile',
    children: 'View Profile',
    className: 'text-green-600 font-bold hover:text-green-800',
  },
};

export const WithoutPrefetch: Story = {
  args: {
    href: '/large-page',
    children: 'Load Large Page',
    prefetch: false,
    className: 'text-blue-600 hover:underline',
  },
};

export const WithoutScroll: Story = {
  args: {
    href: '/no-scroll',
    children: 'Navigate Without Scroll',
    scroll: false,
    className: 'text-blue-600 hover:underline',
  },
};

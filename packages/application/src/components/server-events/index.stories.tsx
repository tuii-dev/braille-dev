import type { Meta, StoryObj } from '@storybook/react';
import { ServerEventsFeed } from './index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const meta = {
  title: 'Components/ServerEventsFeed',
  component: ServerEventsFeed,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof ServerEventsFeed>;

export default meta;
type Story = StoryObj<typeof ServerEventsFeed>;

export const Default: Story = {
  render: () => <ServerEventsFeed />,
};

import type { Meta, StoryObj } from '@storybook/react';
import { Scrollbars } from './index';

const meta = {
  title: 'Components/Scrollbars',
  component: Scrollbars,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Scrollbars>;

export default meta;
type Story = StoryObj<typeof Scrollbars>;

const LongContent = () => (
  <div className="space-y-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <p key={i} className="text-gray-700 dark:text-gray-300">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    ))}
  </div>
);

const WideContent = () => (
  <div className="whitespace-nowrap">
    {Array.from({ length: 10 }).map((_, i) => (
      <span key={i} className="inline-block mx-4 text-gray-700 dark:text-gray-300">
        Very wide content that requires horizontal scrolling
      </span>
    ))}
  </div>
);

export const VerticalScroll: Story = {
  render: () => (
    <div style={{ width: 400, height: 300 }}>
      <Scrollbars>
        <LongContent />
      </Scrollbars>
    </div>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <div style={{ width: 400, height: 100 }}>
      <Scrollbars>
        <WideContent />
      </Scrollbars>
    </div>
  ),
};

export const BothScrollbars: Story = {
  render: () => (
    <div style={{ width: 400, height: 300 }}>
      <Scrollbars>
        <div>
          <LongContent />
          <WideContent />
        </div>
      </Scrollbars>
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div style={{ width: 400, height: 300 }}>
      <Scrollbars>
        <LongContent />
      </Scrollbars>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

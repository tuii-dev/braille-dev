import type { Meta, StoryObj } from '@storybook/react';
import { Submit } from './index';
import { Form } from '../field';
import { z } from 'zod';

const meta = {
  title: 'Components/Submit',
  component: Submit,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Submit>;

export default meta;
type Story = StoryObj<typeof Submit>;

const schema = z.object({
  name: z.string(),
});

export const Default: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => new Promise(resolve => setTimeout(resolve, 2000))}>
      <Submit>Submit</Submit>
    </Form>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => new Promise(resolve => setTimeout(resolve, 2000))}>
      <Submit icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      }>
        Save Changes
      </Submit>
    </Form>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <Submit aria-disabled>Cannot Submit</Submit>
    </Form>
  ),
};

export const CustomClass: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <Submit className="w-full">Full Width Submit</Submit>
    </Form>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import Field, { Form } from './index';
import { z } from 'zod';

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof Field>;

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  tags: z.array(z.string()),
  color: z.string(),
});

export const TextInput: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <div className="w-[400px] space-y-4">
        <Field
          type="text"
          name="name"
          label="Name"
          required
          helperText="Enter your full name"
        />
      </div>
    </Form>
  ),
};

export const EmailInput: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <div className="w-[400px] space-y-4">
        <Field
          type="email"
          name="email"
          label="Email"
          required
          helperText="We'll never share your email"
        />
      </div>
    </Form>
  ),
};

export const SelectField: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <div className="w-[400px] space-y-4">
        <Field
          type="select"
          name="role"
          label="Role"
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'Regular User' },
            { value: 'guest', label: 'Guest' },
          ]}
          helperText="Select your role in the system"
        />
      </div>
    </Form>
  ),
};

export const EnumField: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <div className="w-[400px] space-y-4">
        <Field
          type="enum"
          name="tags"
          label="Tags"
          placeholder="Add tags..."
          helperText="Press Enter to add a tag"
        />
      </div>
    </Form>
  ),
};

export const ColorField: Story = {
  render: () => (
    <Form name="example" schema={schema} action={async () => {}}>
      <div className="w-[400px] space-y-4">
        <Field
          type="color"
          name="color"
          label="Theme Color"
          workspaceId="example"
          helperText="Pick a color for your workspace theme"
        />
      </div>
    </Form>
  ),
};

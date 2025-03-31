import type { Meta, StoryObj } from '@storybook/react';
import { TextInput, TextArea } from './index';

const meta = {
  title: 'Components/TextInput',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TextInput>;

export default meta;

type TextInputStory = StoryObj<typeof TextInput>;
type TextAreaStory = StoryObj<typeof TextArea>;

export const Default: TextInputStory = {
  render: () => (
    <div className="w-[300px]">
      <TextInput name="example" placeholder="Enter text..." />
    </div>
  ),
};

export const Required: TextInputStory = {
  render: () => (
    <div className="w-[300px]">
      <TextInput name="example" placeholder="Required field" required />
    </div>
  ),
};

export const WithDefaultValue: TextInputStory = {
  render: () => (
    <div className="w-[300px]">
      <TextInput name="example" defaultValue="Default text" />
    </div>
  ),
};

export const ReadOnly: TextInputStory = {
  render: () => (
    <div className="w-[300px]">
      <TextInput name="example" value="Read-only value" readOnly />
    </div>
  ),
};

export const Email: TextInputStory = {
  render: () => (
    <div className="w-[300px]">
      <TextInput
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />
    </div>
  ),
};

export const Password: TextInputStory = {
  render: () => (
    <div className="w-[300px]">
      <TextInput
        name="password"
        type="password"
        placeholder="Enter your password"
        required
      />
    </div>
  ),
};

export const TextAreaDefault: TextAreaStory = {
  render: () => (
    <div className="w-[300px]">
      <TextArea name="description" placeholder="Enter description..." rows={4} />
    </div>
  ),
};

export const TextAreaWithDefaultValue: TextAreaStory = {
  render: () => (
    <div className="w-[300px]">
      <TextArea
        name="description"
        rows={4}
        defaultValue="This is a default value for the textarea. It can contain multiple lines of text."
      />
    </div>
  ),
};

export const TextAreaReadOnly: TextAreaStory = {
  render: () => (
    <div className="w-[300px]">
      <TextArea
        name="description"
        rows={4}
        value="This is a read-only textarea content."
        readOnly
      />
    </div>
  ),
};

export const DarkMode: TextInputStory = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <TextInput name="example" placeholder="Text input in dark mode" />
      <TextArea name="description" placeholder="Textarea in dark mode" rows={4} />
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

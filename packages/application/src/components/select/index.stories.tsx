import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './index';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
];

export const Default: Story = {
  args: {
    name: 'fruit',
    options,
  },
};

export const WithDefaultValue: Story = {
  args: {
    name: 'fruit',
    options,
    defaultValue: 'banana',
  },
};

export const Disabled: Story = {
  args: {
    name: 'fruit',
    options,
    disabled: true,
  },
};

export const CustomRender: Story = {
  args: {
    name: 'fruit',
    options,
    renderOption: (option) => (
      <div className="flex items-center">
        <span className="w-3 h-3 rounded-full mr-2" style={{ 
          backgroundColor: option.value === 'apple' ? 'red' : 
                          option.value === 'banana' ? 'yellow' :
                          option.value === 'orange' ? 'orange' :
                          option.value === 'mango' ? 'pink' : 'brown'
        }} />
        {option.label}
      </div>
    ),
  },
};

export const WithForm: Story = {
  render: () => (
    <form>
      <Select
        name="fruit"
        form="fruit-form"
        options={options}
        className="w-[200px]"
      />
    </form>
  ),
};

export const DarkMode: Story = {
  args: {
    name: 'fruit',
    options,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

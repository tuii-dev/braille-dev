import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './index';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md">Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Example Dialog</DialogTitle>
          <DialogDescription>
            This is a description of the dialog content. You can put any content here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>This is the main content area of the dialog.</p>
        </div>
        <DialogFooter>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md">Open Long Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Long Content Dialog</DialogTitle>
          <DialogDescription>
            This dialog demonstrates how the component handles longer content.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis.</p>
          <p className="mb-4">Pellentesque sit amet hendrerit risus, sed porttitor quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Pellentesque sit amet hendrerit risus, sed porttitor quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <DialogFooter>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Close</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

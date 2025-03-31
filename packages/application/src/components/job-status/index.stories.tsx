import type { Meta, StoryObj } from '@storybook/react';
import { JobStatus, ActionStatus } from './index';
import { DataExtractionJobStatus } from "@jptr/braille-prisma";

const meta = {
  title: 'Components/JobStatus',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof JobStatus>;

export default meta;

type JobStatusStory = StoryObj<typeof JobStatus>;
type ActionStatusStory = StoryObj<typeof ActionStatus>;

export const Pending: JobStatusStory = {
  args: {
    status: DataExtractionJobStatus.PENDING,
  },
};

export const Running: JobStatusStory = {
  args: {
    status: DataExtractionJobStatus.RUNNING,
  },
};

export const Finished: JobStatusStory = {
  args: {
    status: DataExtractionJobStatus.FINISHED,
  },
};

export const Failed: JobStatusStory = {
  args: {
    status: DataExtractionJobStatus.FAILED,
  },
};

export const WithPill: JobStatusStory = {
  args: {
    status: DataExtractionJobStatus.RUNNING,
    pill: true,
  },
};

export const ActionWithLink: ActionStatusStory = {
  render: () => (
    <ActionStatus href="https://example.com" />
  ),
};

export const ActionWithoutLink: ActionStatusStory = {
  render: () => (
    <ActionStatus />
  ),
};

export const WorkspaceStatus = {
  ALL: 'all',
  PINNED: 'pinned',
  UNPINNED: 'unpinned',
} as const;

export type WorkspaceStatus = typeof WorkspaceStatus[keyof typeof WorkspaceStatus];

export interface WorkspaceFilters {
  search: string;
  status: WorkspaceStatus;
}

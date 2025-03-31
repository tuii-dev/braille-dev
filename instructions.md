#Goals:
- [x] Fix dashboard tab in light mode showing blue instead of violet
- [x] Clicking on the dashboard button on the left side menu should route you to the last opened workspace
- [x] Workspace Activity page is empty. Route should be /workspaces/activity
- [x] Workspace document count in document card should be below the workspace pinned status
- [x] Change workspace document card from being hidden / visible to being pinned / unpinned
- [x] Update workspace document card status colors to match the braille logo design
- [x] The dropdown status in workspace document layout grid, which is currently used for filtering with a dropdown: it should have 'all documents' be justified left, like the other options (in fact, all the options should be left justified).
- Workspace last updated date should include other activities, such as:
   - Workspace was updated (name of workspace, color, description)
   - Workspace was archived (name of workspace)
   - Workspace was unarchived (name of workspace)
   - Workspace was created (name of workspace)
   - Documents added to workspace since last login (count of documents)
- Within the workspace /workspaces/[id] page, there should be an arrow that lets you go from document to document. This will be found in the header called 'Document' which has an eye icon. You would click left and right arrows or chevrons to navigate to previous and next workspace documents.

# Implementation Plans

## 1. Fix dashboard tab in light mode showing blue instead of violet

**File to modify**: `packages/application/src/components/server/workspace-tabs/tab.tsx`

**Component**: `DashboardTab`

**Current Behavior**:
- The dashboard tab uses `bg-blue-700` for the active state in light mode
- Uses `dark:bg-indigo-600` for dark mode

**Implementation Plan**:
1. Change the active state background color from `bg-blue-700` to `bg-violet-600` to match the violet theme
2. Update the border color to match from `border-blue-700` to `border-violet-600`
3. Keep the dark mode colors as they are since indigo is already being used

**Code Changes Required**:
```tsx
className={cn(
  "relative flex items-center justify-center w-[120px] py-1 mx-2 rounded-t border h-[30px]",
  "transition-all duration-150 ease-in-out",
  {
    "bg-violet-600 border-violet-600 dark:bg-indigo-600 dark:border-white/40 z-20":
      active,
    "bg-stone-100 hover:bg-stone-50 dark:bg-midnight-900 dark:hover:bg-midnight-800":
      !active,
  },
  className,
)}
```

**Testing**:
1. Navigate to the dashboard page to verify the active tab color is violet in light mode
2. Toggle between light and dark mode to ensure colors are correct in both themes
3. Check hover states and transitions work smoothly

## 2. Route dashboard button to last used workspace

**Files to modify**: 
1. `packages/application/src/components/shell/index.tsx`

**Current Behavior**:
- The Workspaces button in the left menu currently routes to the first workspace in the list (`items[0]`)
- The app tracks the last used workspace using `useLastUsedWorkspace` hook but doesn't use it for navigation

**Implementation Plan**:
1. Modify the Workspaces navigation item to use the last used workspace ID for navigation
2. Fall back to `/workspaces` if there's no last used workspace

**Code Changes Required**:
```tsx
{
  name: "Workspaces",
  href: lastUsedWorkspaceId 
    ? `/workspaces/${lastUsedWorkspaceId}` 
    : "/workspaces",
  icon: DocumentDuplicateIcon,
  active: (pathname: string) => /^\/workspaces/.test(pathname),
  role: null,
},
```

**Testing**:
1. Click on a workspace to set it as the last used workspace
2. Click the Workspaces button in the left menu
3. Verify it navigates to the last used workspace
4. Clear browser data and verify it falls back to /workspaces when there's no last used workspace

## 3. Create Workspace Activity Page

### Current Behavior
- The `/workspaces/activity` route is empty
- Activity feed exists but is only shown in a limited capacity on the main dashboard

### Implementation Plan
1. Create new route and layout:
   - Create `/workspaces/activity/page.tsx` for the activity feed page
   - Create `/workspaces/activity/layout.tsx` for consistent styling
   - Ensure proper routing and navigation

2. Enhance Activity Feed Component:
   - Location: `/components/activity-feed/index.tsx`
   - Add loading state with spinner
   - Improve empty state messaging
   - Remove "View all" link when on activity page
   - Add error handling for activity fetching

3. Improve Activity Data:
   - Location: `/lib/getWorkspaceData.ts`
   - Increase number of workspace activities fetched (from 5 to 20)
   - Add document activities from each workspace
   - Add proper sorting of all activities by date
   - Enhance activity descriptions

### Code Changes Required

1. Create `/workspaces/activity/page.tsx`:
```tsx
export default async function Page() {
  const { user } = await getCurrentSessionUser();
  if (!user) {
    return redirect("/auth/signin");
  }

  const recentActivity = await getRecentActivity();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Activity Feed
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View all recent activity across your workspaces
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ActivityFeed initialActivities={recentActivity} />
      </div>
    </div>
  );
}
```

2. Update `getWorkspaceData.ts`:
```typescript
export async function getRecentActivity(): Promise<Activity[]> {
  const { tenantId } = await getCurrentSessionUser();

  const workspaceActivities = await prisma.workspace.findMany({
    where: {
      tenantId,
      archived: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
    select: {
      id: true,
      name: true,
      updatedAt: true,
      documents: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      },
    },
  });

  const activities: Activity[] = [];

  // Add workspace activities
  activities.push(
    ...workspaceActivities.map((workspace) => ({
      id: `workspace-${workspace.id}`,
      type: "workspace",
      description: `Workspace "${workspace.name}" was updated`,
      createdAt: workspace.updatedAt.toISOString(),
      workspaceId: workspace.id,
    }))
  );

  // Add document activities
  workspaceActivities.forEach((workspace) => {
    activities.push(
      ...workspace.documents.map((doc) => ({
        id: `document-${doc.id}`,
        type: "document",
        description: `Document "${doc.name}" in workspace "${workspace.name}" was updated`,
        createdAt: doc.updatedAt.toISOString(),
        workspaceId: workspace.id,
      }))
    );
  });

  return activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
```

### Testing Procedure
1. Route Testing:
   - Visit `/workspaces/activity`
   - Verify page loads without errors
   - Check layout consistency with other workspace pages

2. Activity Feed Testing:
   - Verify activities are displayed in chronological order
   - Test empty state when no activities exist
   - Verify loading state appears when fetching new activities
   - Check error handling when activity fetch fails

3. Data Testing:
   - Create new workspace, verify it appears in activity feed
   - Update existing workspace, verify update appears
   - Create/update documents, verify they appear in feed
   - Check activity timestamps are correct
   - Verify proper sorting of mixed activity types

## 4. Move Workspace Document Count Below Pinned Status

### Current Behavior
- Workspace document count badge is displayed in the same row as the pinned status
- This creates a cluttered look in the workspace card header
- Document count information is competing for attention with the workspace status

### Implementation Plan
1. Update Workspace Card Layout:
   - Location: `/components/dashboard/workspace-card.tsx`
   - Move document count badge below the pinned status
   - Create a new flex container for document count
   - Maintain proper spacing and alignment

2. Update Badge Styling:
   - Adjust badge styling to match the new layout
   - Ensure consistent appearance in both light and dark modes
   - Maintain accessibility of the count information

### Code Changes Required

1. Update `/components/dashboard/workspace-card.tsx`:
```tsx
<Card className={cn("p-4 transition-colors relative",
  !isPinned
    ? "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
    : "hover:bg-gray-50 dark:hover:bg-gray-900",
)}>
  <div className="flex flex-col gap-2">
    <div className="flex items-start gap-3">
      <div className={cn("p-2 rounded",
        !isPinned
          ? "bg-gray-200 dark:bg-gray-800"
          : "bg-blue-50 dark:bg-blue-900/30",
      )}>
        <Files className={cn("w-4 h-4",
          !isPinned
            ? "text-gray-500 dark:text-gray-400"
            : "text-blue-500 dark:text-blue-400",
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn("font-medium truncate",
          !isPinned && "text-gray-500 dark:text-gray-400",
        )}>
          {workspace.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Updated {formatDistanceToNow(new Date(workspace.updatedAt))} ago
        </p>
      </div>
      <div>
        {!isPinned ? (
          <Badge variant="default" className="flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            <span className="hidden md:inline">Hidden</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <Eye className="w-3 h-3" />
            <span className="hidden md:inline">Active</span>
          </Badge>
        )}
      </div>
    </div>
    {workspace._count.documents > 0 && (
      <div className="flex justify-end">
        <Badge variant="default" className="flex items-center gap-1">
          <Files className="w-3 h-3" />
          {workspace._count.documents}
        </Badge>
      </div>
    )}
  </div>
</Card>
```

### Testing Procedure
1. Visual Testing:
   - Verify document count appears below pinned status
   - Check alignment and spacing of all elements
   - Ensure consistent appearance across different workspace states
   - Test with different document count lengths (1, 10, 100, etc.)

2. Functional Testing:
   - Verify document count updates correctly
   - Check that clicking behavior is maintained
   - Test with both pinned and unpinned workspaces
   - Verify proper dark mode appearance

3. Responsive Testing:
   - Test on different screen sizes
   - Verify proper text wrapping
   - Check mobile appearance
   - Ensure badge remains visible at all breakpoints

## 5. Change Workspace Card Status Labels

### Current Behavior
- Workspace cards show "Hidden" or "Active" status
- This terminology is inconsistent with the pinning functionality
- Need to update text to match the actual pinned/unpinned state

### Implementation Plan
1. Update Workspace Card Status Text:
   - Location: `/components/dashboard/workspace-card.tsx`
   - Change status text from "Hidden" to "Unpinned"
   - Change status text from "Active" to "Pinned"
   - Keep existing Eye/EyeOff icons and styling

### Code Changes Required

1. Update `/components/dashboard/workspace-card.tsx`:
```tsx
<div className="flex shrink-0 gap-2">
  {!isPinned ? (
    <Badge variant="default" className="flex items-center gap-1">
      <EyeOff className="w-3 h-3" />
      <span className="hidden md:inline">Unpinned</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
      <Eye className="w-3 h-3" />
      <span className="hidden md:inline">Pinned</span>
    </Badge>
  )}
  {/* ... document count badge ... */}
</div>
```

### Testing Procedure
1. Visual Testing:
   - Verify new status badges show "Pinned/Unpinned" text
   - Check text alignment and spacing
   - Ensure text is visible on desktop and hidden on mobile

2. Functional Testing:
   - Test pinning/unpinning workspaces
   - Verify status text updates correctly when pinning state changes

3. Integration Testing:
   - Verify changes work with workspace filtering
   - Test sorting of pinned/unpinned workspaces
   - Check that workspace tabs show correct state

## 6. Update Workspace Card Status Colors

### Current Behavior
- Workspace cards use green for active/pinned state
- Colors don't match the Braille logo design
- Need to use indigo-600 (#567CF0) and yellow-300 (#F0EA56) from the logo

### Implementation Plan
1. Update Workspace Card Status Colors:
   - Location: `/components/dashboard/workspace-card.tsx`
   - Change pinned state to use indigo-600 (#567CF0)
   - Change unpinned state to use yellow-300 (#F0EA56)
   - Update hover states to use lighter variants

### Code Changes Required

1. Update `/components/dashboard/workspace-card.tsx`:
```tsx
<div className="flex shrink-0 gap-2">
  {!isPinned ? (
    <Badge variant="default" className="flex items-center gap-1 bg-yellow-300 dark:bg-yellow-300/10 text-yellow-800 dark:text-yellow-200">
      <EyeOff className="w-3 h-3" />
      <span className="hidden md:inline">Unpinned</span>
    </Badge>
  ) : (
    <Badge variant="outline" className="flex items-center gap-1 bg-indigo-600/10 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-200">
      <Eye className="w-3 h-3" />
      <span className="hidden md:inline">Pinned</span>
    </Badge>
  )}
  {/* ... document count badge ... */}
</div>
```

### Testing Procedure
1. Visual Testing:
   - Verify new badge colors match the Braille logo
   - Check color contrast meets accessibility standards
   - Test in both light and dark modes
   - Verify hover states are visually pleasing

2. Functional Testing:
   - Test pinning/unpinning workspaces
   - Verify colors update correctly when state changes

3. Integration Testing:
   - Check that colors work with workspace filtering
   - Verify colors are consistent across all workspace views

## 7. Add forward and backward navigation buttons to workspace document page.
  - Add left and right chevron arrows in the Document header section (next to eye icon)
  - Implementation details:
    1. UI Components:
       - Add chevron-left and chevron-right icons from Lucide React
       - Position arrows on either side of the current document title
       - Style arrows to be subtle when not hovered, more prominent on hover
       - Disable appropriate arrow when at start/end of document list
       - Add keyboard shortcuts (Ctrl/Cmd + Left/Right Arrow)
    
    2. Database Strategy:
       - Use cursor-based pagination for efficient navigation
       - Query adjacent documents using createdAt timestamp as cursor
       - Maintain all current workspace filters (search, date, uploader)
       - Structure queries to get closest document before/after current
    
    3. TanStack Query Integration:
       - Define navigation-specific query keys and types
       - Create useDocumentNavigation hook for managing state
       - Implement automatic prefetching of adjacent documents
       - Handle cache invalidation when filters change
       - Maintain query key consistency with existing document queries
    
    4. Navigation Logic:
       - Use cursor-based queries to find adjacent documents
       - Respect all current filters when navigating
       - Prefetch adjacent documents for instant navigation
       - Update URL using existing router
       - Preserve filter state during navigation
       - Handle edge cases (first/last document)
    
    5. Performance Optimization:
       - Cache navigation results for 30 seconds
       - Prefetch both document metadata and content
       - Reuse existing document data from cache
       - Minimize database queries through efficient cursors
       - Handle loading states smoothly
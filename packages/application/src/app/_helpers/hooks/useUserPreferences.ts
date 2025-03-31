"use client";

import { UserPreferences } from "@jptr/braille-prisma";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const userPreferencesKey = ["userPreferences"] as const;

async function fetchUserPreferences() {
  const response = await fetch("/api/users/preferences");
  if (!response.ok) {
    throw new Error("Failed to fetch preferences");
  }
  const { data } = await response.json();
  return data;
}

async function updateUserPreferencesInDb(
  preferences: Partial<UserPreferences>,
) {
  const response = await fetch("/api/users/preferences", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error("Failed to update preferences");
  }

  const { data } = await response.json();

  return data;
}

export function useUserPreferencesQuery(initialData?: UserPreferences) {
  return useQuery({
    queryKey: userPreferencesKey,
    queryFn: fetchUserPreferences,
    initialData,
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPreferencesInDb,
    onMutate: async (newPreferences) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userPreferencesKey });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData(userPreferencesKey);

      // Optimistically update to the new value, merging with existing data
      queryClient.setQueryData(userPreferencesKey, (old: any) => ({
        ...old,
        ...newPreferences,
      }));

      return { previousPreferences };
    },
    onError: (error, newPreferences, context) => {
      queryClient.setQueryData(
        userPreferencesKey,
        context?.previousPreferences,
      );
      toast.error("Unable to update preferences. Please try again.");
    },
    onSuccess: (updatedPreferences) => {},
  });
}

// Convenience hooks for specific preference updates
export function usePinnedWorkspaces(initialPinnedWorkspaces: string[] = []) {
  const { data: preferences } = useUserPreferencesQuery();
  const { mutateAsync: updatePreferences } = useUpdateUserPreferences();

  const pinnedWorkspaces: string[] =
    preferences?.pinnedWorkspaces ?? initialPinnedWorkspaces;

  const setPinnedWorkspaces = async (workspaceIds: string[]) => {
    await updatePreferences({ pinnedWorkspaces: workspaceIds });
  };

  return { pinnedWorkspaces, setPinnedWorkspaces };
}

export function useLastUsedWorkspace(
  initialLastUsedWorkspaceId: string | null = null,
) {
  const { data: preferences } = useUserPreferencesQuery();
  const { mutateAsync: updatePreferences } = useUpdateUserPreferences();

  const lastUsedWorkspaceId =
    preferences?.lastUsedWorkspaceId ?? initialLastUsedWorkspaceId;

  const setLastUsedWorkspace = async (id: string) => {
    await updatePreferences({ lastUsedWorkspaceId: id });
  };

  return { lastUsedWorkspaceId, setLastUsedWorkspace };
}

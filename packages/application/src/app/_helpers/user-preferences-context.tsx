"use client";

import { UserPreferences } from "@jptr/braille-prisma";
import React, { createContext, useContext, ReactNode } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

type UserPreferencesContextType = {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  pinnedWorkspaces: string[];
  setPinnedWorkspaces: (workspaceIds: string[]) => Promise<void>;
  lastUsedWorkspaceId: string | null;
  setLastUsedWorkspaceId: (workspaceId: string | null) => Promise<void>;
  isUpdating: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(
  undefined
);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};

async function fetchUserPreferences() {
  const response = await fetch('/api/users/preferences');
  if (!response.ok) {
    throw new Error('Failed to fetch preferences');
  }
  const { data } = await response.json();
  return data;
}

async function updateUserPreferencesInDb(preferences: Partial<UserPreferences>) {
  const { pinnedWorkspaces, ...rest } = preferences;
  
  const response = await fetch('/api/users/preferences', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...rest,
      pinnedIds: pinnedWorkspaces,
      lastModifiedAt: new Date().toISOString()
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update preferences');
  }
  
  const { data } = await response.json();
  return data;
}

type UserPreferencesProviderProps = {
  children: ReactNode;
  initialPreferences: UserPreferences;
  pinnedWorkspaces?: string[];
  lastUsedWorkspaceId?: string | null;
};

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({
  children,
  initialPreferences,
  pinnedWorkspaces: initialPinnedWorkspaces = [],
  lastUsedWorkspaceId: initialLastUsedWorkspaceId = null,
}) => {
  const queryClient = useQueryClient();
  
  // Keep preferences in sync with the database
  const { data: preferences = {
    pinnedIds: initialPinnedWorkspaces,
    lastUsedWorkspaceId: initialLastUsedWorkspaceId,
    lastModifiedAt: new Date()
  }} = useQuery({
    queryKey: ['userPreferences'],
    queryFn: fetchUserPreferences,
    initialData: {
      pinnedIds: initialPinnedWorkspaces,
      lastUsedWorkspaceId: initialLastUsedWorkspaceId,
      lastModifiedAt: new Date()
    }
  });
  
  const { mutateAsync: updatePreferencesMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateUserPreferencesInDb,
    onSuccess: (updatedPreferences) => {
      // Immediately update the cache with the new preferences
      queryClient.setQueryData(['userPreferences'], updatedPreferences);
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    await updatePreferencesMutation(newPreferences);
  };

  const setPinnedWorkspaces = async (workspaceIds: string[]) => {
    await updatePreferences({ pinnedWorkspaces: workspaceIds });
  };

  const setLastUsedWorkspaceId = async (workspaceId: string | null) => {
    await updatePreferences({ lastUsedWorkspaceId: workspaceId });
  };

  return (
    <UserPreferencesContext.Provider
      value={{ 
        preferences: initialPreferences, 
        updatePreferences, 
        pinnedWorkspaces: preferences.pinnedIds || [], 
        setPinnedWorkspaces,
        lastUsedWorkspaceId: preferences.lastUsedWorkspaceId || null,
        setLastUsedWorkspaceId,
        isUpdating
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

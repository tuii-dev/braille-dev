"use client";

import { createContext, useContext, useState } from "react";

type EditingContextState = { id: string; column: string } | null;

type EditingContextType = {
  editingField: EditingContextState;
  setEditingField: React.Dispatch<React.SetStateAction<EditingContextState>>;
};

const EditingContext = createContext<EditingContextType>({
  editingField: null,
  setEditingField: () => {},
});

export const EditingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [editingId, setEditingId] = useState<EditingContextState>(null);

  return (
    <EditingContext.Provider
      value={{
        editingField: editingId,
        setEditingField: setEditingId,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
};

export const useEditField = () => {
  const context = useContext(EditingContext);
  if (!context) {
    throw new Error("useEditField must be used within a EditingProvider");
  }
  return context;
};

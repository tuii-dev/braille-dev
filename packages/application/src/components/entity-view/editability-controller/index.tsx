"use client";

import { createContext, useContext, useMemo } from "react";

type EditabilityValue = {
  editable: boolean;
};

const EditabilityContext = createContext<EditabilityValue>({ editable: true });

export const EditabilityController = ({
  editable,
  children,
}: EditabilityValue & { children: React.ReactNode }) => {
  return (
    <EditabilityContext.Provider
      value={useMemo(() => ({ editable }), [editable])}
    >
      {children}
    </EditabilityContext.Provider>
  );
};

export const useEditability = () => {
  return useContext(EditabilityContext);
};

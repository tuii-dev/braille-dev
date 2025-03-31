"use client";

import React, { useContext, useState } from "react";

import Editor from "@monaco-editor/react";

import { Submit } from "@/components/form-submit-button";
import { useTheme } from "@/components/theme";

import { createNewVersion } from "./actions";

const EditorContext = React.createContext<{
  initialValue: string | undefined;
  setInitialValue: (value: string | undefined) => void;
  value: string | undefined;
  setValue: (value: string | undefined) => void;
  hasChanges: boolean;
} | null>(null);

export const EditorProvider = ({
  appId,
  value: defaultValueProp,
  children,
}: {
  appId: string;
  value?: string;
  children: React.ReactNode;
}) => {
  const [initialValue, setInitialValue] = useState<string | undefined>(
    defaultValueProp,
  );
  const [value, setValue] = useState(defaultValueProp);

  if (defaultValueProp !== initialValue) {
    setInitialValue(defaultValueProp);
    setValue(defaultValueProp);
  }

  const hasChanges = initialValue !== value;

  return (
    <EditorContext.Provider
      value={{
        initialValue,
        setInitialValue,
        value,
        setValue,
        hasChanges,
      }}
    >
      <form
        action={createNewVersion.bind(null, appId, value)}
        className="h-full w-full"
      >
        {children}
      </form>
    </EditorContext.Provider>
  );
};

const useEditor = () => {
  const value = useContext(EditorContext);
  if (!value) throw new Error("useEditor must be used within a EditorProvider");
  return value;
};

export const SubmitButton = ({}) => {
  const { hasChanges } = useEditor();

  return <Submit aria-disabled={!hasChanges}>Save</Submit>;
};

export const AppEditor = () => {
  const { value, setValue } = useEditor();
  const { theme } = useTheme();

  return (
    <Editor
      theme={theme === "dark" ? "vs-dark" : "light"}
      language="json"
      value={value}
      onChange={(value) => setValue(value)}
    />
  );
};

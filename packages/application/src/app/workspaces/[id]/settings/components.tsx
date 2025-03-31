"use client";

import { usePathname } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Submit } from "@/components/form-submit-button";
import { Link } from "@/components/link";
import { Switch } from "@/components/switch";

import { updateWorkspaceModelConnections } from "./actions";

type TabProps = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

export const Tab = ({ href, className, children }: TabProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        className,
        "pb-4 pt-0 px-2 text-sm font-semibold border-b-[3px] border-transparent hover:border-gray-400 text-gray-600 dark:text-gray-400",
        {
          "text-black dark:text-gray-200 border-cyan-400 hover:border-cyan-400":
            isActive,
        },
      )}
    >
      {children}
    </Link>
  );
};

type TabsProps = {
  tabs: { href: string; label: string }[];
  centered?: boolean;
};

export const SettingsTabs = ({ tabs, centered }: TabsProps) => {
  return (
    <ul
      className={cn("font-base flex gap-x-8 -mx-2 pt-2", {
        "justify-center": centered,
      })}
    >
      {tabs.map((tab) => (
        <li key={tab.href}>
          <Tab className="py-2 flex" href={tab.href}>
            {tab.label}
          </Tab>
        </li>
      ))}
    </ul>
  );
};

const WorkspaceEntityModelConnectionContext = React.createContext({
  entityModels: new Map<string, boolean>(),
  onChange: (modeId: string, connected: boolean) => {},
});

const useWorkspaceEntityModelConnection = () => {
  return React.useContext(WorkspaceEntityModelConnectionContext);
};

type EntityModelFormProps = {
  connectedModelIds: string[];
  children: React.ReactNode;
};

export const EntityModelForm = ({
  connectedModelIds,
  children,
}: EntityModelFormProps) => {
  const [state, setState] = useState(
    new Map<string, boolean>(connectedModelIds.map((id) => [id, true])),
  );

  const onChange = useCallback((modeId: string, connected: boolean) => {
    setState((state) => new Map(state.set(modeId, connected)));
  }, []);

  const value = useMemo(() => {
    return {
      entityModels: state,
      onChange,
    };
  }, [state, onChange]);

  return (
    <WorkspaceEntityModelConnectionContext.Provider value={value}>
      <form action={updateWorkspaceModelConnections}>
        {children}
        <Submit className="mt-4">Save</Submit>
      </form>
    </WorkspaceEntityModelConnectionContext.Provider>
  );
};

type EntityModelCheckboxProps = {
  label: string;
  name: string;
  value: string;
};

export const EntityModelCheckbox = ({
  label,
  name,
  value,
}: EntityModelCheckboxProps) => {
  const { entityModels, onChange } = useWorkspaceEntityModelConnection();

  return (
    <div className="flex items-center">
      <Switch
        name={name}
        value={value}
        onChange={(checked) => onChange(value, checked)}
        initialValue={entityModels.get(value) ?? false}
      />
      <span className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 ml-4">
        {label}
      </span>
    </div>
  );
};

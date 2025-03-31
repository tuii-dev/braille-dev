"use client";

import React from "react";

import { App } from "@jptr/braille-prisma";

import { EntityModel } from "@/lib/model/entities";

const AppContext = React.createContext<{
  app?: App;
  tenantId: string;
} | null>(null);

type AppProviderProps = {
  app?: App;
  tenantId: string;
  children: React.ReactNode;
};

export const AppProvider = ({ tenantId, app, children }: AppProviderProps) => {
  return (
    <AppContext.Provider value={{ tenantId, app }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const app = React.useContext(AppContext);
  if (!app) {
    throw new Error("Could not find app in AppContext");
  }
  return app;
};

const EntitySchemaContext = React.createContext<EntityModel | null>(null);

export const useEntitySchema = () => {
  const value = React.useContext(EntitySchemaContext);
  if (!value) {
    throw new Error("Could not find entity schema in EntitySchemaContext");
  }
  return value;
};

const EntityContext = React.createContext<Record<string, any> | null>(null);

type EntityProviderProps = {
  entities: Record<string, any>;
  children: React.ReactNode;
};

export const EntityProvider = ({ entities, children }: EntityProviderProps) => {
  return (
    <EntityContext.Provider value={entities}>{children}</EntityContext.Provider>
  );
};

export const useEntity = (id: string) => {
  const store = React.useContext(EntityContext);
  if (!store) {
    throw new Error("gg");
  }
  return store[id];
};

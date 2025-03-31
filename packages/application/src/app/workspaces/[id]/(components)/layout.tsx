"use client";

import { createContext, useEffect, useState } from "react";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

type WorkspaceDocumentsContextType = {
  fullWidthDocumentView: boolean;
  setFullWidthDocumentView: (expanded: boolean) => void;
};

const WorkspaceDocumentsContext = createContext<WorkspaceDocumentsContextType>({
  fullWidthDocumentView: false,
  setFullWidthDocumentView: () => {},
});

const LAYOUT_COOKIE_KEY = "react-resizable-panels:layout";

const useResizeableLayout = ({
  scope,
  initialLayout,
}: {
  scope: string;
  initialLayout: [number, number];
}) => {
  const [[layoutX, layoutY], setLayout] = useState(initialLayout);

  const onXLayout = (sizes: number[]) => {
    if (sizes.length === 2) {
      const nextX = sizes[0] / (sizes[0] + sizes[1]);
      setLayout((prev) => [nextX, prev[1]]);
    }
  };

  const onYLayout = (sizes: number[]) => {
    if (sizes.length === 2) {
      const nextY = sizes[0] / (sizes[0] + sizes[1]);
      setLayout((prev) => [prev[0], nextY]);
    }
  };

  useEffect(() => {
    const layout = JSON.stringify([layoutX, layoutY]);
    window.document.cookie = `${LAYOUT_COOKIE_KEY}=${layout}; path=/`;
  }, [layoutX, layoutY, scope]);

  return {
    onXLayout,
    onYLayout,
    layoutX: Math.round(layoutX * 100),
    layoutY: Math.round(layoutY * 100),
  };
};

export const Layout = ({
  workspaceId,
  layout,
  left,
  right,
}: {
  workspaceId: string;
  left: React.ReactNode;
  right: React.ReactNode;
  layout?: [number, number];
}) => {
  const [state, setState] = useState(false);
  const { onXLayout, layoutX } = useResizeableLayout({
    scope: workspaceId,
    initialLayout: layout ?? [0.5, 0.5],
  });

  return (
    <WorkspaceDocumentsContext.Provider
      value={{
        fullWidthDocumentView: state,
        setFullWidthDocumentView: setState,
      }}
    >
      <PanelGroup direction="horizontal" onLayout={onXLayout}>
        <Panel
          style={{ overflow: "visible", minWidth: 0 }}
          minSize={0}
          defaultSize={layoutX}
        >
          {left}
        </Panel>
        <PanelResizeHandle className="flex px-2 m-auto h-full opacity-10 data-[resize-handle-state=hover]:opacity-100 data-[resize-handle-state=drag]:opacity-100 transition-all">
          <div className="relative w-1 m-auto h-2/3 bg-none bg-black dark:bg-white rounded-full "></div>
        </PanelResizeHandle>
        <Panel
          style={{ overflow: "visible" }}
          minSize={25}
          defaultSize={100 - layoutX}
          className="p-5 pl-0 lg:min-w-[460px] shrink-0"
        >
          {right}
        </Panel>
      </PanelGroup>
    </WorkspaceDocumentsContext.Provider>
  );
};

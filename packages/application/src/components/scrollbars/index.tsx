"use client";

import { memo } from "react";
import { Scrollbars as RCS } from "react-custom-scrollbars";

type Props = React.ComponentProps<typeof RCS> & {
  inset?: number;
};

const Component = (props: Props) => {
  return (
    <RCS
      className="relative"
      renderTrackVertical={(props) => {
        return (
          <div
            {...props}
            className="track-vertical rounded-full right-0 w-2 top-0 bottom-0 bg-transparent"
          />
        );
      }}
      renderTrackHorizontal={(props) => (
        <div
          {...props}
          className="track-horizontal rounded-full left-0 right-0 h-2 bottom-0 bg-transparent"
        />
      )}
      renderThumbHorizontal={(props) => (
        <div
          {...props}
          className="z-10 thumb-horizontal rounded-full bg-gray-400 dark:bg-gray-600 cursor-pointer"
        />
      )}
      renderThumbVertical={(props) => (
        <div
          {...props}
          className="z-10 thumb-vertical rounded-full bg-gray-400 dark:bg-gray-600 cursor-pointer"
        />
      )}
      universal
      autoHide
      {...props}
    />
  );
};

export const Scrollbars = memo(Component);

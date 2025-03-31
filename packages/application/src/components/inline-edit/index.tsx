import { Fragment, useEffect, useRef, useState } from "react";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { Button } from "../button";
import { cn } from "@/lib/utils";

type InlineEditProps = {
  editing: boolean;
  editView?: () => React.ReactNode;
  readView: () => React.ReactNode;
  onCancel: () => void;
  onBlur: () => void;
  formProps?: React.ComponentProps<"form">;
  hideActions?: boolean;
  submitOnBlur?: boolean;
};

export const useOnFocusOut = (onBlur: () => void) => {
  const focusWithinRef = useRef(false);

  const handleBlur = () => {
    focusWithinRef.current = false;
    setTimeout(() => {
      if (focusWithinRef.current === false) {
        onBlur();
      }
    }, 0);
  };

  const handleFocus = () => {
    focusWithinRef.current = true;
  };

  return {
    onBlur: handleBlur,
    onFocus: handleFocus,
  };
};

export const InlineEdit = ({
  editing,
  editView,
  readView,
  formProps,
  onBlur: propsOnBlur,
  onCancel,
  hideActions,
}: InlineEditProps) => {
  const { onFocus, onBlur } = useOnFocusOut(() => {
    propsOnBlur();
  });

  return editView && editing ? (
    <form
      noValidate
      className={cn("inline relative", formProps?.className)}
      onFocus={onFocus}
      onBlur={onBlur}
      {...formProps}
    >
      {editView()}
      {!hideActions && (
        <div className="absolute top-full flex right-0 translate-y-2 gap-x-1 z-50 px-2">
          <Button
            type="submit"
            variant="minimal"
            icon={<CheckCircleIcon className="w-3.5 h-3.5" />}
          />
          <Button
            type="button"
            variant="minimal"
            icon={<XCircleIcon className="w-3.5 h-3.5" />}
            onClick={onCancel}
          />
        </div>
      )}
    </form>
  ) : (
    readView()
  );
};

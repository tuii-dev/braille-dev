"use client";

import { useEditField } from "../editing-context";
import { EditButton } from "../../edit-button";

export const EditFieldButton = ({
  fieldId,
  column,
}: {
  fieldId: string;
  column: string;
}) => {
  const { setEditingField } = useEditField();

  return (
    <EditButton
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 "
      onClick={() => {
        setEditingField({ id: fieldId, column });
      }}
    />
  );
};

import { createContext, useContext } from "react";

type Alignment = "left" | "right";

const NumericAlignmentContext = createContext<Alignment>("left");

export const NumericAlignment = ({
  alignment,
  children,
}: {
  alignment: Alignment;
  children: React.ReactNode;
}) => {
  return (
    <NumericAlignmentContext.Provider value={alignment}>
      {children}
    </NumericAlignmentContext.Provider>
  );
};

export const useNumericAlignment = () => {
  return useContext(NumericAlignmentContext);
};

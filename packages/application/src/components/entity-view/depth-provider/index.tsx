import { createContext, useContext } from "react";

const DataViewDepth = createContext<number>(0);

export const DataViewDepthProvider = ({
  depth,
  children,
}: {
  children: React.ReactNode;
  depth?: number;
}) => {
  const inheritedDepth = useContext(DataViewDepth);

  return (
    <DataViewDepth.Provider value={depth ?? inheritedDepth + 1}>
      {children}
    </DataViewDepth.Provider>
  );
};

export const useDataViewDepth = () => useContext(DataViewDepth);

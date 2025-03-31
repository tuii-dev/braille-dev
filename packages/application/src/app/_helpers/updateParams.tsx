import { useCallback } from "react";

// Function to create query string with updated params
function createQueryString(
  existingParams:
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined,
  newParamsArray: { [x: string]: string }[],
) {
  const params = new URLSearchParams(existingParams);

  newParamsArray.forEach((newParams: { [x: string]: string }) => {
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === "paramDelete") {
        params.delete(key);
      } else {
        params.set(key, newParams[key]);
      }
    });
  });
  return params.toString();
}

// Custom hook to update query string
export function useUpdateQueryString() {
  const updateQueryString = useCallback((newParamsArray: any) => {
    const updatedParams = createQueryString(
      new URLSearchParams(window.location.search).toString(),
      newParamsArray,
    );
    window.history.pushState(null, "", `?${updatedParams}`);
  }, []);

  return updateQueryString;
}

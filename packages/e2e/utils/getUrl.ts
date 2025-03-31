export const getURL = (path?: string) => {
  const baseURL = "http://localhost:3000";
  if (path) {
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return baseURL + normalizedPath;
  }
  return baseURL;
};

"use client";

import React, { useCallback } from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({
  theme: initialTheme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) => {
  const [theme, _setTheme] = React.useState<Theme>(initialTheme);

  const setTheme: typeof _setTheme = useCallback((theme) => {
    window.document.cookie = `braille:darkmode=${theme === "dark"}; path=/`;
    _setTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const value = React.useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return value;
};

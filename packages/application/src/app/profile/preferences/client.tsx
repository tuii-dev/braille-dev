"use client";

import { useTheme } from "@/components/theme";
import { Switch } from "@/components/switch";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Switch
      name="theme"
      onChange={(value) => {
        setTheme(value ? "dark" : "light");
      }}
      initialValue={theme === "dark"}
    />
  );
};

import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export function useTheme() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return {
    theme: theme.mode,
    colors: theme.colors,
    toggleTheme,
  };
}
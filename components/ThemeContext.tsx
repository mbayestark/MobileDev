import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

const themes = {
  light: {
    background: "#ffffff",
    text: "#000000",
    card: "#f2f2f2",
    primary: "#4da8ff",
    border: "#000000",
  },
  dark: {
    background: "#121212",
    text: "#ffffff",
    card: "#1f1f1f",
    primary: "#4da8ff",
    border: "#ffffff",
  },
} as const;

type ThemeMode = keyof typeof themes;

type ThemeContextValue = {
  mode: ThemeMode;
  colors: (typeof themes)[ThemeMode];
  setMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>((system as ThemeMode) || "light");

  const value = useMemo<ThemeContextValue>(() => {
    const colors = themes[mode];
    return {
      mode,
      colors,
      setMode,
      toggleTheme: () => setMode(mode === "light" ? "dark" : "light"),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

// Theme type
interface Theme {
  mode: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentSoft: string;
    border: string;
    mapStyle: string;
    cardShadow: string;
    drawerBg: string;
    statusBar: string;
  };
}
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    background: "#F2EFE9",
    surface: "#f3f4f6",
    surfaceAlt: "#e5e7eb",
    text: "#1A1814",
    textSecondary: "#6b7280",
    accent: "#3b82f6",
    accentSoft: "#F0DFC0",
    border: "#e5e7eb",
    mapStyle: "standard",
    cardShadow: "#e5e7eb",
    drawerBg: "#F2EFE9",
    statusBar: "dark-content",
  },
};

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    background: "#0F0E0C",
    surface: "#1f2937",
    surfaceAlt: "#374151",
    text: "#F0EDE6",
    textSecondary: "#9ca3af",
    accent: "#60a5fa",
    accentSoft: "#3A2E1A",
    border: "#374151",
    mapStyle: "dark",
    cardShadow: "#000000",
    drawerBg: "#1C1A17",
    statusBar: "light-content",
  },
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem("APP_THEME");
    if (savedTheme === "dark") {
      setTheme(darkTheme);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.mode === "light" ? darkTheme : lightTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem("APP_THEME", newTheme.mode);
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

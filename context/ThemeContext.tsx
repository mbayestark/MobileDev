import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

const Light = {
    bg: '#ffffff',
    surface: '#f2f2f7',
    surfaceAlt: '#e5e5ea',
    border: '#d1d1d6',
    text: '#000000',
    textDim: '#6b6b6b',
    accent: '#0078d4',
    red: '#e74c3c',
    green: '#2ecc71',
    amber: '#f0a500',
    blue: '#4a9eff',
}

const Dark = {
    bg: '#0d0f14',
    surface: '#141720',
    surfaceAlt: '#1a1e2a',
    border: '#252a38',
    text: '#e8eaf0',
    textDim: '#8890a8',
    accent: '#0078d4',
    red: '#e74c3c',
    green: '#2ecc71',
    amber: '#f0a500',
    blue: '#4a9eff',

}

type Theme = typeof Light;

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: Dark,
    isDark: true,
    toggleTheme: () => { }
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    const toggleTheme = () => setIsDark(prev => !prev);

    const theme = isDark ? Dark : Light;

    return (
        <ThemeContext.Provider value={{ theme: isDark ? Dark : Light, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}


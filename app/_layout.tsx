import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { TouchableOpacity, Text } from "react-native";

function ThemeToggle() {
    const { toggleTheme, theme } = useTheme();

    return (
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10, backgroundColor: theme.accent, borderRadius: 5, marginRight: 10 }}>
            <Text style={{ color: '#ffffff' }}>Toggle</Text>
        </TouchableOpacity>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <Stack>
                <Stack.Screen name="index" options={{ title: 'Blog List', headerRight: () => <ThemeToggle /> }} />
                <Stack.Screen name="details/[id]" options={{ title: 'Blog Details' }} />
            </Stack>
        </ThemeProvider>
    );
}

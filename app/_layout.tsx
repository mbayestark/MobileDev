import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import { useEffect } from 'react';
import { requestNotificationPermissions } from "../lib/notifications";

export default function RootLayout() {
    useEffect(() => {
        requestNotificationPermissions();
    }, []);

    return (
        <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="list/[id]" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}
import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import {useEffect} from 'react';
import { requestNotificationPermissions } from "../lib/notifications";

export default function RootLayout() {

    useEffect(() => {
        requestNotificationPermissions();},[]);

    return (
        <ThemeProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    )
}
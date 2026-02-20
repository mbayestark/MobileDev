import { ThemeProvider } from '@/components/ThemeContext';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { isLoggedIn } from '@/auth/auth'; // <- create this file

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await isLoggedIn();
      setLoggedIn(ok);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  // allow the login route to show when not logged in
  if (!loggedIn) {
    return (
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
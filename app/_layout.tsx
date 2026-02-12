import { Stack } from 'expo-router';
import { ThemeProvider } from '../components/theme/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Settings' }} />
        <Stack.Screen name="weather" options={{ title: 'Weather' }} />
      </Stack>
    </ThemeProvider>
  );
}

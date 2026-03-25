import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                },
                tabBarActiveTintColor: theme.accent,
                tabBarInactiveTintColor: theme.textDim,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'My Day',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="sunny-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="lists"
                options={{
                    title: 'Lists',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
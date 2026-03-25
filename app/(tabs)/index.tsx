import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getTasks } from '../../lib/storage';
import { Task } from '../../lib/types';

export default function MyDayScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);

    const loadData = async () => {
        const allTasks = await getTasks();
        setTasks(allTasks.filter(t => t.myDay && !t.completed));
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const s = styles(theme);

    return (
        <View style={s.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.greeting}>{getGreeting()}</Text>
                    <Text style={s.date}>{getDate()}</Text>
                </View>
                <TouchableOpacity
                    style={s.goToList}
                    onPress={() => router.push('/list/myday')}
                >
                    <Ionicons name="sunny-outline" size={22} color={theme.amber} />
                </TouchableOpacity>

                <TouchableOpacity onPress={async () => {
                    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                    await AsyncStorage.clear();
                    loadData();
                }}>
                    <Text style={{ color: 'red', fontSize: 12 }}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleTheme}>
                    <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.textDim} />
                </TouchableOpacity>
            </View>

            {/* Task count */}
            <View style={s.countContainer}>
                <Text style={s.countText}>
                    {tasks.length === 0
                        ? 'Nothing planned for today'
                        : `${tasks.length} task${tasks.length > 1 ? 's' : ''} for today`}
                </Text>
            </View>

            {/* Task List */}
            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <Ionicons name="sunny-outline" size={56} color={theme.amber} />
                        <Text style={s.emptyText}>Your day is clear</Text>
                        <Text style={s.emptySubText}>Add tasks to My Day from any list</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.taskItem}
                        onPress={() => router.push(`/list/myday`)}
                    >
                        <View style={s.checkbox}>
                            {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <Text style={s.taskTitle}>{item.title}</Text>
                        {item.priority === 'high' && (
                            <Ionicons name="star" size={14} color={theme.amber} />
                        )}
                        {item.dueTime && (
                            <Text style={s.timeTag}>{item.dueTime}</Text>
                        )}
                    </TouchableOpacity>
                )}
            />

            {/* FAB */}
            <TouchableOpacity
                style={s.fab}
                onPress={() => router.push('/list/myday')}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 60 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.text,
    },
    date: {
        fontSize: 14,
        color: theme.textDim,
        marginTop: 4,
    },
    goToList: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.amber + '22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 4,
    },
    countText: {
        fontSize: 13,
        color: theme.textDim,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        gap: 10,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.textDim,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.textDim,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskTitle: { flex: 1, fontSize: 16, color: theme.text },
    timeTag: {
        fontSize: 12,
        color: theme.textDim,
        backgroundColor: theme.surfaceAlt,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
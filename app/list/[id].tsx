import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getTasks, addTask as saveTask, updateTask, deleteTask, getLists } from '../../lib/storage';
import { Task, TaskList } from '../../lib/types';
import TaskDetailSheet from '../../components/TaskDetailSheet';
import { useTimer } from '../../lib/useTimer';
import { formatTime } from '../../lib/timerStore';

export default function TaskListScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme, isDark } = useTheme();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [list, setList] = useState<TaskList | null>(null);
    const [newTask, setNewTask] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const timer = useTimer();

    const loadData = async () => {
        if (!id) return;
        const allTasks = await getTasks();
        const allLists = await getLists();
        const currentList = allLists.find(l => l.id === id) || null;
        setList(currentList);
        if (id === 'tasks') {
            setCompletedTasks(allTasks.filter(t => t.completed));
        } else if (id === 'myday') {
            setCompletedTasks(allTasks.filter(t => t.completed && t.myDay));
        } else if (id === 'important') {
            setCompletedTasks(allTasks.filter(t => t.completed && t.priority === 'high'));
        } else if (id === 'planned') {
            setCompletedTasks(allTasks.filter(t => t.completed && t.dueDate));
        } else {
            setCompletedTasks(allTasks.filter(t => t.completed && t.listId === id));
        }

        if (id === 'tasks') {
            setTasks(allTasks.filter(t => !t.completed));
        } else if (id === 'myday') {
            setTasks(allTasks.filter(t => t.myDay && !t.completed));
        } else if (id === 'important') {
            setTasks(allTasks.filter(t => t.priority === 'high' && !t.completed));
        } else if (id === 'planned') {
            setTasks(allTasks.filter(t => t.dueDate && !t.completed));
        } else {
            setTasks(allTasks.filter(t => t.listId === id && !t.completed));
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [id]));

    const addTask = async () => {
        const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2);
        if (!newTask.trim()) return;
        const task: Task = {
            id: generateId(),
            title: newTask.trim(),
            completed: false,
            listId: id,
            myDay: id === 'myday',
            priority: id === 'important' ? 'high' : 'medium',
            dueDate: id === 'planned' ? new Date().toISOString().split('T')[0] : undefined,
            createdAt: new Date().toISOString(),
            repeat: 'none',
        };
        await saveTask(task);
        setNewTask('');
        loadData();
    };

    const makeComplete = async (task: Task) => {
        await updateTask({ ...task, completed: !task.completed });
        loadData();
    };

    const s = styles(theme);

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color={theme.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: list?.color }]}>{list?.name || 'Tasks'}</Text>
                <View style={{ width: 26 }} />
            </View>

            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        <Ionicons name="checkmark-circle-outline" size={48} color={theme.textDim} />
                        <Text style={s.emptyText}>No tasks yet</Text>
                        <Text style={s.emptySubText}>Add one below</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={s.taskItem} onPress={() => { setSelectedTask(item); setSheetVisible(true) }}>

                        <TouchableOpacity
                            style={[s.checkbox, item.completed && { backgroundColor: theme.accent, borderColor: theme.accent }]}
                            onPress={() => makeComplete(item)}
                        >
                            {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={[s.taskTitle, item.completed && s.taskCompleted]}>{item.title}</Text>
                        {timer.taskId === item.id && (
                            <View style={[
                                s.timerBadge,
                                { backgroundColor: timer.running ? theme.accent : theme.surfaceAlt }
                            ]}>
                                <Ionicons
                                    name={timer.running ? 'timer' : 'timer-outline'}
                                    size={12}
                                    color={timer.running ? '#fff' : theme.textDim}
                                />
                                <Text style={[
                                    s.timerBadgeText,
                                    { color: timer.running ? '#fff' : theme.textDim }
                                ]}>
                                    {formatTime(timer.remaining)}
                                </Text>
                            </View>
                        )}
                        {item.priority === 'high' && <Ionicons name="star" size={14} color={theme.amber} />}
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    completedTasks.length > 0 ? (
                        <View style={{ marginTop: 24 }}>
                            <TouchableOpacity
                                style={s.completedHeader}
                                onPress={() => setShowCompleted(prev => !prev)}>
                                <Ionicons name={showCompleted ? 'chevron-down' : 'chevron-up'} size={16} color={theme.textDim} />
                                <Text style={s.taskCompleted}>
                                    {showCompleted ? `Hiding ${completedTasks.length} completed` : `Showing ${completedTasks.length} completed`}
                                </Text>
                            </TouchableOpacity>

                            {showCompleted && completedTasks.map(item => (
                                <TouchableOpacity key={item.id} style={s.taskItem}>
                                    <TouchableOpacity
                                        style={[s.checkbox, { backgroundColor: theme.accent, borderColor: theme.accent }]}
                                        onPress={() => makeComplete(item)}
                                    >
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    </TouchableOpacity>
                                    <Text style={[s.taskTitle, s.taskCompleted]}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null
                }
            />

            <View style={s.inputContainer}>
                <Ionicons name="add-circle-outline" size={22} color={theme.accent} />
                <TextInput
                    style={s.input}
                    placeholder="Add a task"
                    placeholderTextColor={theme.textDim}
                    value={newTask}
                    onChangeText={setNewTask}
                    onSubmitEditing={addTask}
                    returnKeyType="done"
                />
                <TouchableOpacity onPress={addTask}>
                    <Ionicons name="arrow-up-circle" size={28} color={newTask.trim() ? theme.accent : theme.textDim} />
                </TouchableOpacity>
            </View>

            <TaskDetailSheet
                task={selectedTask}
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onUpdate={loadData}
            />
        </KeyboardAvoidingView>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 60 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    headerTitle: { fontSize: 28, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', marginTop: 80, gap: 8 },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.textDim },
    emptySubText: { fontSize: 14, color: theme.textDim },
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
    taskCompleted: { textDecorationLine: 'line-through', color: theme.textDim },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        gap: 12,
    },
    input: { flex: 1, fontSize: 16, color: theme.text },
    completedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    completedHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textDim,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    timerBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
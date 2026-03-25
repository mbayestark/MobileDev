import { View, Text, StyleSheet, StatusBar, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { use, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getTasks } from '../../lib/storage';
import { Task } from '../../lib/types';
import TaskDetailSheet from '../../components/TaskDetailSheet';

export default function SearchScreen(){
    const {theme,isDark}=useTheme();
    const [query,setquery]=useState('');
    const [results,setResults]=useState<Task[]>([]);
    const [selectedTask,setSelectedTask]=useState<Task|null>(null);
    const [sheetVisible,setSheetVisible]=useState(false);

    const handleSearch= async (text)=>{
        setquery(text);
        if(!text.trim()){
            setResults([]);
            return;
        }

        const allTasks=await getTasks();
        const filtered=allTasks.filter(task=>task.title.toLowerCase().includes(text.toLowerCase()));
        setResults(filtered);
    }
        const s = styles(theme);

    return (
        <View style={s.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <Text style={s.headerTitle}>Search</Text>

            {/* Search Bar */}
            <View style={s.searchBar}>
                <Ionicons name="search-outline" size={18} color={theme.textDim} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search tasks and notes..."
                    placeholderTextColor={theme.textDim}
                    value={query}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setquery(''); setResults([]); }}>
                        <Ionicons name="close-circle" size={18} color={theme.textDim} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            <FlatList
                data={results}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={s.emptyContainer}>
                        {query.length === 0 ? (
                            <>
                                <Ionicons name="search-outline" size={48} color={theme.textDim} />
                                <Text style={s.emptyText}>Search your tasks</Text>
                                <Text style={s.emptySubText}>Find tasks by title or note</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="sad-outline" size={48} color={theme.textDim} />
                                <Text style={s.emptyText}>No results for "{query}"</Text>
                            </>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.taskItem}
                        onPress={() => { setSelectedTask(item); setSheetVisible(true); }}
                    >
                        <View style={[
                            s.checkbox,
                            item.completed && { backgroundColor: theme.accent, borderColor: theme.accent }
                        ]}>
                            {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.taskTitle, item.completed && s.taskCompleted]}>
                                {item.title}
                            </Text>
                            {item.notes ? (
                                <Text style={s.taskNote} numberOfLines={1}>{item.notes}</Text>
                            ) : null}
                        </View>
                        {item.priority === 'high' && (
                            <Ionicons name="star" size={14} color={theme.amber} />
                        )}
                        {item.dueDate && (
                            <Text style={s.dateTag}>{item.dueDate}</Text>
                        )}
                    </TouchableOpacity>
                )}
            />

            <TaskDetailSheet
                task={selectedTask}
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onUpdate={() => handleSearch(query)}
            />
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 60 },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.text,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: theme.text,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        gap: 10,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.textDim,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.textDim,
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
    taskCompleted: { textDecorationLine: 'line-through', color: theme.textDim },
    taskNote: { fontSize: 13, color: theme.textDim, marginTop: 2 },
    dateTag: {
        fontSize: 12,
        color: theme.textDim,
        backgroundColor: theme.surfaceAlt,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },

});
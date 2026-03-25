import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getLists, addList, deleteList } from '../../lib/storage';
import { TaskList } from '../../lib/types';
import { DEFAULT_LISTS } from '../../constants/defaultLists';

export default function ListsScreen() {
    const { theme, isDark } = useTheme();
    const router = useRouter();
    const [lists, setLists] = useState<TaskList[]>([]);

    const loadLists = async () => {
        const data = await getLists();
        setLists(data);
    };

    const getIcon = (id: string) => {
        switch (id) {
            case 'myday': return 'sunny-outline';
            case 'important': return 'star-outline';
            case 'planned': return 'calendar-outline';
            case 'tasks': return 'checkmark-circle-outline';
            default: return 'list-outline';
        }
    };

    useFocusEffect(useCallback(() => { loadLists(); }, []));

    const s = styles(theme);

    return (
        <View style={s.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>Lists</Text>
                <TouchableOpacity style={s.addBtn}>
                    <Ionicons name="add" size={26} color={theme.accent} />
                </TouchableOpacity>
            </View>

            {/* Smart Lists */}
            <Text style={s.sectionLabel}>SMART LISTS</Text>
            <FlatList
                data={lists.filter(l => l.isDefault)}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.listItem}
                        onPress={() => router.push(`/list/${item.id}`)}
                    >
                        <View style={[s.listIcon, { backgroundColor: item.color + '22' }]}>
                            <Ionicons name={getIcon(item.id)} size={20} color={item.color} />
                        </View>
                        <Text style={s.listName}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
                    </TouchableOpacity>
                )}
            />

            {/* Custom Lists */}
            <Text style={s.sectionLabel}>MY LISTS</Text>
            <FlatList
                data={lists.filter(l => !l.isDefault)}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text style={s.empty}>No custom lists yet. Tap + to create one.</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.listItem}
                        onPress={() => router.push(`/list/${item.id}`)}
                    >
                        <View style={[s.listIcon, { backgroundColor: item.color + '22' }]}>
                            <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                        </View>
                        <Text style={s.listName}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 60 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    headerTitle: { fontSize: 32, fontWeight: '700', color: theme.text },
    addBtn: { padding: 4 },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.textDim,
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 8,
        marginTop: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: theme.surface,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        gap: 14,
    },
    listIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listName: { flex: 1, fontSize: 16, color: theme.text, fontWeight: '500' },
    empty: { color: theme.textDim, paddingHorizontal: 20, paddingVertical: 8 },
});
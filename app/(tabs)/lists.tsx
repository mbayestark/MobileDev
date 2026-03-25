import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getLists, addList, deleteList, saveTasks, getTasks } from '../../lib/storage';
import { TaskList } from '../../lib/types';

const LIST_ICONS = [
    'bookmark-outline', 'briefcase-outline', 'home-outline',
    'cart-outline', 'barbell-outline', 'flag-outline',
    'game-controller-outline', 'airplane-outline', 'nutrition-outline',
    'bulb-outline', 'musical-notes-outline', 'camera-outline',
    'wallet-outline', 'construct-outline', 'leaf-outline',
    'heart-outline', 'star-outline', 'flame-outline',
    'school-outline', 'trophy-outline', 'people-outline',
    'planet-outline', 'rocket-outline', 'bicycle-outline',
];

const COLORS = ['#4a9eff', '#f0a500', '#2ecc71', '#e74c3c', '#9b59b6', '#e67e22'];

const getDefaultIcon = (id: string) => {
    switch (id) {
        case 'myday': return 'sunny-outline';
        case 'important': return 'star-outline';
        case 'planned': return 'calendar-outline';
        case 'tasks': return 'checkmark-circle-outline';
        default: return 'list-outline';
    }
};

export default function ListsScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [lists, setLists] = useState<TaskList[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListIcon, setNewListIcon] = useState('bookmark-outline');
    const [newListColor, setNewListColor] = useState('#4a9eff');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const loadLists = async () => {
        const data = await getLists();
        setLists(data);
    };

    useFocusEffect(useCallback(() => { loadLists(); }, []));

    const createList = async () => {
        if (!newListName.trim()) return;
        const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2);
        const list: TaskList = {
            id: generateId(),
            name: newListName.trim(),
            emoji: newListIcon,
            color: newListColor,
            isDefault: false,
        };
        await addList(list);
        setNewListName('');
        setNewListIcon('bookmark-outline');
        setNewListColor('#4a9eff');
        setShowIconPicker(false);
        setModalVisible(false);
        loadLists();
    };

    const handleDeleteList = async (id: string) => {
        Alert.alert(
            'Delete List',
            'Are you sure you want to delete this list? All tasks in it will also be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteList(id);
                        // Also delete all tasks in this list
                        const tasks = await getTasks();
                        await saveTasks(tasks.filter((t: any) => t.listId !== id));
                        loadLists();
                    }
                }
            ]
        );
    };
    const s = styles(theme);

    return (
        <View style={s.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>Lists</Text>
                <View style={s.headerRight}>
                    <TouchableOpacity onPress={toggleTheme} style={s.iconBtn}>
                        <Ionicons
                            name={isDark ? 'sunny-outline' : 'moon-outline'}
                            size={22}
                            color={theme.textDim}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={s.iconBtn}>
                        <Ionicons name="add" size={26} color={theme.accent} />
                    </TouchableOpacity>
                </View>
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
                            <Ionicons name={getDefaultIcon(item.id) as any} size={20} color={item.color} />
                        </View>
                        <Text style={s.listName}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
                    </TouchableOpacity>
                )}
            />

            {/* My Lists */}
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
                        onLongPress={() => handleDeleteList(item.id)}
                    >
                        <View style={[s.listIcon, { backgroundColor: item.color + '22' }]}>
                            <Ionicons name={item.emoji as any} size={20} color={item.color} />
                        </View>
                        <Text style={s.listName}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
                    </TouchableOpacity>
                )}
            />

            {/* Create List Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#00000066' }}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                />
                <View style={s.modal}>
                    <View style={s.modalHandle} />
                    <Text style={s.modalTitle}>New List</Text>

                    {/* Icon + Name Row */}
                    <View style={s.modalRow}>
                        <TouchableOpacity
                            style={[s.emojiBtn, { backgroundColor: newListColor + '33' }]}
                            onPress={() => setShowIconPicker(prev => !prev)}
                        >
                            <Ionicons name={newListIcon as any} size={24} color={newListColor} />
                        </TouchableOpacity>
                        <TextInput
                            style={s.modalInput}
                            placeholder="List name"
                            placeholderTextColor={theme.textDim}
                            value={newListName}
                            onChangeText={setNewListName}
                            autoFocus
                        />
                    </View>

                    {/* Icon Picker */}
                    {showIconPicker && (
                        <View style={s.emojiGrid}>
                            {LIST_ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        s.emojiOption,
                                        newListIcon === icon && { backgroundColor: newListColor + '33' }
                                    ]}
                                    onPress={() => {
                                        setNewListIcon(icon);
                                        setShowIconPicker(false);
                                    }}
                                >
                                    <Ionicons
                                        name={icon as any}
                                        size={22}
                                        color={newListIcon === icon ? newListColor : theme.textDim}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Color Picker */}
                    <Text style={s.modalLabel}>Color</Text>
                    <View style={s.colorRow}>
                        {COLORS.map(color => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    s.colorDot,
                                    { backgroundColor: color },
                                    newListColor === color && s.colorDotSelected
                                ]}
                                onPress={() => setNewListColor(color)}
                            />
                        ))}
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        style={[s.createBtn, { backgroundColor: newListColor }]}
                        onPress={createList}
                    >
                        <Text style={s.createBtnText}>Create List</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 4 },
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
    modal: {
        backgroundColor: theme.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.border,
        alignSelf: 'center',
        marginVertical: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 20,
    },
    modalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    emojiBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalInput: {
        flex: 1,
        fontSize: 18,
        color: theme.text,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingVertical: 8,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        backgroundColor: theme.surfaceAlt,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    emojiOption: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.textDim,
        marginBottom: 12,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    colorDotSelected: {
        borderWidth: 3,
        borderColor: theme.text,
    },
    createBtn: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    createBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
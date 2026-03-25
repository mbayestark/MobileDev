import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, Modal, ScrollView, Platform
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { updateTask, deleteTask } from '../lib/storage';
import { Task } from '../lib/types';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
    onUpdate: () => void;
};

export default function TaskDetailSheet({ task, visible, onClose, onUpdate }: Props) {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [myDay, setMyDay] = useState(false);
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly'>('none');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setNotes(task.notes || '');
            setMyDay(task.myDay);
            setPriority(task.priority);
            setRepeat(task.repeat);
            setDueDate(task.dueDate ? new Date(task.dueDate) : null);
        }
    }, [task]);

    const handleSave = async () => {
        if (!task) return;
        await updateTask({
            ...task,
            title: title.trim() || task.title,
            notes,
            myDay,
            priority,
            repeat,
            dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
        });
        onUpdate();
        onClose();
    };

    const handleDelete = async () => {
        if (!task) return;
        await deleteTask(task.id);
        onUpdate();
        onClose();
    };

    const s = styles(theme);

    if (!task) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />

            <View style={s.sheet}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* Drag Handle */}
                    <View style={s.handle} />

                    {/* Title */}
                    <TextInput
                        style={s.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        onBlur={handleSave}
                        multiline
                    />

                    {/* My Day Toggle */}
                    <TouchableOpacity
                        style={[s.row, myDay && { backgroundColor: theme.amber + '22' }]}
                        onPress={() => { setMyDay(prev => !prev); }}
                    >
                        <Ionicons name="sunny-outline" size={20} color={myDay ? theme.amber : theme.textDim} />
                        <Text style={[s.rowText, { color: myDay ? theme.amber : theme.textDim }]}>
                            {myDay ? 'Added to My Day' : 'Add to My Day'}
                        </Text>
                        {myDay && <Ionicons name="checkmark" size={16} color={theme.amber} />}
                    </TouchableOpacity>

                    {/* Due Date */}
                    <TouchableOpacity
                        style={s.row}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={theme.textDim} />
                        <Text style={[s.rowText, { color: dueDate ? theme.text : theme.textDim }]}>
                            {dueDate ? dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Add due date'}
                        </Text>
                        {dueDate && (
                            <TouchableOpacity onPress={() => setDueDate(null)}>
                                <Ionicons name="close-circle" size={16} color={theme.textDim} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={dueDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, date) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (date) setDueDate(date);
                            }}
                        />
                    )}

                    {/* Priority */}
                    <View style={s.row}>
                        <Ionicons name="flag-outline" size={20} color={theme.textDim} />
                        <Text style={s.rowLabel}>Priority</Text>
                        <View style={s.priorityRow}>
                            {(['high', 'medium', 'low'] as const).map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[s.priorityBtn, priority === p && { backgroundColor: theme.accent }]}
                                    onPress={() => setPriority(p)}
                                >
                                    <Text style={[s.priorityText, priority === p && { color: '#fff' }]}>
                                        {p.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Repeat */}
                    <View style={s.row}>
                        <Ionicons name="repeat-outline" size={20} color={theme.textDim} />
                        <Text style={s.rowLabel}>Repeat</Text>
                        <View style={s.priorityRow}>
                            {(['none', 'daily', 'weekly'] as const).map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[s.priorityBtn, repeat === r && { backgroundColor: theme.accent }]}
                                    onPress={() => setRepeat(r)}
                                >
                                    <Text style={[s.priorityText, repeat === r && { color: '#fff' }]}>
                                        {r.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    <View style={s.notesContainer}>
                        <Ionicons name="document-text-outline" size={20} color={theme.textDim} />
                        <TextInput
                            style={s.notesInput}
                            placeholder="Add a note"
                            placeholderTextColor={theme.textDim}
                            value={notes}
                            onChangeText={setNotes}
                            onBlur={handleSave}
                            multiline
                        />
                    </View>

                    {/* Delete */}
                    <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={18} color={theme.red} />
                        <Text style={[s.rowText, { color: theme.red }]}>Delete task</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000066',
    },
    sheet: {
        backgroundColor: theme.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.border,
        alignSelf: 'center',
        marginVertical: 12,
    },
    titleInput: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        gap: 12,
        borderRadius: 8,
        paddingHorizontal: 4,
    },
    rowText: { flex: 1, fontSize: 15, color: theme.text },
    rowLabel: { flex: 1, fontSize: 15, color: theme.textDim },
    priorityRow: { flexDirection: 'row', gap: 6 },
    priorityBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: theme.surfaceAlt,
    },
    priorityText: { fontSize: 11, fontWeight: '600', color: theme.textDim },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        gap: 12,
    },
    notesInput: {
        flex: 1,
        fontSize: 15,
        color: theme.text,
        minHeight: 60,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 24,
        paddingVertical: 8,
    },
});
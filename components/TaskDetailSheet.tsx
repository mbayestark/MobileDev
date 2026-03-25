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
import { scheduleTaskNotification, cancelTaskNotification } from '../lib/notifications';
import { setTimer, startTimer, pauseTimer, resetTimer, formatTime } from '../lib/timerStore';
import { useTimer } from '../lib/useTimer';

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
    const [dueTime, setDueTime] = useState<string | undefined>(undefined);
    const [timePicker, setTimePicker] = useState(false);
    const [reminder, setReminder] = useState(false);
    const timer = useTimer();
    const isThisTask = timer.taskId === task?.id;


    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setNotes(task.notes || '');
            setMyDay(task.myDay);
            setPriority(task.priority);
            setRepeat(task.repeat);
            setDueDate(task.dueDate ? new Date(task.dueDate) : null);
            setDueTime(task.dueTime);
            setReminder(!!task.notificationId);
        }
        setShowDatePicker(false);
        setTimePicker(false);
    }, [task]);

    const handleSave = async () => {
        if (!task) return;
        let notificationId = task.notificationId;

        if (notificationId) {
            await cancelTaskNotification(notificationId);
            notificationId = undefined;
        }
        if (reminder && dueDate && dueTime) {
            const id = await scheduleTaskNotification(
                task.id,
                title,
                dueDate.toISOString().split('T')[0],
                dueTime
            );
            notificationId = id || undefined;
        }
        await updateTask({
            ...task,
            title: title.trim() || task.title,
            notes,
            myDay,
            priority,
            repeat,
            dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
            dueTime,
            notificationId,
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

    const handleSetDuration = (minutes: number) => {
        if (!task) return;
        setTimer(task.id, task.title, minutes * 60);
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


                    <View style={s.sheetHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: theme.textDim, fontSize: 15 }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={{ color: theme.accent, fontSize: 15, fontWeight: '600' }}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={s.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />

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
                        <View>
                            <TouchableOpacity
                                style={{ alignItems: 'flex-end', paddingRight: 16, paddingVertical: 8 }}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={{ color: theme.accent, fontWeight: '600', fontSize: 16 }}>Done</Text>
                            </TouchableOpacity>
                            <DateTimePicker
                                value={dueDate || new Date()}
                                mode="date"
                                display="spinner"
                                onChange={(event, date) => {
                                    if (date) setDueDate(date);
                                }}
                            />
                        </View>
                    )}

                    <TouchableOpacity style={s.row} onPress={() => setTimePicker(true)}>
                        <Ionicons name="time-outline" size={20} color={theme.textDim} />
                        <Text style={[s.rowText, { color: dueTime ? theme.text : theme.textDim }]}>
                            {dueTime || 'Add time'}
                        </Text>
                        {dueTime && (
                            <TouchableOpacity onPress={() => setDueTime(undefined)}>
                                <Ionicons name="close-circle" size={16} color={theme.textDim} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                    {timePicker && (
                        <View>
                            <TouchableOpacity
                                style={{ alignItems: 'flex-end', paddingRight: 16, paddingVertical: 8 }}
                                onPress={() => setTimePicker(false)}
                            >
                                <Text style={{ color: theme.accent, fontWeight: '600', fontSize: 16 }}>Done</Text>
                            </TouchableOpacity>
                            <DateTimePicker
                                value={dueTime ? new Date(`2000-01-01T${dueTime}`) : new Date()}
                                mode="time"
                                display="spinner"
                                onChange={(event, date) => {
                                    if (date) {
                                        const h = date.getHours().toString().padStart(2, '0');
                                        const m = date.getMinutes().toString().padStart(2, '0');
                                        setDueTime(`${h}:${m}`);
                                    }
                                }}
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={[s.row, reminder && { backgroundColor: theme.blue + '22' }]}
                        onPress={() => setReminder(prev => !prev)}
                    >
                        <Ionicons name="notifications-outline" size={20} color={reminder ? theme.blue : theme.textDim} />
                        <Text style={[s.rowText, { color: reminder ? theme.blue : theme.textDim }]}>
                            {reminder ? 'Reminder on (15 min before)' : 'Remind me'}
                        </Text>
                        {reminder && <Ionicons name="checkmark" size={16} color={theme.blue} />}
                    </TouchableOpacity>

                    <View style={s.timerSection}>
                        <View style={s.timerHeader}>
                            <Ionicons name="timer-outline" size={20} color={theme.textDim} />
                            <Text style={s.rowLabel}>Focus Timer</Text>
                        </View>

                        <View style={s.timerPresets}>
                            {[0.2, 1, 5, 15, 25, 45, 60].map(min => (
                                <TouchableOpacity
                                    key={min}
                                    style={[
                                        s.presetBtn,
                                        isThisTask && timer.duration === min * 60 && { backgroundColor: theme.accent }
                                    ]}
                                    onPress={() => handleSetDuration(min)}
                                >
                                    <Text style={[
                                        s.presetText,
                                        isThisTask && timer.duration === min * 60 && { color: '#fff' }
                                    ]}>
                                        {min}m
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {isThisTask && (
                            <View style={s.timerDisplay}>
                                <Text style={s.timerText}>{formatTime(timer.remaining)}</Text>
                                <View style={s.timerControls}>
                                    <TouchableOpacity
                                        style={s.timerBtn}
                                        onPress={timer.running ? pauseTimer : startTimer}
                                    >
                                        <Ionicons
                                            name={timer.running ? 'pause' : 'play'}
                                            size={20}
                                            color={theme.accent}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.timerBtn} onPress={resetTimer}>
                                        <Ionicons name="refresh" size={20} color={theme.textDim} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

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

                    <View style={s.notesContainer}>
                        <Ionicons name="document-text-outline" size={20} color={theme.textDim} />
                        <TextInput
                            style={s.notesInput}
                            placeholder="Add a note"
                            placeholderTextColor={theme.textDim}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>

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
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
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
    timerSection: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        gap: 12,
    },
    timerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timerPresets: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    presetBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: theme.surfaceAlt,
    },
    presetText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.textDim,
    },
    timerDisplay: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    timerText: {
        fontSize: 48,
        fontWeight: '700',
        color: theme.text,
        fontVariant: ['tabular-nums'],
    },
    timerControls: {
        flexDirection: 'row',
        gap: 24,
    },
    timerBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
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
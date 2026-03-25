import * as Notifications from 'expo-notifications';

type TimerState = {
    taskId: string | null;
    taskTitle: string | null;
    duration: number;
    remaining: number;
    running: boolean;
    listeners: Set<() => void>;
};

const state: TimerState = {
    taskId: null,
    taskTitle: '',
    duration: 25 * 60,
    remaining: 25 * 60,
    running: false,
    listeners: new Set(),
};

let interval: ReturnType<typeof setInterval> | null = null;

export function getTimerState() {
    return {
        taskId: state.taskId,
        duration: state.duration,
        remaining: state.remaining,
        running: state.running,
    };
}

export function subscribeToTimer(fn: () => void): () => void {
    state.listeners.add(fn);
    return () => { state.listeners.delete(fn); };
}

function notify() {
    state.listeners.forEach(fn => fn());
}

export function setTimer(taskId: string, taskTitle: string, durationSeconds: number) {
    state.taskId = taskId;
    state.taskTitle = taskTitle;
    state.duration = durationSeconds;
    state.remaining = durationSeconds;
    state.running = false;
    if (interval) clearInterval(interval);
    interval = null;
    notify();
}

export function startTimer() {
    if (state.running || state.remaining <= 0) return;
    state.running = true;
    interval = setInterval(() => {
        if (state.remaining <= 0) {
            state.running = false;
            if (interval) clearInterval(interval);
            interval = null;
            Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏱ Timer Complete!',
                    body: 'Your focus session for "' + state.taskTitle + '" is done. Take a break!',
                    sound: true,
                },
                trigger: null,
            });
        } else {
            state.remaining -= 1;
        }
        notify();
    }, 1000);
    notify();
}

export function pauseTimer() {
    state.running = false;
    if (interval) clearInterval(interval);
    interval = null;
    notify();
}

export function resetTimer() {
    state.remaining = state.duration;
    state.running = false;
    if (interval) clearInterval(interval);
    interval = null;
    notify();
}

export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
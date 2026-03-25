import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner:true,
        shouldShowList:true,
    }),
});

// Request permissions 
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

// Schedule a notification for a task
export async function scheduleTaskNotification(
    taskId: string,
    title: string,
    dueDate: string,
    dueTime: string
): Promise<string | null> {
    try {
        const [year, month, day] = dueDate.split('-').map(Number);
        const [hours, minutes] = dueTime.split(':').map(Number);

        const triggerDate = new Date(year, month - 1, day, hours, minutes);

        // Notify 15 minutes before
        triggerDate.setMinutes(triggerDate.getMinutes() - 15);

        // Don't schedule if time is in the past
        if (triggerDate <= new Date()) return null;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Task Reminder',
                body: `"${title}" is due in 15 minutes`,
                data: { taskId },
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });

        return id;
    } catch (e) {
        console.error('Failed to schedule notification', e);
        return null;
    }
}

// Cancel a scheduled notification
export async function cancelTaskNotification(notificationId: string): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
        console.error('Failed to cancel notification', e);
    }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
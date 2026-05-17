import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bookings", {
      name: "Booking Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function scheduleBookingReminder(
  bookingId: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<string | null> {
  const now = new Date();
  if (triggerDate <= now) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { bookingId },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return id;
}

export async function scheduleBookingReminders(
  bookingId: string,
  itemOrFacilityName: string,
  startTime: number
) {
  const start = new Date(startTime);

  // 30 minutes before
  const thirtyMinBefore = new Date(startTime - 30 * 60 * 1000);
  await scheduleBookingReminder(
    bookingId,
    "Booking in 30 minutes",
    `Your booking for ${itemOrFacilityName} starts at ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
    thirtyMinBefore
  );

  // At booking time
  await scheduleBookingReminder(
    bookingId,
    "Booking starts now",
    `Your booking for ${itemOrFacilityName} is now. Scan to check in!`,
    start
  );
}

export async function cancelBookingReminders(bookingId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.bookingId === bookingId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function sendInAppNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
    },
    trigger: null,
  });
}

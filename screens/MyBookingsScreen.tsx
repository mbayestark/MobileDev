import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { cancelBookingReminders } from "../utils/notifications";

type Props = {
  userId: Id<"users">;
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending": return "#F59E0B";
    case "confirmed": return "#3B82F6";
    case "in_progress": return "#22C55E";
    case "completed": return "#6B7280";
    case "no_show": return "#EF4444";
    case "cancelled": return "#9CA3AF";
    default: return "#999";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending": return "Pending";
    case "confirmed": return "Confirmed";
    case "in_progress": return "In Progress";
    case "completed": return "Completed";
    case "no_show": return "No-Show";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "pending": return "time-outline";
    case "confirmed": return "checkmark-circle-outline";
    case "in_progress": return "play-circle-outline";
    case "completed": return "checkmark-done-outline";
    case "no_show": return "close-circle-outline";
    case "cancelled": return "ban-outline";
    default: return "ellipse-outline";
  }
}

export default function MyBookingsScreen({ userId }: Props) {
  const bookings = useQuery(api.bookings.getUserBookings, { userId });
  const cancelBooking = useMutation(api.bookings.cancelBooking);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (bookings === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const handleCancel = (bookingId: Id<"bookings">) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelBooking({ bookingId, userId });
            await cancelBookingReminders(bookingId);
          } catch (error) {
            Alert.alert("Error", "Failed to cancel booking");
          }
        },
      },
    ]);
  };

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending" || b.status === "in_progress"
  );
  const past = bookings.filter(
    (b) => b.status === "completed" || b.status === "no_show" || b.status === "cancelled"
  );

  return (
    <FlatList
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
      data={[
        ...(upcoming.length > 0
          ? [{ type: "header" as const, title: "Upcoming" }]
          : []),
        ...upcoming.map((b) => ({ type: "booking" as const, ...b })),
        ...(past.length > 0
          ? [{ type: "header" as const, title: "Past" }]
          : []),
        ...past.map((b) => ({ type: "booking" as const, ...b })),
      ]}
      keyExtractor={(item, index) =>
        item.type === "header" ? `header-${index}` : (item as any)._id
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      renderItem={({ item }) => {
        if (item.type === "header") {
          return <Text style={styles.sectionHeader}>{item.title}</Text>;
        }

        const booking = item as any;
        const isUpcoming =
          booking.status === "confirmed" ||
          booking.status === "pending" ||
          booking.status === "in_progress";

        return (
          <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name={
                  booking.itemName
                    ? "cube-outline"
                    : ("business-outline" as any)
                }
                size={22}
                color="#3B82F6"
              />
              <Text style={styles.bookingName}>
                {booking.itemName || booking.facilityName}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(booking.status) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(booking.status) as any}
                  size={12}
                  color={getStatusColor(booking.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(booking.status) },
                  ]}
                >
                  {getStatusLabel(booking.status)}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.timeText}>
                {formatDate(booking.startTime)}
              </Text>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.timeText}>
                {formatTime(booking.startTime)} -{" "}
                {formatTime(booking.endTime)}
              </Text>
            </View>

            {booking.notes && (
              <Text style={styles.notesText}>{booking.notes}</Text>
            )}

            {isUpcoming && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(booking._id)}
              >
                <Text style={styles.cancelText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={60} color="#DDD" />
          <Text style={styles.emptyTitle}>No Bookings</Text>
          <Text style={styles.emptySubtext}>
            Book equipment or facilities to see them here
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  bookingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingLeft: 30,
  },
  timeText: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
  },
  notesText: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    paddingLeft: 30,
    fontStyle: "italic",
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancelText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    marginTop: 4,
    textAlign: "center",
  },
});

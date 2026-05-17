import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { RootStackParamList } from "../types";
import { scheduleBookingReminders } from "../utils/notifications";
import UserProfileModal from "../components/UserProfileModal";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "1.5h", value: 90 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}

function timeSince(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "available": return "#22C55E";
    case "in_use": return "#F59E0B";
    case "missing": return "#EF4444";
    case "damaged": return "#6B7280";
    default: return "#999";
  }
}

export default function ItemDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ItemDetail">>();
  const { itemId, userId } = route.params;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [bookNotes, setBookNotes] = useState("");
  const [profileUser, setProfileUser] = useState<any>(null);

  const item = useQuery(api.items.getByBarcode, "skip");
  const itemData = useQuery(api.items.getAll);
  const activeCheckout = useQuery(api.items.getUserActiveCheckout, {
    userId,
    itemId,
  });
  const itemBookings = useQuery(api.bookings.getItemBookings, { itemId });
  const currentHolder = useQuery(api.items.getItemCurrentHolder, { itemId });

  const checkoutItem = useMutation(api.items.checkout);
  const returnItem = useMutation(api.items.returnItem);
  const bookItem = useMutation(api.bookings.bookItem);

  const currentItem = itemData?.find((i) => i._id === itemId);

  if (!currentItem || activeCheckout === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        <Text style={styles.doneTitle}>Success!</Text>
        <Text style={styles.doneMessage}>{resultMessage}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Back to Equipment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasCheckout = activeCheckout !== null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await checkoutItem({ userId, itemId });
      setResultMessage(`You checked out "${currentItem.name}"`);
      setDone(true);
    } catch (error) {
      Alert.alert("Error", "Failed to checkout. Item may no longer be available.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      const result = await returnItem({ userId, itemId });
      setResultMessage(
        `Returned "${currentItem.name}" after ${formatDuration(result.duration)}`
      );
      setDone(true);
    } catch (error) {
      Alert.alert("Error", "Failed to return item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Icon + status */}
        <View style={styles.topSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={40} color="#3B82F6" />
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(currentItem.status) + "20" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(currentItem.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(currentItem.status) },
              ]}
            >
              {currentItem.status === "in_use"
                ? "In Use"
                : currentItem.status.charAt(0).toUpperCase() +
                  currentItem.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.itemName}>{currentItem.name}</Text>
        <Text style={styles.barcode}>{currentItem.barcode}</Text>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={18} color="#666" />
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{currentItem.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{currentItem.location}</Text>
          </View>
          {currentItem.notes && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={18} color="#666" />
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{currentItem.notes}</Text>
            </View>
          )}
        </View>

        {/* Current holder (when someone else has it) */}
        {currentHolder && !hasCheckout && (
          <TouchableOpacity
            style={styles.holderRow}
            onPress={() =>
              setProfileUser({
                name: currentHolder.name,
                studentId: currentHolder.studentId,
                email: currentHolder.email,
                phone: currentHolder.phone,
                role: currentHolder.role,
                major: currentHolder.major,
                year: currentHolder.year,
                department: currentHolder.department,
                position: currentHolder.position,
              })
            }
          >
            <View style={styles.holderAvatar}>
              <Text style={styles.holderAvatarText}>
                {currentHolder.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.holderName}>{currentHolder.name}</Text>
              <Text style={styles.holderSince}>
                Checked out {timeSince(currentHolder.since)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        )}

        {/* Action area */}
        {hasCheckout && activeCheckout ? (
          <View style={styles.actionSection}>
            <View style={styles.infoBox}>
              <Ionicons name="time-outline" size={18} color="#F59E0B" />
              <Text style={styles.infoText}>
                You checked this out {timeSince(activeCheckout.checkoutTime)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, styles.returnButton]}
              onPress={handleReturn}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {loading ? "Returning..." : "Return Item"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : currentItem.status === "available" ? (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.checkoutButton]}
              onPress={handleCheckout}
              disabled={loading}
            >
              <Ionicons
                name="arrow-up-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.primaryButtonText}>
                {loading ? "Booking..." : "Book / Checkout"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              This will mark the item as checked out to you
            </Text>
          </View>
        ) : (
          <View style={styles.actionSection}>
            <View style={styles.unavailableBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#92400E" />
              <Text style={styles.unavailableText}>
                This item is currently {currentItem.status.replace("_", " ")}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Book for Later */}
      {!hasCheckout && (
        <View style={styles.bookLaterCard}>
          <TouchableOpacity
            style={styles.bookLaterHeader}
            onPress={() => setShowBooking(!showBooking)}
          >
            <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            <Text style={styles.bookLaterTitle}>Book for Later</Text>
            <Ionicons
              name={showBooking ? "chevron-up" : "chevron-down"}
              size={18}
              color="#999"
            />
          </TouchableOpacity>

          {showBooking && (
            <View style={styles.bookLaterContent}>
              {/* Day picker */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingVertical: 8 }}
              >
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const label =
                    i === 0
                      ? "Today"
                      : i === 1
                        ? "Tomorrow"
                        : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.dayChip,
                        selectedDay === i && styles.dayChipActive,
                      ]}
                      onPress={() => { setSelectedDay(i); setSelectedHour(null); }}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          selectedDay === i && styles.dayChipTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Duration picker */}
              <Text style={styles.miniLabel}>Duration</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingBottom: 8 }}
              >
                {DURATIONS.map((dur, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayChip,
                      selectedDuration === i && styles.dayChipActive,
                    ]}
                    onPress={() => { setSelectedDuration(i); setSelectedHour(null); }}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selectedDuration === i && styles.dayChipTextActive,
                      ]}
                    >
                      {dur.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Start time grid */}
              <Text style={styles.miniLabel}>Start Time</Text>
              <View style={styles.timeGrid}>
                {HOURS.map((hour) => {
                  const baseDate = new Date();
                  baseDate.setDate(baseDate.getDate() + selectedDay);
                  baseDate.setHours(hour, 0, 0, 0);
                  const dur = DURATIONS[selectedDuration].value;
                  const endMs = baseDate.getTime() + dur * 60 * 1000;
                  const isPast = endMs <= Date.now();

                  const isBooked = itemBookings?.some(
                    (b: any) =>
                      b.startTime < endMs && b.endTime > baseDate.getTime()
                  );
                  const disabled = isPast || !!isBooked;

                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeCell,
                        selectedHour === hour && styles.timeCellActive,
                        disabled && styles.timeCellDisabled,
                      ]}
                      onPress={() => !disabled && setSelectedHour(hour)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.timeCellText,
                          selectedHour === hour && { color: "#3B82F6" },
                          disabled && { color: "#CCC" },
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={styles.bookNotesInput}
                placeholder="Notes (optional)"
                value={bookNotes}
                onChangeText={setBookNotes}
              />

              <TouchableOpacity
                style={[
                  styles.confirmBookButton,
                  selectedHour === null && { opacity: 0.5 },
                ]}
                disabled={selectedHour === null || loading}
                onPress={async () => {
                  if (selectedHour === null) return;
                  setLoading(true);
                  const dur = DURATIONS[selectedDuration].value;
                  const start = new Date();
                  start.setDate(start.getDate() + selectedDay);
                  start.setHours(selectedHour, 0, 0, 0);
                  const endMs = start.getTime() + dur * 60 * 1000;
                  try {
                    const bookingId = await bookItem({
                      userId,
                      itemId,
                      startTime: start.getTime(),
                      endTime: endMs,
                      notes: bookNotes.trim() || undefined,
                    });
                    await scheduleBookingReminders(
                      bookingId,
                      currentItem.name,
                      start.getTime()
                    );
                    setResultMessage(
                      `Booked "${currentItem.name}" for ${DURATIONS[selectedDuration].label} at ${formatHour(selectedHour)}`
                    );
                    setDone(true);
                  } catch (error: any) {
                    Alert.alert("Booking Failed", error.message || "Could not book");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text style={styles.confirmBookText}>
                  {loading ? "Booking..." : "Confirm Booking"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color="#666" />
        <Text style={styles.backLinkText}>Back to Equipment</Text>
      </TouchableOpacity>

      <UserProfileModal
        visible={!!profileUser}
        user={profileUser}
        onClose={() => setProfileUser(null)}
      />
    </ScrollView>
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
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  barcode: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  detailsSection: {
    marginTop: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  holderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    padding: 12,
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
  },
  holderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
  },
  holderAvatarText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
  },
  holderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  holderSince: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 1,
  },
  actionSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#92400E",
    flex: 1,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    borderRadius: 10,
  },
  checkoutButton: {
    backgroundColor: "#3B82F6",
  },
  returnButton: {
    backgroundColor: "#22C55E",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  unavailableBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 14,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 14,
    color: "#92400E",
    flex: 1,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 16,
  },
  backLinkText: {
    fontSize: 15,
    color: "#666",
  },
  doneTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22C55E",
    marginTop: 12,
  },
  doneMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  bookLaterCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bookLaterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  bookLaterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    flex: 1,
  },
  bookLaterContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  dayChipActive: {
    backgroundColor: "#3B82F6",
  },
  dayChipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  dayChipTextActive: {
    color: "#fff",
  },
  miniLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  timeCell: {
    width: "30%",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  timeCellActive: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  timeCellDisabled: {
    opacity: 0.4,
  },
  timeCellText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  bookNotesInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 14,
  },
  confirmBookButton: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  confirmBookText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

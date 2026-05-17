import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { RootStackParamList } from "../types";
import { scheduleBookingReminders } from "../utils/notifications";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
  { label: "4 hours", value: 240 },
];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function getDateOptions(): { label: string; date: Date }[] {
  const options = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
    options.push({ label, date });
  }
  return options;
}

export default function BookFacilityScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookFacility">>();
  const { facilityId, facilityName, capacity, userId } = route.params;

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [bookedSummary, setBookedSummary] = useState("");

  const dateOptions = getDateOptions();
  const bookFacility = useMutation(api.bookings.bookFacility);
  const existingBookings = useQuery(api.bookings.getFacilityBookings, {
    facilityId,
  });

  const currentDate = dateOptions[selectedDate].date;

  const getBookingTimes = () => {
    if (selectedHour === null) return null;
    const dur = DURATIONS[selectedDuration].value;
    const start = new Date(currentDate);
    start.setHours(selectedHour, 0, 0, 0);
    const end = new Date(start.getTime() + dur * 60 * 1000);
    return { startTime: start.getTime(), endTime: end.getTime() };
  };

  const isHourConflicting = (hour: number): { conflict: boolean; count: number } => {
    if (!existingBookings) return { conflict: false, count: 0 };
    const dur = DURATIONS[selectedDuration].value;
    const start = new Date(currentDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + dur * 60 * 1000);

    const overlapping = existingBookings.filter(
      (b: any) => b.startTime < end.getTime() && b.endTime > start.getTime()
    );
    return { conflict: overlapping.length >= capacity, count: overlapping.length };
  };

  const isHourPast = (hour: number): boolean => {
    const t = new Date(currentDate);
    t.setHours(hour, 0, 0, 0);
    return t.getTime() <= Date.now();
  };

  const handleBook = async () => {
    const times = getBookingTimes();
    if (!times) {
      Alert.alert("Select a Time", "Please select a start time");
      return;
    }

    setLoading(true);
    try {
      const bookingId = await bookFacility({
        userId,
        facilityId,
        startTime: times.startTime,
        endTime: times.endTime,
        notes: notes.trim() || undefined,
      });

      await scheduleBookingReminders(
        bookingId,
        facilityName,
        times.startTime
      );

      const startStr = new Date(times.startTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      const endStr = new Date(times.endTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      setBookedSummary(
        `${dateOptions[selectedDate].label}, ${startStr} - ${endStr} (${DURATIONS[selectedDuration].label})`
      );
      setDone(true);
    } catch (error: any) {
      Alert.alert(
        "Booking Failed",
        error.message || "Could not complete booking"
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        <Text style={styles.doneTitle}>Booked!</Text>
        <Text style={styles.doneMessage}>{facilityName}</Text>
        <Text style={styles.doneDetail}>{bookedSummary}</Text>
        <Text style={styles.reminderNote}>
          You'll get a reminder 30 min before
        </Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="business-outline" size={28} color="#3B82F6" />
        <Text style={styles.facilityName}>{facilityName}</Text>
        <Text style={styles.capacityText}>Capacity: {capacity}</Text>
      </View>

      {/* Date */}
      <Text style={styles.sectionLabel}>Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {dateOptions.map((opt, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              selectedDate === index && styles.chipActive,
            ]}
            onPress={() => {
              setSelectedDate(index);
              setSelectedHour(null);
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedDate === index && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Duration */}
      <Text style={styles.sectionLabel}>Duration</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {DURATIONS.map((dur, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              selectedDuration === index && styles.chipActive,
            ]}
            onPress={() => {
              setSelectedDuration(index);
              setSelectedHour(null);
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedDuration === index && styles.chipTextActive,
              ]}
            >
              {dur.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Start time */}
      <Text style={styles.sectionLabel}>Start Time</Text>
      {existingBookings === undefined ? (
        <ActivityIndicator
          size="small"
          color="#3B82F6"
          style={{ marginTop: 10 }}
        />
      ) : (
        <View style={styles.timeGrid}>
          {HOURS.map((hour) => {
            const { conflict, count } = isHourConflicting(hour);
            const past = isHourPast(hour);
            const disabled = conflict || past;

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
                    selectedHour === hour && styles.timeCellTextActive,
                    disabled && { color: "#CCC" },
                  ]}
                >
                  {formatHour(hour)}
                </Text>
                {!past && (
                  <Text
                    style={[
                      styles.timeCellCount,
                      conflict
                        ? { color: "#EF4444" }
                        : count > 0
                          ? { color: "#F59E0B" }
                          : { color: "#22C55E" },
                    ]}
                  >
                    {conflict ? "Full" : `${count}/${capacity}`}
                  </Text>
                )}
                {past && (
                  <Text style={styles.timeCellCount}>Past</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Summary */}
      {selectedHour !== null && (
        <View style={styles.summaryBox}>
          <Ionicons name="time-outline" size={16} color="#3B82F6" />
          <Text style={styles.summaryText}>
            {formatHour(selectedHour)} -{" "}
            {formatHour(
              selectedHour +
                DURATIONS[selectedDuration].value / 60
            )}{" "}
            ({DURATIONS[selectedDuration].label})
          </Text>
        </View>
      )}

      {/* Notes */}
      <Text style={styles.sectionLabel}>Notes (optional)</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="e.g. Lab experiment, Group project..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity
        style={[
          styles.bookButton,
          (selectedHour === null || loading) && styles.bookButtonDisabled,
        ]}
        onPress={handleBook}
        disabled={selectedHour === null || loading}
      >
        <Text style={styles.bookButtonText}>
          {loading ? "Booking..." : "Confirm Booking"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  facilityName: { fontSize: 20, fontWeight: "bold", color: "#333" },
  capacityText: { fontSize: 13, color: "#666" },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dateRow: { paddingHorizontal: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  chipText: { fontSize: 13, color: "#666", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 6,
  },
  timeCell: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  timeCellActive: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF" },
  timeCellDisabled: { opacity: 0.5 },
  timeCellText: { fontSize: 14, fontWeight: "600", color: "#333" },
  timeCellTextActive: { color: "#3B82F6" },
  timeCellCount: { fontSize: 10, color: "#999", marginTop: 2 },
  summaryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  summaryText: { fontSize: 14, color: "#3B82F6", fontWeight: "500" },
  notesInput: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },
  bookButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  bookButtonDisabled: { opacity: 0.5 },
  bookButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  doneTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22C55E",
    marginTop: 12,
  },
  doneMessage: { fontSize: 18, fontWeight: "600", color: "#333", marginTop: 8 },
  doneDetail: { fontSize: 15, color: "#666", marginTop: 4, textAlign: "center" },
  reminderNote: {
    fontSize: 13,
    color: "#3B82F6",
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  doneButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

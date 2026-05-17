import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type Props = {
  userId: Id<"users">;
};

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getActionLabel(action: string): string {
  switch (action) {
    case "checkout": return "Checked out";
    case "return": return "Returned";
    case "entry": return "Entered";
    case "exit": return "Exited";
    default: return action;
  }
}

function getActionIcon(action: string): string {
  switch (action) {
    case "checkout": return "arrow-up-circle-outline";
    case "return": return "checkmark-circle-outline";
    case "entry": return "enter-outline";
    case "exit": return "exit-outline";
    default: return "ellipse-outline";
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case "checkout": return "#F59E0B";
    case "return": return "#22C55E";
    case "entry": return "#3B82F6";
    case "exit": return "#8B5CF6";
    default: return "#999";
  }
}

export default function HistoryScreen({ userId }: Props) {
  const history = useQuery(api.scans.getUserHistory, { userId, limit: 50 });
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  if (history === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="time-outline" size={60} color="#DDD" />
        <Text style={styles.emptyTitle}>No Activity Yet</Text>
        <Text style={styles.emptySubtext}>
          Your scan history will appear here
        </Text>
      </View>
    );
  }

  // Group scans by date
  const grouped: { date: string; scans: typeof history }[] = [];
  let currentDate = "";

  for (const scan of history) {
    const date = formatDate(scan.timestamp);
    if (date !== currentDate) {
      currentDate = date;
      grouped.push({ date, scans: [] });
    }
    grouped[grouped.length - 1].scans.push(scan);
  }

  return (
    <FlatList
      style={styles.container}
      data={grouped}
      keyExtractor={(item) => item.date}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
      renderItem={({ item: group }) => (
        <View style={styles.dateGroup}>
          <Text style={styles.dateHeader}>{group.date}</Text>
          {group.scans.map((scan) => (
            <View key={scan._id} style={styles.scanCard}>
              <Ionicons
                name={getActionIcon(scan.action) as any}
                size={24}
                color={getActionColor(scan.action)}
              />
              <View style={styles.scanInfo}>
                <Text style={styles.scanAction}>
                  {getActionLabel(scan.action)}{" "}
                  {scan.itemName || scan.facilityName}
                </Text>
                <View style={styles.scanDetails}>
                  <Text style={styles.scanTime}>
                    {formatTimestamp(scan.timestamp)}
                  </Text>
                  {scan.duration && (
                    <Text style={styles.scanDuration}>
                      {formatDuration(scan.duration)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
    backgroundColor: "#F5F5F5",
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
  },
  dateGroup: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  dateHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  scanCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scanInfo: {
    flex: 1,
  },
  scanAction: {
    fontSize: 15,
    color: "#333",
  },
  scanDetails: {
    flexDirection: "row",
    gap: 10,
    marginTop: 3,
  },
  scanTime: {
    fontSize: 12,
    color: "#999",
  },
  scanDuration: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
});

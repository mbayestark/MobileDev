import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { RootStackParamList } from "../types";
import NotificationsModal from "../components/NotificationsModal";
import { sendInAppNotification } from "../utils/notifications";

type Props = {
  userId: Id<"users">;
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
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

export default function HomeScreen({ userId }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showNotifs, setShowNotifs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);
  const user = useQuery(api.users.getUser, { userId });
  const history = useQuery(api.scans.getUserHistory, { userId, limit: 5 });
  const facilities = useQuery(api.facilities.getAll);
  const unreadCount = useQuery(api.notifications.getUnreadCount, { userId });
  const notifications = useQuery(api.notifications.getMyNotifications, { userId });

  const prevUnreadRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (unreadCount === undefined) return;
    if (prevUnreadRef.current !== undefined && unreadCount > prevUnreadRef.current && notifications?.[0]) {
      const latest = notifications[0];
      sendInAppNotification(latest.title, latest.body);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={styles.welcomeCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} - {user.studentId}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => setShowNotifs(true)}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
          {(unreadCount ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount! > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("Scanner")}
      >
        <Ionicons name="scan-outline" size={32} color="#fff" />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
        <Text style={styles.scanButtonSubtext}>
          Equipment checkout or facility access
        </Text>
      </TouchableOpacity>

      {/* Quick Book Facilities */}
      {facilities && facilities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book a Room</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility._id}
                style={styles.facilityChip}
                onPress={() =>
                  navigation.navigate("BookFacility", {
                    facilityId: facility._id,
                    facilityName: facility.name,
                    capacity: facility.capacity,
                    userId,
                  })
                }
              >
                <Ionicons name="business-outline" size={16} color="#3B82F6" />
                <Text style={styles.facilityChipText}>{facility.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {!history ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptySubtext}>
              Scan a barcode to get started
            </Text>
          </View>
        ) : (
          history.map((scan) => (
            <View key={scan._id} style={styles.activityCard}>
              <Ionicons
                name={getActionIcon(scan.action) as any}
                size={24}
                color={getActionColor(scan.action)}
              />
              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>
                  {scan.action === "checkout" && `Checked out ${scan.itemName}`}
                  {scan.action === "return" &&
                    `Returned ${scan.itemName}${scan.duration ? ` (${formatDuration(scan.duration)})` : ""}`}
                  {scan.action === "entry" && `Entered ${scan.facilityName}`}
                  {scan.action === "exit" &&
                    `Exited ${scan.facilityName}${scan.duration ? ` (${formatDuration(scan.duration)})` : ""}`}
                </Text>
                <Text style={styles.activityTime}>
                  {formatTime(scan.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <NotificationsModal
        visible={showNotifs}
        userId={userId}
        onClose={() => setShowNotifs(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  welcomeCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bellButton: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  scanButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 15,
    color: "#333",
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#BBB",
    marginTop: 4,
  },
  facilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  facilityChipText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
});

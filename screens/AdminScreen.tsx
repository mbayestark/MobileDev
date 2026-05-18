import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useQuery, useMutation, useAction } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import UserProfileModal from "../components/UserProfileModal";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function getBookingStatusColor(status: string): string {
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

function getBookingStatusLabel(status: string): string {
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

type TabType = "overview" | "bookings" | "audit";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileUser, setProfileUser] = useState<any>(null);

  const stats = useQuery(api.scans.getDashboardStats);
  const activeCheckouts = useQuery(api.items.getActiveCheckouts);
  const facilityOccupancy = useQuery(api.facilities.getAllOccupancy);
  const auditTrail = useQuery(api.scans.getAuditTrail, {
    limit: 30,
    actionFilter,
    searchQuery: searchQuery.trim() || undefined,
  });
  const upcomingBookings = useQuery(api.bookings.getUpcomingBookings);
  const noShowStats = useQuery(api.bookings.getNoShowStats);

  const seedData = useMutation(api.seed.seedData);
  const markNoShows = useMutation(api.bookings.markOverdueAsNoShow);
  const updateBookingStatus = useMutation(api.bookings.updateStatus);
  const sendReminder = useAction(api.notifications.sendReturnReminder);

  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try { await seedData(); } catch {}
    setSeeding(false);
  };

  const handleSendReminder = async (userId: any, itemName: string) => {
    try {
      await sendReminder({ userId, itemName });
      Alert.alert("Sent", `Return reminder sent for "${itemName}"`);
    } catch {
      Alert.alert("Error", "Failed to send reminder");
    }
  };

  if (!stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <UserProfileModal
        visible={!!profileUser}
        user={profileUser}
        onClose={() => setProfileUser(null)}
      />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.itemsOut}</Text>
          <Text style={styles.statLabel}>Items Out</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeBookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalOccupants}</Text>
          <Text style={styles.statLabel}>Occupants</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, stats.totalNoShows > 0 ? { color: "#EF4444" } : {}]}>
            {stats.totalNoShows}
          </Text>
          <Text style={styles.statLabel}>No-Shows</Text>
        </View>
      </View>

      {/* Overdue + no-show alerts */}
      {(stats.overdueCount > 0 || (noShowStats && noShowStats.frequentNoShows.length > 0)) && (
        <View style={styles.alertBox}>
          {stats.overdueCount > 0 && (
            <>
              <View style={styles.alertHeader}>
                <Ionicons name="warning-outline" size={18} color="#DC2626" />
                <Text style={styles.alertTitle}>Overdue ({stats.overdueCount})</Text>
              </View>
              {stats.overdueItems.map((item, i) => (
                <Text key={i} style={styles.alertItem}>
                  {item.itemName} - {item.userName} ({timeSince(item.checkoutTime)})
                </Text>
              ))}
            </>
          )}
          {noShowStats && noShowStats.frequentNoShows.length > 0 && (
            <>
              <View style={[styles.alertHeader, { marginTop: stats.overdueCount > 0 ? 10 : 0 }]}>
                <Ionicons name="person-remove-outline" size={18} color="#DC2626" />
                <Text style={styles.alertTitle}>Frequent No-Shows</Text>
              </View>
              {noShowStats.frequentNoShows.map((u, i) => (
                <Text key={i} style={styles.alertItem}>
                  {u.name} - {u.count} no-shows
                </Text>
              ))}
            </>
          )}
        </View>
      )}

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(["overview", "bookings", "audit"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "overview" ? "Live" : tab === "bookings" ? "Bookings" : "Audit"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---- OVERVIEW TAB ---- */}
      {activeTab === "overview" && (
        <View>
          <Text style={styles.sectionTitle}>Equipment Checked Out</Text>
          {activeCheckouts && activeCheckouts.length > 0 ? (
            activeCheckouts.map((c) => (
              <View key={c._id} style={styles.listCard}>
                <View style={styles.listRow}>
                  <Text style={styles.listName}>{c.itemName}</Text>
                  <Text style={styles.listTime}>{timeSince(c.checkoutTime)}</Text>
                </View>
                <View style={styles.checkoutActions}>
                  <TouchableOpacity
                    style={styles.userLink}
                    onPress={() => c.userProfile && setProfileUser(c.userProfile)}
                  >
                    <Ionicons name="person-circle-outline" size={16} color="#3B82F6" />
                    <Text style={styles.userLinkText}>{c.userName}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.remindBtn}
                    onPress={() => handleSendReminder(c.userId, c.itemName)}
                  >
                    <Ionicons name="notifications-outline" size={14} color="#F59E0B" />
                    <Text style={styles.remindBtnText}>Remind</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No items checked out</Text>
          )}

          <Text style={styles.sectionTitle}>Room Occupancy</Text>
          {facilityOccupancy?.map((f) => (
            <View key={f._id} style={styles.listCard}>
              <View style={styles.listRow}>
                <Text style={styles.listName}>{f.name}</Text>
                <Text
                  style={[
                    styles.occupancyText,
                    f.currentOccupancy > 0 ? styles.occupancyActive : styles.occupancyEmpty,
                  ]}
                >
                  {f.currentOccupancy}/{f.capacity}
                </Text>
              </View>
              <View style={styles.occupancyBar}>
                <View
                  style={[
                    styles.occupancyFill,
                    { width: `${(f.currentOccupancy / f.capacity) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ---- BOOKINGS TAB ---- */}
      {activeTab === "bookings" && (
        <View>
          <View style={styles.bookingsHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            <TouchableOpacity
              style={styles.markNoShowBtn}
              onPress={async () => {
                const result = await markNoShows();
                if (result.marked > 0) {
                  // triggers re-render via convex subscriptions
                }
              }}
            >
              <Text style={styles.markNoShowText}>Flag No-Shows</Text>
            </TouchableOpacity>
          </View>

          {upcomingBookings && upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <View key={booking._id} style={styles.bookingCard}>
                <View style={styles.bookingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingName}>
                      {booking.itemName || booking.facilityName}
                    </Text>
                    <Text style={styles.bookingSub}>
                      {formatDate(booking.startTime)},{" "}
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </Text>
                    {booking.notes && (
                      <Text style={styles.bookingNotes}>{booking.notes}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.bookingStatusBadge,
                      { backgroundColor: getBookingStatusColor(booking.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bookingStatusText,
                        { color: getBookingStatusColor(booking.status) },
                      ]}
                    >
                      {getBookingStatusLabel(booking.status)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.userLink}
                  onPress={() => {
                    if ((booking as any).userProfile) {
                      setProfileUser((booking as any).userProfile);
                    }
                  }}
                >
                  <Ionicons name="person-circle-outline" size={16} color="#3B82F6" />
                  <Text style={styles.userLinkText}>{booking.userName}</Text>
                </TouchableOpacity>
                <View style={styles.bookingActions}>
                  <TouchableOpacity
                    style={styles.actionChip}
                    onPress={() =>
                      updateBookingStatus({ bookingId: booking._id, status: "no_show" })
                    }
                  >
                    <Text style={styles.actionChipTextRed}>No-Show</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionChip}
                    onPress={() =>
                      updateBookingStatus({ bookingId: booking._id, status: "cancelled" })
                    }
                  >
                    <Text style={styles.actionChipTextGray}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No upcoming bookings</Text>
          )}
        </View>
      )}

      {/* ---- AUDIT TAB ---- */}
      {activeTab === "audit" && (
        <View>
          <Text style={styles.sectionTitle}>Audit Trail</Text>

          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by user or item..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {["all", "checkout", "return", "entry", "exit"].map((action) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.filterChip,
                  actionFilter === action && styles.filterChipActive,
                ]}
                onPress={() => setActionFilter(action)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    actionFilter === action && styles.filterChipTextActive,
                  ]}
                >
                  {action === "all" ? "All" : action.charAt(0).toUpperCase() + action.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {auditTrail && auditTrail.length > 0 ? (
            auditTrail.map((scan) => (
              <View key={scan._id} style={styles.auditCard}>
                <Text style={styles.auditTime}>{formatTime(scan.timestamp)}</Text>
                <Text style={styles.auditText}>
                  {scan.userName}{" "}
                  {scan.action === "checkout" && `checked out ${scan.itemName}`}
                  {scan.action === "return" &&
                    `returned ${scan.itemName}${scan.duration ? ` (${formatDuration(scan.duration)})` : ""}`}
                  {scan.action === "entry" && `entered ${scan.facilityName}`}
                  {scan.action === "exit" &&
                    `exited ${scan.facilityName}${scan.duration ? ` (${formatDuration(scan.duration)})` : ""}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No matching records</Text>
          )}
        </View>
      )}

      {/* Seed button */}
      <TouchableOpacity style={styles.seedButton} onPress={handleSeed} disabled={seeding}>
        <Text style={styles.seedButtonText}>{seeding ? "Seeding..." : "Seed Test Data"}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  statsRow: { flexDirection: "row", padding: 12, gap: 6 },
  statCard: {
    flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 10, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#3B82F6" },
  statLabel: { fontSize: 10, color: "#666", marginTop: 2 },
  alertBox: {
    backgroundColor: "#FEF2F2", marginHorizontal: 16, padding: 14, borderRadius: 8,
    borderLeftWidth: 4, borderLeftColor: "#EF4444", marginBottom: 12,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  alertTitle: { fontSize: 14, fontWeight: "bold", color: "#DC2626" },
  alertItem: { fontSize: 12, color: "#991B1B", marginLeft: 24, marginTop: 2 },
  tabRow: {
    flexDirection: "row", marginHorizontal: 16, backgroundColor: "#E5E7EB",
    borderRadius: 8, padding: 3,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  tabActive: { backgroundColor: "#fff" },
  tabText: { fontSize: 13, color: "#666", fontWeight: "500" },
  tabTextActive: { color: "#3B82F6", fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  listCard: { backgroundColor: "#fff", marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 6 },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listName: { fontSize: 15, color: "#333", fontWeight: "500", flex: 1 },
  listTime: { fontSize: 13, color: "#F59E0B", fontWeight: "500" },
  checkoutActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8,
    borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 8,
  },
  userLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  userLinkText: { fontSize: 13, color: "#3B82F6", fontWeight: "500" },
  remindBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
  },
  remindBtnText: { fontSize: 12, color: "#92400E", fontWeight: "600" },
  occupancyText: { fontSize: 14, fontWeight: "600" },
  occupancyActive: { color: "#3B82F6" },
  occupancyEmpty: { color: "#999" },
  occupancyBar: { height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, marginTop: 8 },
  occupancyFill: { height: 4, backgroundColor: "#3B82F6", borderRadius: 2 },
  noData: { fontSize: 14, color: "#999", textAlign: "center", padding: 20 },
  bookingsHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingRight: 16 },
  markNoShowBtn: { backgroundColor: "#FEF2F2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  markNoShowText: { fontSize: 12, color: "#DC2626", fontWeight: "600" },
  bookingCard: { backgroundColor: "#fff", marginHorizontal: 16, padding: 12, borderRadius: 8, marginBottom: 6 },
  bookingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bookingName: { fontSize: 15, fontWeight: "600", color: "#333" },
  bookingSub: { fontSize: 12, color: "#666", marginTop: 2 },
  bookingNotes: { fontSize: 11, color: "#999", marginTop: 2, fontStyle: "italic" },
  bookingStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  bookingStatusText: { fontSize: 11, fontWeight: "600" },
  bookingActions: { flexDirection: "row", gap: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 8 },
  actionChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: "#F9FAFB" },
  actionChipTextRed: { fontSize: 12, color: "#EF4444", fontWeight: "500" },
  actionChipTextGray: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff",
    marginHorizontal: 16, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterChipsRow: { paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: "#3B82F6" },
  filterChipText: { fontSize: 12, color: "#666", fontWeight: "500" },
  filterChipTextActive: { color: "#fff" },
  auditCard: {
    backgroundColor: "#fff", marginHorizontal: 16, padding: 12, borderRadius: 8,
    marginBottom: 4, flexDirection: "row", gap: 10,
  },
  auditTime: { fontSize: 12, color: "#999", width: 65 },
  auditText: { fontSize: 14, color: "#333", flex: 1 },
  seedButton: {
    backgroundColor: "#E5E7EB", marginHorizontal: 16, padding: 12,
    borderRadius: 8, alignItems: "center", marginTop: 24,
  },
  seedButtonText: { color: "#666", fontSize: 14 },
});

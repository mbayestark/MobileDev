import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { RootStackParamList } from "../types";
import UserProfileModal from "../components/UserProfileModal";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type FilterType = "all" | "available" | "in_use";

function getStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "#22C55E";
    case "in_use":
      return "#F59E0B";
    case "missing":
      return "#EF4444";
    case "damaged":
      return "#6B7280";
    default:
      return "#999";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "in_use":
      return "In Use";
    case "missing":
      return "Missing";
    case "damaged":
      return "Damaged";
    default:
      return status;
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "equipment":
      return "hardware-chip-outline";
    case "tool":
      return "build-outline";
    case "consumable":
      return "cube-outline";
    default:
      return "ellipse-outline";
  }
}

function timeSince(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type Props = {
  userId: Id<"users">;
};

export default function ItemsScreen({ userId }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [profileUser, setProfileUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);
  const items = useQuery(api.items.getAllWithWeeklyStats);

  if (items === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const searchLower = search.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      !searchLower ||
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const availableCount = items.filter((i) => i.status === "available").length;
  const inUseCount = items.filter((i) => i.status === "in_use").length;

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{items.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: "#22C55E" }]}>
            {availableCount}
          </Text>
          <Text style={styles.summaryLabel}>Available</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: "#F59E0B" }]}>
            {inUseCount}
          </Text>
          <Text style={styles.summaryLabel}>In Use</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search equipment..."
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(["all", "available", "in_use"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "all" ? "All" : f === "available" ? "Available" : "In Use"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items list */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() =>
              navigation.navigate("ItemDetail", {
                itemId: item._id as Id<"items">,
                userId,
              })
            }
            activeOpacity={0.7}
          >
            {/* Header row */}
            <View style={styles.itemHeader}>
              <Ionicons
                name={getCategoryIcon(item.category) as any}
                size={22}
                color="#3B82F6"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.category} &middot; {item.location}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "20" },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            {/* Checked out by */}
            {item.checkedOutBy && (
              <TouchableOpacity
                style={styles.checkedOutRow}
                onPress={(e) => {
                  e.stopPropagation();
                  setProfileUser({
                    name: item.checkedOutBy!.name,
                    studentId: item.checkedOutBy!.studentId,
                    email: item.checkedOutBy!.email,
                    phone: item.checkedOutBy!.phone,
                    role: item.checkedOutBy!.role,
                    major: item.checkedOutBy!.major,
                    year: item.checkedOutBy!.year,
                  });
                }}
              >
                <Ionicons name="person-outline" size={14} color="#F59E0B" />
                <Text style={styles.checkedOutLink}>
                  {item.checkedOutBy.name}
                </Text>
                <Text style={styles.checkedOutText}>
                  &middot; {timeSince(item.checkedOutBy.since)}
                </Text>
              </TouchableOpacity>
            )}

            {/* Weekly availability */}
            <View style={styles.weekRow}>
              <Text style={styles.weekLabel}>This week:</Text>
              <View style={styles.daysRow}>
                {DAY_LABELS.map((day, index) => (
                  <View key={day} style={styles.dayColumn}>
                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: item.daysUsed[index]
                            ? "#F59E0B"
                            : "#E5E7EB",
                        },
                      ]}
                    />
                    <Text style={styles.dayLabel}>{day}</Text>
                  </View>
                ))}
              </View>
              {item.totalCheckoutsThisWeek > 0 && (
                <Text style={styles.weekStat}>
                  {item.totalCheckoutsThisWeek} checkout
                  {item.totalCheckoutsThisWeek > 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={60} color="#DDD" />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptyText}>
              {search ? "Try a different search term" : "No equipment registered yet"}
            </Text>
          </View>
        }
      />

      <UserProfileModal
        visible={!!profileUser}
        user={profileUser}
        onClose={() => setProfileUser(null)}
      />
    </View>
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
  summaryRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 3,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  filterActive: {
    backgroundColor: "#fff",
  },
  filterText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
  itemCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  itemMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  checkedOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingLeft: 32,
  },
  checkedOutLink: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
  checkedOutText: {
    fontSize: 12,
    color: "#F59E0B",
  },
  weekRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  weekLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayColumn: {
    alignItems: "center",
    gap: 4,
  },
  dayDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dayLabel: {
    fontSize: 10,
    color: "#999",
  },
  weekStat: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 6,
    textAlign: "right",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  emptyBox: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#BBB",
    marginTop: 4,
  },
});

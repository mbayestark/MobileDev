import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type Props = {
  visible: boolean;
  userId: Id<"users">;
  onClose: () => void;
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsModal({ visible, userId, onClose }: Props) {
  const notifications = useQuery(api.notifications.getMyNotifications, { userId });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const hasUnread = notifications?.some((n) => !n.isRead);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                {hasUnread && (
                  <TouchableOpacity onPress={() => markAllAsRead({ userId })}>
                    <Text style={styles.markAll}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={22} color="#999" />
                </TouchableOpacity>
              </View>

              {!notifications || notifications.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="notifications-off-outline" size={40} color="#CCC" />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                <FlatList
                  data={notifications}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.notifCard, !item.isRead && styles.notifUnread]}
                      onPress={() => {
                        if (!item.isRead) markAsRead({ notificationId: item._id });
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.notifIcon}>
                        <Ionicons
                          name={
                            item.type === "return_reminder"
                              ? "alarm-outline"
                              : "information-circle-outline"
                          }
                          size={20}
                          color={item.type === "return_reminder" ? "#F59E0B" : "#3B82F6"}
                        />
                      </View>
                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifBody}>{item.body}</Text>
                        <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                      </View>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  markAll: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
    marginRight: 12,
  },
  closeBtn: {
    padding: 4,
  },
  emptyBox: {
    padding: 50,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  notifUnread: {
    backgroundColor: "#F0F7FF",
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  notifBody: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  notifTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginTop: 6,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type UserProfile = {
  name: string;
  studentId: string;
  email?: string;
  phone?: string;
  role: string;
  major?: string;
  year?: string;
  department?: string;
  position?: string;
};

type Props = {
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
};

export default function UserProfileModal({ visible, user, onClose }: Props) {
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.roleTag}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>

              <View style={styles.details}>
                <Row icon="id-card-outline" label="ID" value={user.studentId} />
                {user.email ? (
                  <Row icon="mail-outline" label="Email" value={user.email} />
                ) : null}
                {user.phone ? (
                  <Row icon="call-outline" label="Phone" value={user.phone} />
                ) : null}
                {user.major ? (
                  <Row icon="school-outline" label="Major" value={user.major} />
                ) : null}
                {user.year ? (
                  <Row icon="calendar-outline" label="Year" value={`${user.year} Year`} />
                ) : null}
                {user.department ? (
                  <Row icon="business-outline" label="Dept" value={user.department} />
                ) : null}
                {user.position ? (
                  <Row icon="briefcase-outline" label="Position" value={user.position} />
                ) : null}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon as any} size={16} color="#666" />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  roleTag: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 2,
  },
  details: {
    width: "100%",
    marginTop: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: "#999",
    width: 55,
  },
  rowValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
});

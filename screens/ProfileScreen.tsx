import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type Props = {
  userId: Id<"users">;
  onLogout: () => void;
};

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "faculty": return "#8B5CF6";
    case "staff": return "#F59E0B";
    default: return "#3B82F6";
  }
}

export default function ProfileScreen({ userId, onLogout }: Props) {
  const user = useQuery(api.users.getUser, { userId });
  const updateProfile = useMutation(api.users.updateProfile);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const startEditing = () => {
    setName(user.name);
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setMajor(user.major ?? "");
    setYear(user.year ?? "");
    setDepartment(user.department ?? "");
    setPosition(user.position ?? "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        userId,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        major: major || undefined,
        year: year ? (year as "1st" | "2nd" | "3rd" | "4th") : undefined,
        department: department || undefined,
        position: position || undefined,
      });
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Edit Profile</Text>

          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Optional"
          />

          {user.role === "student" && (
            <>
              <Text style={styles.fieldLabel}>Major</Text>
              <TextInput
                style={styles.input}
                value={major}
                onChangeText={setMajor}
                placeholder="e.g. Computer Engineering"
              />

              <Text style={styles.fieldLabel}>Year</Text>
              <View style={styles.yearRow}>
                {(["1st", "2nd", "3rd", "4th"] as const).map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.yearChip,
                      year === y && styles.yearChipActive,
                    ]}
                    onPress={() => setYear(year === y ? "" : y)}
                  >
                    <Text
                      style={[
                        styles.yearChipText,
                        year === y && styles.yearChipTextActive,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {(user.role === "faculty" || user.role === "staff") && (
            <>
              <Text style={styles.fieldLabel}>Department</Text>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={setDepartment}
                placeholder="e.g. Engineering"
              />

              <Text style={styles.fieldLabel}>Position</Text>
              <TextInput
                style={styles.input}
                value={position}
                onChangeText={setPosition}
                placeholder="e.g. Professor"
              />
            </>
          )}

          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Avatar + name */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleBadgeColor(user.role) + "20" },
          ]}
        >
          <Text
            style={[
              styles.roleBadgeText,
              { color: getRoleBadgeColor(user.role) },
            ]}
          >
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Text>
          {user.isAdmin && (
            <View style={styles.adminTag}>
              <Ionicons name="shield-checkmark" size={12} color="#F59E0B" />
              <Text style={styles.adminTagText}>
                {user.adminLevel === "super" ? "Super Admin" : "Admin"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="id-card-outline" size={18} color="#666" />
          <Text style={styles.infoLabel}>ID</Text>
          <Text style={styles.infoValue}>{user.studentId}</Text>
        </View>
        {user.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}
        {user.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        )}
        {user.major && (
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Major</Text>
            <Text style={styles.infoValue}>{user.major}</Text>
          </View>
        )}
        {user.year && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Year</Text>
            <Text style={styles.infoValue}>{user.year} Year</Text>
          </View>
        )}
        {user.department && (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Dept</Text>
            <Text style={styles.infoValue}>{user.department}</Text>
          </View>
        )}
        {user.position && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Position</Text>
            <Text style={styles.infoValue}>{user.position}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.editButton} onPress={startEditing}>
        <Ionicons name="create-outline" size={18} color="#3B82F6" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.joinedText}>
        Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Text>

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
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  adminTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  adminTagText: {
    fontSize: 11,
    color: "#F59E0B",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    width: 65,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  editButtonText: {
    fontSize: 15,
    color: "#3B82F6",
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutButtonText: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "600",
  },
  joinedText: {
    fontSize: 12,
    color: "#BBB",
    textAlign: "center",
    marginTop: 16,
  },
  // Edit mode
  editCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },
  yearRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  yearChip: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  yearChipActive: {
    backgroundColor: "#3B82F6",
  },
  yearChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  yearChipTextActive: {
    color: "#fff",
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#3B82F6",
  },
  saveBtnText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
});

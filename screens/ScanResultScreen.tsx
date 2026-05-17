import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { RootStackParamList } from "../types";

type Props = {
  userId: Id<"users">;
};

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}

export default function ScanResultScreen({ userId }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ScanResult">>();
  const { barcodeData } = route.params;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const isItem = barcodeData.startsWith("ITEM-");
  const isFacility = barcodeData.startsWith("FACILITY-");

  const item = useQuery(
    api.items.getByBarcode,
    isItem ? { barcode: barcodeData } : "skip"
  );
  const facility = useQuery(
    api.facilities.getByBarcode,
    isFacility ? { barcode: barcodeData } : "skip"
  );

  const activeCheckout = useQuery(
    api.items.getUserActiveCheckout,
    isItem && item ? { userId, itemId: item._id } : "skip"
  );
  const occupancy = useQuery(
    api.facilities.getUserOccupancy,
    isFacility && facility ? { userId, facilityId: facility._id } : "skip"
  );
  const facilityOccupancy = useQuery(
    api.facilities.getOccupancy,
    isFacility && facility ? { facilityId: facility._id } : "skip"
  );

  const checkoutItem = useMutation(api.items.checkout);
  const returnItem = useMutation(api.items.returnItem);
  const enterFacility = useMutation(api.facilities.enter);
  const exitFacility = useMutation(api.facilities.exit);

  const dataLoading =
    (isItem && (item === undefined || activeCheckout === undefined)) ||
    (isFacility &&
      (facility === undefined ||
        occupancy === undefined ||
        facilityOccupancy === undefined));

  if (dataLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Looking up barcode...</Text>
      </View>
    );
  }

  if ((isItem && !item) || (isFacility && !facility)) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Not Found</Text>
        <Text style={styles.errorText}>
          Barcode "{barcodeData}" is not registered in the system.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
          style={styles.backButton}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Item scan result ---
  if (isItem && item) {
    const hasActiveCheckout = activeCheckout !== null;

    const handleCheckout = async () => {
      setLoading(true);
      try {
        await checkoutItem({ userId, itemId: item._id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResultMessage(`You checked out "${item.name}"`);
        setDone(true);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Failed to checkout item");
      } finally {
        setLoading(false);
      }
    };

    const handleReturn = async () => {
      setLoading(true);
      try {
        const result = await returnItem({ userId, itemId: item._id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResultMessage(
          `Returned "${item.name}" after ${formatDuration(result.duration)}`
        );
        setDone(true);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Failed to return item");
      } finally {
        setLoading(false);
      }
    };

    if (hasActiveCheckout && activeCheckout) {
      const checkoutDuration = Date.now() - activeCheckout.checkoutTime;

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Ionicons name="cube-outline" size={48} color="#F59E0B" />
            <Text style={styles.cardTitle}>You Have This Item</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.detail}>
              Checked out: {formatDuration(checkoutDuration)} ago
            </Text>
            <Text style={styles.detail}>Location: {item.location}</Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.returnButton]}
              onPress={handleReturn}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>
                {loading ? "Returning..." : "Return Item"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => navigation.navigate("MainTabs")}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Item available for checkout
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="cube-outline" size={48} color="#3B82F6" />
          <Text style={styles.cardTitle}>Scanned</Text>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "available" ? "#DCFCE7" : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === "available" ? "#16A34A" : "#DC2626",
                  },
                ]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.detail}>Category: {item.category}</Text>
          <Text style={styles.detail}>Location: {item.location}</Text>

          {item.status === "available" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkoutButton]}
              onPress={handleCheckout}
              disabled={loading}
            >
              <Ionicons
                name="arrow-up-circle-outline"
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {loading ? "Checking out..." : "Checkout"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unavailableBox}>
              <Text style={styles.unavailableText}>
                This item is currently {item.status}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Facility scan result ---
  if (isFacility && facility) {
    const isInside = occupancy !== null;
    const currentCount = facilityOccupancy ?? 0;

    const handleEntry = async () => {
      setLoading(true);
      try {
        await enterFacility({ userId, facilityId: facility._id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResultMessage(
          `Welcome to ${facility.name}! Current occupants: ${currentCount + 1}/${facility.capacity}`
        );
        setDone(true);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Failed to log entry");
      } finally {
        setLoading(false);
      }
    };

    const handleExit = async () => {
      setLoading(true);
      try {
        const result = await exitFacility({ userId, facilityId: facility._id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResultMessage(
          `You were in ${facility.name} for ${formatDuration(result.duration)}`
        );
        setDone(true);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Failed to log exit");
      } finally {
        setLoading(false);
      }
    };

    if (isInside && occupancy) {
      const stayDuration = Date.now() - occupancy.entryTime;

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Ionicons name="business-outline" size={48} color="#8B5CF6" />
            <Text style={styles.cardTitle}>You Are Inside</Text>
            <Text style={styles.itemName}>{facility.name}</Text>
            <Text style={styles.detail}>
              Time inside: {formatDuration(stayDuration)}
            </Text>
            <Text style={styles.detail}>
              Occupancy: {currentCount}/{facility.capacity}
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.exitButton]}
              onPress={handleExit}
              disabled={loading}
            >
              <Ionicons name="exit-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>
                {loading ? "Logging exit..." : "Exit Facility"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => navigation.navigate("MainTabs")}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="business-outline" size={48} color="#3B82F6" />
          <Text style={styles.cardTitle}>Facility Scanned</Text>
          <Text style={styles.itemName}>{facility.name}</Text>
          <Text style={styles.detail}>Type: {facility.type}</Text>
          <Text style={styles.detail}>
            Occupancy: {currentCount}/{facility.capacity}
          </Text>

          {currentCount < facility.capacity ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.entryButton]}
              onPress={handleEntry}
              disabled={loading}
            >
              <Ionicons name="enter-outline" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>
                {loading ? "Logging entry..." : "Enter Facility"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unavailableBox}>
              <Text style={styles.unavailableText}>
                Facility is at full capacity
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 12,
  },
  errorText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
    textAlign: "center",
  },
  statusRow: {
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
  },
  checkoutButton: {
    backgroundColor: "#3B82F6",
  },
  returnButton: {
    backgroundColor: "#22C55E",
  },
  entryButton: {
    backgroundColor: "#3B82F6",
  },
  exitButton: {
    backgroundColor: "#8B5CF6",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  unavailableBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  unavailableText: {
    color: "#92400E",
    fontSize: 14,
  },
  cancelLink: {
    alignItems: "center",
    marginTop: 20,
  },
  cancelLinkText: {
    color: "#666",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});

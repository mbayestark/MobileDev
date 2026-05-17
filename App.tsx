import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications } from "./utils/notifications";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ScannerScreen from "./screens/ScannerScreen";
import ScanResultScreen from "./screens/ScanResultScreen";
import HistoryScreen from "./screens/HistoryScreen";
import AdminScreen from "./screens/AdminScreen";
import ItemsScreen from "./screens/ItemsScreen";
import ItemDetailScreen from "./screens/ItemDetailScreen";
import MyBookingsScreen from "./screens/MyBookingsScreen";
import BookFacilityScreen from "./screens/BookFacilityScreen";
import ProfileScreen from "./screens/ProfileScreen";

import { RootStackParamList, TabParamList } from "./types";
import { Id } from "./convex/_generated/dataModel";

const convex = new ConvexReactClient(
  "https://gallant-fox-90.convex.cloud"
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs({
  userId,
  isAdmin,
  onLogout,
}: {
  userId: Id<"users">;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E5E7EB",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <HomeScreen userId={userId} />}
      </Tab.Screen>
      <Tab.Screen
        name="Items"
        options={{
          title: "Equipment",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <ItemsScreen userId={userId} />}
      </Tab.Screen>
      <Tab.Screen
        name="Bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <MyBookingsScreen userId={userId} />}
      </Tab.Screen>
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          options={{
            title: "Admin",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-outline" size={size} color={color} />
            ),
          }}
          component={AdminScreen}
        />
      )}
      <Tab.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <ProfileScreen userId={userId} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    registerForPushNotifications();
    AsyncStorage.multiGet(["userId", "isAdmin"]).then(
      ([storedId, storedAdmin]) => {
        if (storedId[1]) {
          setUserId(storedId[1] as Id<"users">);
          setIsAdmin(storedAdmin[1] === "true");
        }
        setRestoring(false);
      }
    );
  }, []);

  const handleLogin = async (
    id: Id<"users">,
    role: string,
    admin: boolean
  ) => {
    setUserId(id);
    setIsAdmin(admin);
    await AsyncStorage.multiSet([
      ["userId", id],
      ["isAdmin", String(admin)],
    ]);
  };

  const handleLogout = async () => {
    setUserId(null);
    setIsAdmin(false);
    await AsyncStorage.multiRemove(["userId", "isAdmin"]);
  };

  if (restoring) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#3B82F6" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          {userId === null ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                options={{ headerShown: false }}
              >
                {() => (
                  <MainTabs
                    userId={userId}
                    isAdmin={isAdmin}
                    onLogout={handleLogout}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Scanner"
                options={{
                  title: "Scan Barcode",
                  presentation: "fullScreenModal",
                }}
              >
                {(props) => (
                  <ScannerScreen {...props} userId={userId} />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="ScanResult"
                options={{ title: "Scan Result" }}
              >
                {(props) => <ScanResultScreen {...props} userId={userId} />}
              </Stack.Screen>
              <Stack.Screen
                name="ItemDetail"
                options={{ title: "Item Details" }}
                component={ItemDetailScreen}
              />
              <Stack.Screen
                name="BookFacility"
                options={{ title: "Book Facility" }}
                component={BookFacilityScreen}
              />
              <Stack.Screen
                name="History"
                options={{ title: "Activity History" }}
              >
                {() => <HistoryScreen userId={userId} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ConvexProvider>
  );
}

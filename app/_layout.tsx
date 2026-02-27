import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../components/ThemeContext";
import CustomDrawer from "./drawer/drawer";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawer {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: { width: 300 },
          }}
        >
          <Drawer.Screen name="index" options={{ title: "Map & Weather" }} />
        </Drawer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
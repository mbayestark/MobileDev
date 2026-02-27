import { DrawerContentScrollView } from "@react-navigation/drawer";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "../../components/useTheme";

export default function CustomDrawer(props: any) {
  const { theme, colors, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={styles.logo}>🌍</Text>
          <Text style={[styles.title, { color: colors.text }]}>WeatherMap</Text>
        </View>

        {/* Theme toggle */}
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#ccc", true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          Powered by Open-Meteo
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  logo: { fontSize: 32, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  footer: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    fontSize: 11,
  },
});
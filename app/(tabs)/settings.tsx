import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../components/ThemeContext";

export default function Settings() {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontSize: 20, marginBottom: 20 }}>
          Theme: {mode}
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={toggleTheme}
        >
          <Text style={styles.buttonText}>Change Theme</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { padding: 30, borderRadius: 20, width: 250, alignItems: "center" },
  button: { padding: 12, borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "bold" },
});
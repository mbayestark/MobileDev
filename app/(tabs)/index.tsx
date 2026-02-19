import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function Home() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Mini Inventory</Text>

      <Link href="/inventory" asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
          <Text>Go to Inventory tab</Text>
        </Pressable>
      </Link>

      <Link href="/(modals)/add-item" asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
          <Text>Open “Add item” modal</Text>
        </Pressable>
      </Link>
    </View>
  );
}
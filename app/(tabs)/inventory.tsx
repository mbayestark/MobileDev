import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";

const ITEMS = [
  { id: "a1", name: "Battery pack" },
  { id: "b2", name: "Solar panel" },
  { id: "c3", name: "IMU sensor" },
];

export default function Inventory() {
  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Inventory</Text>

      {ITEMS.map((item) => (
        <Link key={item.id} href={`/item/${item.id}`} asChild>
          <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
            <Text>{item.name}</Text>
            <Text style={{ opacity: 0.6 }}>Open details →</Text>
          </Pressable>
        </Link>
      ))}

      <Link href="/(modals)/add-item" asChild>
        <Pressable style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
          <Text>+ Add item (modal)</Text>
        </Pressable>
      </Link>
    </View>
  );
}
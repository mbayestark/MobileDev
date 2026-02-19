import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function AddItemModal() {
  const router = useRouter();

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Add item</Text>
      <Text>This is just a demo modal screen.</Text>

      <Pressable
        onPress={() => router.back()}
        style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}
      >
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}   
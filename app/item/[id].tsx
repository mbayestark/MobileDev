import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function ItemDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Item details</Text>
      <Text>Route param id: {id}</Text>
    </View>
  );
}
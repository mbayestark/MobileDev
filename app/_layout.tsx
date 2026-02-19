import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="item/[id]" options={{ title: "Item" }} />
      <Stack.Screen
        name="(modals)/add-item"
        options={{ presentation: "modal", title: "Add item" }}
      />
    </Stack>
  );
}
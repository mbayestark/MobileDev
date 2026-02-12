import { AppText } from "@/components/AppText";
import { Slot } from "expo-router";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Layout() {
    // return <Slot />
    // return (
    //     <View className="flex-1 justify-center items-center items-center bg-red-200">
    //         <AppText>Nothing to see here</AppText>
    //         <Slot />
    //     </View>
    // )
    return <Redirect href="/second" />
}

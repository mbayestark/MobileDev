import { AppText } from "@/components/AppText";
import { View } from "react-native";
import { Slot } from "expo-router";

export default function IntermediateLayout() {
    return <Slot />


    return (
        <View className="flex-1 justify-center items-center bg-green-200">
            <AppText>Intermediate layout</AppText>
            <Slot />
        </View>
    )
}
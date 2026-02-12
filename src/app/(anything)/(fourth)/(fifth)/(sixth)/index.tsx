import { AppText } from "@/components/AppText";
import { View } from "react-native";

export default function DeeplyNestedScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-green-200">
            <AppText>Deeply Nested Screen</AppText>
        </View>
    )
}
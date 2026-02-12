import { View } from "react-native";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import { AppText } from "@/components/AppText";
import { useLocalSearchParams } from "expo-router";

export default function SecondScreen() {
    const params = useLocalSearchParams<{ name?: string }>();
    return (
        <View className="justify-center flex-1 p-4">
            {params.name ? (
                <AppText center>
                    Hello, <AppText bold>{params.name}</AppText>
                </AppText>) : null}
            <Link href="/third" push asChild>
                <Button title="Push to /third" />
            </Link>
        </View>
    );
}
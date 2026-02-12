import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Link, useRouter } from "expo-router";
import { Button } from "@/components/Button";

export default function ThirdScreen() {
    const router = useRouter();

    return (
        <View className="justify-center flex-1 p-4">
            <AppText center size="heading" bold>
                Second Screen
            </AppText>
            <Link href="/" push asChild>
                <Button title="Push to /" />
            </Link>
            <Link href="/" dismissTo asChild>
                <Button title="Dismiss to /" />
            </Link>
            <Link href="/second" replace asChild>
                <Button title="Replace to /second" />
            </Link>
        </View>
    );
}
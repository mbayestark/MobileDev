import { Image, StyleSheet, Text, View } from 'react-native';

export default function WeatherCard() {
    return (
        <>
            <View style={styles.card}>
                <Text style={styles.city}>City Name</Text>
                <Text style={styles.temp}>72°</Text>
                <View style={styles.conditionRow}>
                    <Image style={styles.icon} />
                    <Text style={styles.description}>Sunny</Text>
                </View>
                <View style={styles.highLowRow}>
                    <Text style={styles.high}>H: 78°</Text>
                    <Text style={styles.low}>L: 65°</Text>
                </View>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
    },
    city: {
        fontWeight: 'bold',
        fontSize: 32,
    },
    temp: {
        fontSize: 60,
        fontWeight: '200',
    },
    conditionRow: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 8,
    },
    description: {
        fontSize: 16,
    },
    highLowRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    high: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    low: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

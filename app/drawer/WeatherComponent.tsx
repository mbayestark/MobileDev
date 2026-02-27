import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../components/useTheme";
import { WeatherData, getWeatherInfo } from "../../components/weather";

interface Props {
  weather: WeatherData | null;
  loading: boolean;
  locationName: string;
}

export default function WeatherCard({ weather, loading, locationName }: Props) {
  const { colors } = useTheme();
  const current = weather?.current;
  const info = current ? getWeatherInfo(current.weatherCode) : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
        📍 {locationName}
      </Text>

      {loading || !current || !info ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
      ) : (
        <View style={styles.row}>
          <View>
            <Text style={[styles.temp, { color: colors.text }]}>{current.temperature}°C</Text>
            <Text style={[styles.condition, { color: colors.textSecondary }]}>{info.label}</Text>
          </View>
          <Text style={styles.icon}>{info.icon}</Text>
          <View style={styles.details}>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>💧 {current.humidity}%</Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>🌬 {current.windSpeed} km/h</Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>Feels {current.feelsLike}°</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  location: { fontSize: 12, letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  temp: { fontSize: 52, fontWeight: "200", letterSpacing: -1 },
  condition: { fontSize: 13, marginTop: 2 },
  icon: { fontSize: 48 },
  details: { gap: 4, alignItems: "flex-end" },
  detail: { fontSize: 13 },
});
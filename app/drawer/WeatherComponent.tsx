import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../components/useTheme";
import { WeatherData, getWeatherInfo } from "../../components/weather";

interface Props {
  weather: WeatherData | null;
  loading: boolean;
  locationName: string;
}

function getDayLabel(dateStr: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
}

export default function WeatherCard({ weather, loading, locationName }: Props) {
  const { colors } = useTheme();
  const current = weather?.current;
  const info = current ? getWeatherInfo(current.weatherCode) : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Handle bar */}
      <View style={[styles.handle, { backgroundColor: colors.border }]} />

      {/* Location */}
      <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
        📍 {locationName}
      </Text>

      {loading || !current || !info ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current day */}
          <View style={styles.currentRow}>
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

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* 7-day forecast */}
          {weather!.daily.map((day, i) => {
            const dayInfo = getWeatherInfo(day.weatherCode);
            return (
              <View key={day.date} style={[styles.forecastRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.dayLabel, { color: colors.text }]}>{getDayLabel(day.date, i)}</Text>
                <Text style={styles.forecastIcon}>{dayInfo.icon}</Text>
                <Text style={[styles.forecastTemps, { color: colors.textSecondary }]}>
                  {day.minTemp}° / <Text style={{ color: colors.text, fontWeight: "600" }}>{day.maxTemp}°</Text>
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxHeight: "55%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: "center", marginBottom: 12,
  },
  location: { fontSize: 12, letterSpacing: 0.5, marginBottom: 10 },
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  temp: { fontSize: 52, fontWeight: "200", letterSpacing: -1 },
  condition: { fontSize: 13, marginTop: 2 },
  icon: { fontSize: 44 },
  details: { gap: 4, alignItems: "flex-end" },
  detail: { fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 8 },
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayLabel: { fontSize: 14, flex: 1 },
  forecastIcon: { fontSize: 22, marginHorizontal: 12 },
  forecastTemps: { fontSize: 14 },
});
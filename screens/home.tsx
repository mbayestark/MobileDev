import * as Location from "expo-location";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { getForecast } from "../components/weather";
import { ThemeContext } from "./../components/ThemeContext";

const GOOGLE_KEY = "PASTE_YOUR_KEY_HERE";

export default function HomeScreen() {
  const theme = useContext(ThemeContext);
  const mapRef = useRef(null);

  const [coords, setCoords] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const region = useMemo(() => {
    if (!coords) return null;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
  }, [coords]);

  async function loadWeather(lat, lon) {
    setLoadingWeather(true);
    try {
      const data = await getForecast(lat, lon);
      setWeather(data);
    } catch (e) {
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  }

  useEffect(() => {
    (async () => {
      setLoadingLoc(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoadingLoc(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCoords(c);
      setLoadingLoc(false);
      loadWeather(c.latitude, c.longitude);
    })();
  }, []);

  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (loadingLoc) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>Getting location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Search bar */}
      <View style={{ paddingTop: 10, paddingHorizontal: 10, zIndex: 10 }}>
        <GooglePlacesAutocomplete
          placeholder="Search location..."
          fetchDetails={true}
          query={{ key: GOOGLE_KEY, language: "en" }}
          onPress={(data, details = null) => {
            if (!details?.geometry?.location) return;
            const lat = details.geometry.location.lat;
            const lon = details.geometry.location.lng;

            setCoords({ latitude: lat, longitude: lon });
            loadWeather(lat, lon);

            mapRef.current?.animateToRegion(
              { latitude: lat, longitude: lon, latitudeDelta: 0.03, longitudeDelta: 0.03 },
              700
            );
          }}
          styles={{
            textInput: {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderRadius: 10,
            },
            listView: { backgroundColor: theme.colors.bg },
            row: { backgroundColor: theme.colors.bg },
            description: { color: theme.colors.text },
          }}
        />
      </View>

      {/* Map */}
      {region ? (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          onRegionChangeComplete={(r) => {
            // user can move map freely; OPTIONAL: fetch weather on map move
          }}
        >
          <Marker coordinate={coords} title="Selected location" />
        </MapView>
      ) : (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.text }}>Location not available.</Text>
        </View>
      )}

      {/* Weather card */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        {loadingWeather ? (
          <ActivityIndicator />
        ) : !weather?.current ? (
          <Text style={{ color: theme.colors.text }}>Weather not available.</Text>
        ) : (
          <ScrollView>
            <Text style={[styles.h2, { color: theme.colors.text }]}>Current</Text>
            <Text style={{ color: theme.colors.text }}>
              Temperature: {weather.current.temperature_2m}°C
            </Text>
            <Text style={{ color: theme.colors.text }}>
              Wind: {weather.current.wind_speed_10m} km/h
            </Text>

            <Text style={[styles.h2, { color: theme.colors.text, marginTop: 10 }]}>
              Next 7 days
            </Text>

            {weather.daily?.time?.map((day, i) => (
              <View key={day} style={styles.row}>
                <Text style={{ color: theme.colors.text, flex: 1 }}>{day}</Text>
                <Text style={{ color: theme.colors.text }}>
                  {weather.daily.temperature_2m_min[i]}° / {weather.daily.temperature_2m_max[i]}°
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    card: {
      maxHeight: 220,
      padding: 12,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    h2: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  });
}
import { DrawerActions } from "@react-navigation/native";
import * as Location from "expo-location";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapComponent, { MapComponentRef } from "../components/ui/MapComponent";
import { useTheme } from "../components/useTheme";
import { fetchWeather, geocodeSearch, WeatherData } from "../components/weather";
import WeatherCard from "./drawer/WeatherComponent";

interface Coord { latitude: number; longitude: number; }

export default function MapScreen() {
  const { theme, colors } = useTheme();
  const navigation = useNavigation();
  const mapRef = useRef<MapComponentRef>(null);

  const [userLocation, setUserLocation] = useState<Coord | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Coord | null>(null);
  const [locationName, setLocationName] = useState("Your Location");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const loadWeather = useCallback(async (lat: number, lng: number) => {
    setWeatherLoading(true);
    setWeather(null);
    try {
      setWeather(await fetchWeather(lat, lng));
    } catch { }
    finally { setWeatherLoading(false); }
  }, []);

  const flyTo = (coord: Coord) => {
    mapRef.current?.animateToRegion({ ...coord, latitudeDelta: 0.08, longitudeDelta: 0.08 });
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coord: Coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coord);
      setSelectedLocation(coord);
      try {
        const [g] = await Location.reverseGeocodeAsync(coord);
        if (g) setLocationName([g.city, g.region, g.country].filter(Boolean).join(", "));
      } catch { }
      loadWeather(coord.latitude, coord.longitude);
      flyTo(coord);
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setSearching(true);
    try {
      const result = await geocodeSearch(searchQuery.trim());
      if (!result) return;
      const coord: Coord = { latitude: result.latitude, longitude: result.longitude };
      setSelectedLocation(coord);
      setLocationName(`${result.name}, ${result.country}`);
      loadWeather(result.latitude, result.longitude);
      flyTo(coord);
      setSearchQuery("");
    } finally {
      setSearching(false);
    }
  };

  const topOffset = Platform.OS === "ios" ? 56 : (StatusBar.currentHeight ?? 0) + 12;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar as any} />

      {/* Map fills all space above the weather card */}
      <View style={{ flex: 1 }}>
        <MapComponent
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          theme={theme}
          accentColor={colors.accent}
          selectedLocation={selectedLocation}
          locationName={locationName}
          region={{ latitude: 48.8566, longitude: 2.3522, latitudeDelta: 5, longitudeDelta: 5 }}
        />

        {/* Top bar floats over the map */}
        <View style={[styles.topBar, { top: topOffset }]}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.surface }]}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Text style={styles.iconTxt}>☰</Text>
          </TouchableOpacity>

          <View style={[styles.searchPill, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search a place…"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searching
              ? <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 10 }} />
              : (
                <TouchableOpacity
                  onPress={handleSearch}
                  style={[styles.goBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Go</Text>
                </TouchableOpacity>
              )
            }
          </View>

          {userLocation && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setSelectedLocation(userLocation);
                setLocationName("Your Location");
                loadWeather(userLocation.latitude, userLocation.longitude);
                flyTo(userLocation);
              }}
            >
              <Text style={styles.iconTxt}>📍</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Weather card pinned at the footer */}
      <WeatherCard weather={weather} loading={weatherLoading} locationName={locationName} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  iconTxt: { fontSize: 18 },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  goBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
});
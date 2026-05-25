import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const API_KEY = "20ddfaabbc356e08643951331011bebf";

export default function WeatherCard() {
  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState("");

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({});
    const { latitude: lat, longitude: lon } = location.coords;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    setWeather(data);
    setCity(data.name);
  };

  // UV index is static here – you can hook up a UV API if needed
  const uvLabel = "Moderate UV";
  const humidity = weather?.main?.humidity ?? 45;
  const temp = weather ? Math.round(weather.main.temp) : 27;
  const condition = weather?.weather[0]?.main ?? "Sunny";

  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.rowTop}>
        <View>
          <Text style={styles.label}>Local Weather</Text>
          <Text style={styles.temp}>{temp}°C</Text>
          <Text style={styles.city}>
            {condition} · {city || "New York"}
          </Text>
        </View>
        <Ionicons name="sunny" size={52} color="rgba(255,255,255,0.9)" />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Row */}
      <View style={styles.rowBottom}>
        {/* UV Index */}
        <View style={styles.stat}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="white-balance-sunny"
              size={18}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.statLabel}>UV INDEX</Text>
            <Text style={styles.statValue}>{uvLabel}</Text>
          </View>
        </View>

        {/* Humidity */}
        <View style={styles.stat}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.statLabel}>HUMIDITY</Text>
            <Text style={styles.statValue}>{humidity}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 15,
    marginBottom: 24,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginBottom: 4,
  },
  temp: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  city: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 14,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statValue: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});

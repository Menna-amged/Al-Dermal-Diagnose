import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const API_KEY = "20ddfaabbc356e08643951331011bebf";
const BLUE = "#2563EB";

type WeatherData = {
  temp: number;
  humidity: number;
  condition: string;
  conditionId: number;
  city: string;
  uvIndex: number | null;
  windSpeed: number;
  isDay: boolean;
};

function conditionIcon(id: number, isDay: boolean): string {
  if (id >= 200 && id < 300) return "thunderstorm-outline";
  if (id >= 300 && id < 500) return "rainy-outline";
  if (id >= 500 && id < 600) return "rainy";
  if (id >= 600 && id < 700) return "snow-outline";
  if (id >= 700 && id < 800) return "cloud-outline";
  if (id === 800)             return isDay ? "sunny" : "moon-outline";
  if (id === 801)             return "partly-sunny-outline";
  return "cloudy-outline";
}

function uvLabel(uv: number | null): string {
  if (uv === null) return "—";
  if (uv < 3)  return `${uv.toFixed(1)}  Low`;
  if (uv < 6)  return `${uv.toFixed(1)}  Moderate`;
  if (uv < 8)  return `${uv.toFixed(1)}  High`;
  if (uv < 11) return `${uv.toFixed(1)}  Very High`;
  return `${uv.toFixed(1)}  Extreme`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function WeatherCard() {
  const [data, setData]       = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  useEffect(() => { load(); }, []);

  const getCoords = (): Promise<{ lat: number; lon: number }> => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => reject(new Error("denied")),
          { timeout: 15000, enableHighAccuracy: true, maximumAge: 30000 }
        );
      });
    }
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      .then((loc) => ({ lat: loc.coords.latitude, lon: loc.coords.longitude }));
  };

  const resolvePlaceName = async (lat: number, lon: number, owmName?: string): Promise<string> => {
    try {
      if (Platform.OS !== "web") {
        const r = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (r[0]) {
          const c = r[0].city || r[0].subregion || r[0].region;
          if (c) return c;
        }
      }
    } catch {}
    try {
      const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      if (r.ok) {
        const d = await r.json();
        const c = d.city || d.locality || d.principalSubdivision;
        if (c) return c;
      }
    } catch {}
    return owmName ?? "";
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let lat: number, lon: number;
      try {
        const coords = await getCoords();
        lat = coords.lat; lon = coords.lon;
      } catch {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (!ipRes.ok) { setError("Could not determine location"); return; }
        const ipData = await ipRes.json();
        if (!ipData.latitude || !ipData.longitude) { setError("Could not determine location"); return; }
        lat = ipData.latitude; lon = ipData.longitude;
      }

      const [weatherRes, uvRes] = await Promise.allSettled([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
      ]);

      if (weatherRes.status !== "fulfilled" || !weatherRes.value.ok) { setError("Could not load weather"); return; }
      const w = await weatherRes.value.json();

      let uvIndex: number | null = null;
      if (uvRes.status === "fulfilled" && uvRes.value.ok) {
        const uvData = await uvRes.value.json();
        if (typeof uvData.value === "number") uvIndex = uvData.value;
      }

      const sunriseMs = (w.sys?.sunrise ?? 0) * 1000;
      const sunsetMs  = (w.sys?.sunset  ?? 0) * 1000;
      const isDay     = Date.now() >= sunriseMs && Date.now() <= sunsetMs;
      const city      = await resolvePlaceName(lat, lon, w.name);

      setData({
        temp:        Math.round(w.main.temp),
        humidity:    w.main.humidity,
        condition:   capitalize(w.weather?.[0]?.description ?? w.weather?.[0]?.main ?? "Clear"),
        conditionId: w.weather?.[0]?.id ?? 800,
        city, uvIndex,
        windSpeed:   w.wind?.speed ?? 0,
        isDay,
      });
    } catch {
      setError("Could not load weather");
    } finally {
      setLoading(false);
    }
  };

  const cardBg = BLUE;

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: BLUE }, styles.centered]}>
        <ActivityIndicator color="#fff" size="small" />
        <Text style={styles.loadingText}>Getting weather…</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.card, { backgroundColor: BLUE }, styles.centered]}>
        <Ionicons name="cloud-offline-outline" size={32} color="rgba(255,255,255,0.7)" />
        <Text style={styles.errorText}>{error ?? "Weather unavailable"}</Text>
        <Text style={styles.errorHint}>Make sure you're connected to the internet</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={14} color="#2563EB" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const icon = conditionIcon(data.conditionId, data.isDay) as any;
  const sub  = "rgba(255,255,255,0.8)";

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: sub }]}>Local Weather</Text>
          <Text style={styles.temp}>{data.temp}°C</Text>
          <Text style={[styles.city, { color: sub }]}>{data.condition} · {data.city}</Text>
        </View>
        <Ionicons name={icon} size={52} color={sub} />
      </View>

      <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />

      <View style={styles.rowBottom}>
        <View style={styles.stat}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="white-balance-sunny" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: sub }]}>UV INDEX</Text>
            <Text style={styles.statValue}>{uvLabel(data.uvIndex)}</Text>
          </View>
        </View>
        <View style={styles.stat}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: sub }]}>HUMIDITY</Text>
            <Text style={styles.statValue}>{data.humidity}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 15, marginBottom: 24 },
  centered: { alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 10 },
  loadingText: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  errorText:   { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center", fontWeight: "600" },
  errorHint:   { color: "rgba(255,255,255,0.6)", fontSize: 11, textAlign: "center" },
  retryBtn:    { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  retryText:   { fontSize: 13, fontWeight: "600", color: "#2563EB" },

  rowTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label:   { fontSize: 14, marginBottom: 4 },
  temp:    { fontSize: 36, fontWeight: "bold", color: "#fff" },
  city:    { fontSize: 14, marginTop: 2 },
  divider: { height: 1, marginVertical: 14 },

  rowBottom: { flexDirection: "row", justifyContent: "space-around" },
  stat:      { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  statLabel: { fontSize: 10, letterSpacing: 0.5 },
  statValue: { fontWeight: "600", fontSize: 13, color: "#fff" },

});

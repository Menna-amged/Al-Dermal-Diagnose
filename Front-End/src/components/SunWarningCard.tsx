import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  DISEASES, DiseaseName, WeatherSnapshot, DiseaseAlert, Severity,
  evaluateWeather, overallRisk,
} from "../data/diseaseWeatherRules";

const API_KEY = "20ddfaabbc356e08643951331011bebf";
const CONDITION_KEY = "current_condition";

const SEVERITY_COLOR: Record<Severity, { bg: string; border: string; ic: string; text: string; pill: string }> = {
  high:   { bg: "#FEF2F2", border: "#FCA5A5", ic: "#DC2626", text: "#991B1B", pill: "HIGH RISK" },
  medium: { bg: "#FFFBEB", border: "#FCD34D", ic: "#D97706", text: "#92400E", pill: "WATCH OUT" },
  low:    { bg: "#F0FDF4", border: "#86EFAC", ic: "#16A34A", text: "#14532D", pill: "MILD" },
};

async function fetchSnapshot(): Promise<WeatherSnapshot | null> {
  try {
    let lat: number, lon: number;

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000, enableHighAccuracy: true })
      );
      lat = pos.coords.latitude; lon = pos.coords.longitude;
    } else {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") return null;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      lat = loc.coords.latitude; lon = loc.coords.longitude;
    }

    const [wRes, uvRes] = await Promise.allSettled([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
    ]);

    if (wRes.status !== "fulfilled" || !wRes.value.ok) return null;
    const w = await wRes.value.json();
    let uv = 0;
    if (uvRes.status === "fulfilled" && uvRes.value.ok) {
      const uvJ = await uvRes.value.json();
      if (typeof uvJ.value === "number") uv = uvJ.value;
    }
    return {
      temp:      Math.round(w.main.temp),
      uvIndex:   uv,
      humidity:  w.main.humidity ?? 0,
      windSpeed: w.wind?.speed ?? 0,
      condition: w.weather?.[0]?.main ?? "Clear",
    };
  } catch {
    return null;
  }
}

interface Props {
  disease: string;
}

export default function SunWarningCard({ disease }: Props) {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading]   = useState(true);
  const [resolvedDisease, setResolvedDisease] = useState<DiseaseName | null>(null);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(CONDITION_KEY).then((v) => {
      if (v && (DISEASES as readonly string[]).includes(v)) setResolvedDisease(v as DiseaseName);
      else {
        // fall back to the prop if it matches a known disease
        const match = DISEASES.find((d) => d.toLowerCase() === disease.toLowerCase());
        setResolvedDisease(match ?? null);
      }
    });
  }, [disease]));

  useEffect(() => {
    fetchSnapshot().then((s) => { setSnapshot(s); setLoading(false); });
  }, []);

  if (!resolvedDisease) return null;

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }]}>
        <ActivityIndicator color="#D97706" />
        <Text style={styles.loadingText}>Checking conditions…</Text>
      </View>
    );
  }

  if (!snapshot) return null;

  const alerts = evaluateWeather(resolvedDisease, snapshot);
  const risk   = overallRisk(alerts);

  if (!risk) {
    // No alerts — show a clean "all good" card
    const c = SEVERITY_COLOR.low;
    return (
      <View style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: c.ic + "22" }]}>
            <Ionicons name="checkmark-circle" size={20} color={c.ic} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: c.text }]}>Conditions look good today</Text>
            <Text style={styles.sub}>
              Today's weather is unlikely to affect your {resolvedDisease.toLowerCase()}. Keep up your normal routine.
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: c.ic + "22" }]}>
            <Text style={[styles.pillText, { color: c.ic }]}>MILD</Text>
          </View>
        </View>
      </View>
    );
  }

  const c = SEVERITY_COLOR[risk];
  const topAlert = alerts[0];

  return (
    <View style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}>
      {/* Header row */}
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: c.ic + "22" }]}>
          <Ionicons name={risk === "high" ? "warning" : "alert-circle"} size={20} color={c.ic} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.text }]}>{topAlert.title}</Text>
          <Text style={styles.sub}>{topAlert.reason}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: c.ic + "22" }]}>
          <Text style={[styles.pillText, { color: c.ic }]}>{c.pill}</Text>
        </View>
      </View>

      {/* Guidance */}
      <View style={[styles.divider, { backgroundColor: c.border }]} />
      <Text style={styles.guidanceLabel}>What to do:</Text>
      {topAlert.guidance.map((g, i) => (
        <View key={i} style={styles.guidanceRow}>
          <View style={[styles.dot, { backgroundColor: c.ic }]} />
          <Text style={styles.guidanceText}>{g}</Text>
        </View>
      ))}

      {/* If more alerts exist, show count */}
      {alerts.length > 1 && (
        <Text style={[styles.moreAlerts, { color: c.ic }]}>
          +{alerts.length - 1} more alert{alerts.length - 1 > 1 ? "s" : ""} · See Weather Alerts for details
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  loadingText: { fontSize: 13, color: "#9CA3AF", marginTop: 8, textAlign: "center" },

  row:        { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 4 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginTop: 1 },
  title:      { fontSize: 14, fontWeight: "700", marginBottom: 3, flexShrink: 1 },
  sub:        { fontSize: 12, color: "#374151", lineHeight: 17, flexShrink: 1 },
  pill:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start", marginLeft: 4 },
  pillText:   { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  divider:      { height: 1, marginVertical: 10 },
  guidanceLabel:{ fontSize: 11, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5, marginBottom: 6 },
  guidanceRow:  { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  dot:          { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  guidanceText: { flex: 1, fontSize: 12, color: "#111", lineHeight: 17 },
  moreAlerts:   { fontSize: 11, fontWeight: "600", marginTop: 6 },
});

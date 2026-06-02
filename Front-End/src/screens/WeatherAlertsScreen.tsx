import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList,
  ActivityIndicator, StatusBar, Modal, Pressable, Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../config/colors";
import {
  DISEASES, DiseaseName, WeatherSnapshot, DiseaseAlert, Severity,
  evaluateWeather, overallRisk,
} from "../data/diseaseWeatherRules";

const API_KEY = "20ddfaabbc356e08643951331011bebf";
const STORAGE_KEY = "current_condition";

// ── Location helpers ────────────────────────────────────────────────────────
async function getAccurateLocation(): Promise<{ lat: number; lon: number } | null> {
  try {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
      return await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
      });
    }
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: loc.coords.latitude, lon: loc.coords.longitude };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  // Try native expo reverse geocode first
  try {
    if (Platform.OS !== "web") {
      const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (res[0]) {
        const r = res[0];
        const parts = [r.city || r.subregion, r.region, r.country].filter(Boolean);
        if (parts.length) return parts.slice(0, 2).join(", ");
      }
    }
  } catch {}
  // Fallback: BigDataCloud (free, no key) — far more accurate than OpenWeatherMap's name
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (r.ok) {
      const d = await r.json();
      const parts = [d.city || d.locality, d.principalSubdivision, d.countryName].filter(Boolean);
      if (parts.length) return parts.slice(0, 2).join(", ");
    }
  } catch {}
  return "Your location";
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  try {
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

// ── Visual helpers ──────────────────────────────────────────────────────────
const SEVERITY_COLOR: Record<Severity, { bg: string; border: string; ic: string; text: string; pill: string }> = {
  high:   { bg: "#FEF2F2", border: "#FCA5A5", ic: "#DC2626", text: "#991B1B", pill: "HIGH RISK" },
  medium: { bg: "#FFFBEB", border: "#FCD34D", ic: "#D97706", text: "#92400E", pill: "WATCH OUT" },
  low:    { bg: "#F0FDF4", border: "#86EFAC", ic: "#16A34A", text: "#14532D", pill: "MILD" },
};

function uvLabel(uv: number): string {
  if (uv < 3)  return "Low";
  if (uv < 6)  return "Moderate";
  if (uv < 8)  return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

export default function WeatherAlertsScreen({ navigation }: any) {
  const [loading, setLoading]         = useState(true);
  const [weather, setWeather]         = useState<WeatherSnapshot | null>(null);
  const [placeName, setPlaceName]     = useState<string>("");
  const [disease, setDisease]         = useState<DiseaseName | null>(null);
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Load saved disease
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v && (DISEASES as readonly string[]).includes(v)) setDisease(v as DiseaseName);
      else setDisease(null);
    });
  }, []));

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const coords = await getAccurateLocation();
    if (!coords) {
      setError("Location permission denied. Enable GPS to get accurate weather and alerts.");
      setLoading(false);
      return;
    }
    const [w, place] = await Promise.all([
      fetchWeather(coords.lat, coords.lon),
      reverseGeocode(coords.lat, coords.lon),
    ]);
    if (!w) {
      setError("Could not load weather. Check your internet connection.");
      setLoading(false);
      return;
    }
    setWeather(w);
    setPlaceName(place);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const setCondition = async (d: DiseaseName | null) => {
    setDisease(d);
    setPickerOpen(false);
    if (d) await AsyncStorage.setItem(STORAGE_KEY, d);
    else   await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const confirmRemove = () => {
    const proceed = () => setCondition(null);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Mark yourself as healed? This will clear weather alerts for your condition.")) proceed();
    } else {
      Alert.alert("Mark as healed", "Clear your condition? You won't see disease-specific alerts.", [
        { text: "Cancel", style: "cancel" },
        { text: "I'm healed", style: "destructive", onPress: proceed },
      ]);
    }
  };

  const alerts = weather && disease ? evaluateWeather(disease, weather) : [];
  const risk   = overallRisk(alerts);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Health Alerts</Text>
        <View style={styles.premiumBadge}>
          <MaterialCommunityIcons name="crown" size={12} color="#F59E0B" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Weather card */}
        {loading ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.weatherLoadingText}>Getting accurate location & weather…</Text>
          </View>
        ) : error ? (
          <View style={styles.weatherError}>
            <Ionicons name="cloud-offline-outline" size={32} color="#9CA3AF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadAll} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={14} color={colors.main} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : weather ? (
          <View style={styles.weatherCard}>
            <View style={styles.weatherTopRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.placeText} numberOfLines={1}>{placeName}</Text>
                </View>
                <Text style={styles.tempText}>{weather.temp}°C</Text>
                <Text style={styles.condText}>{weather.condition}</Text>
              </View>
              <TouchableOpacity onPress={loadAll} style={styles.refreshIconBtn}>
                <Ionicons name="refresh" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.weatherStatsRow}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="white-balance-sunny" size={16} color="#FBBF24" />
                <Text style={styles.statValue}>{weather.uvIndex.toFixed(1)}</Text>
                <Text style={styles.statLabel}>UV · {uvLabel(weather.uvIndex)}</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="water" size={16} color="#60A5FA" />
                <Text style={styles.statValue}>{weather.humidity}%</Text>
                <Text style={styles.statLabel}>Humidity</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="weather-windy" size={16} color="#E5E7EB" />
                <Text style={styles.statValue}>{weather.windSpeed.toFixed(0)}</Text>
                <Text style={styles.statLabel}>m/s wind</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Condition selector */}
        <Text style={styles.sectionLabel}>YOUR CURRENT CONDITION</Text>
        <View style={styles.diseaseRow}>
          <TouchableOpacity
            style={styles.diseasePicker}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.diseaseIconBox}>
              <Ionicons name={disease ? "medkit" : "happy-outline"} size={20} color={colors.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.diseasePickerLabel}>
                {disease ? disease : "I don't have any condition"}
              </Text>
              <Text style={styles.diseasePickerHint}>
                {disease ? "Tap to change" : "Tap to select your detected condition"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>
          {disease && (
            <TouchableOpacity style={styles.healedBtn} onPress={confirmRemove} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.healedBtnText}>I'm healed</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Alerts section */}
        {disease && weather && (
          <>
            <View style={styles.alertsHeaderRow}>
              <Text style={styles.sectionLabel}>TODAY'S ALERTS FOR {disease.toUpperCase()}</Text>
              {risk && (
                <View style={[styles.riskPill, { backgroundColor: SEVERITY_COLOR[risk].ic + "22" }]}>
                  <Text style={[styles.riskPillText, { color: SEVERITY_COLOR[risk].ic }]}>
                    {SEVERITY_COLOR[risk].pill}
                  </Text>
                </View>
              )}
            </View>

            {alerts.length === 0 ? (
              <View style={styles.noAlertCard}>
                <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
                <Text style={styles.noAlertTitle}>Conditions look good today</Text>
                <Text style={styles.noAlertSub}>
                  Today's weather is unlikely to affect your {disease.toLowerCase()}. Keep up your normal skincare routine.
                </Text>
              </View>
            ) : (
              alerts.map((a, i) => {
                const c = SEVERITY_COLOR[a.severity];
                return (
                  <View key={i} style={[styles.alertCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                    <View style={styles.alertHeader}>
                      <View style={[styles.alertIconCircle, { backgroundColor: c.ic + "22" }]}>
                        <Ionicons
                          name={a.severity === "high" ? "warning" : "alert-circle"}
                          size={18}
                          color={c.ic}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.alertTitle, { color: c.text }]}>{a.title}</Text>
                        <Text style={styles.alertReason}>{a.reason}</Text>
                      </View>
                    </View>
                    <View style={[styles.alertDivider, { backgroundColor: c.border }]} />
                    <Text style={styles.guidanceLabel}>What to do:</Text>
                    {a.guidance.map((g, j) => (
                      <View key={j} style={styles.guidanceRow}>
                        <View style={[styles.guidanceDot, { backgroundColor: c.ic }]} />
                        <Text style={styles.guidanceText}>{g}</Text>
                      </View>
                    ))}
                  </View>
                );
              })
            )}
          </>
        )}

        {!disease && weather && (
          <View style={styles.noConditionCard}>
            <MaterialCommunityIcons name="information-outline" size={28} color={colors.main} />
            <Text style={styles.noConditionTitle}>Select your condition to get alerts</Text>
            <Text style={styles.noConditionSub}>
              Once you tell us what you have, we'll watch the weather for you and warn you when conditions could flare your skin.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Disease picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Condition</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DISEASES as readonly string[]}
              keyExtractor={(d) => d}
              renderItem={({ item }) => {
                const selected = disease === item;
                return (
                  <TouchableOpacity
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => setCondition(item as DiseaseName)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={selected ? colors.main : "#9CA3AF"}
                    />
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  premiumBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#FFFBEB",
    alignItems: "center", justifyContent: "center",
  },
  content: { paddingHorizontal: 16, paddingTop: 14 },

  // Weather card
  weatherCard: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  weatherTopRow: { flexDirection: "row", alignItems: "flex-start" },
  locationRow:   { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  placeText:     { color: "rgba(255,255,255,0.95)", fontSize: 13, fontWeight: "600", flex: 1 },
  tempText:      { color: "#fff", fontSize: 38, fontWeight: "800", lineHeight: 44 },
  condText:      { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  refreshIconBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  weatherStatsRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  statValue: { color: "#fff", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 10 },

  weatherLoading: { backgroundColor: "#2563EB", borderRadius: 20, padding: 28, alignItems: "center", gap: 10, marginBottom: 18 },
  weatherLoadingText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  weatherError: { backgroundColor: "#fff", borderRadius: 20, padding: 28, alignItems: "center", gap: 10, marginBottom: 18 },
  errorText: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  retryText: { fontSize: 13, fontWeight: "700", color: colors.main },

  // Section
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#6B7280", letterSpacing: 0.8,
    marginBottom: 8, marginTop: 4,
  },

  // Disease picker
  diseaseRow: { gap: 8, marginBottom: 14 },
  diseasePicker: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  diseaseIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
  },
  diseasePickerLabel: { fontSize: 15, fontWeight: "700", color: "#111" },
  diseasePickerHint:  { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  healedBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1, borderColor: "#86EFAC",
    borderRadius: 12,
    paddingVertical: 10,
  },
  healedBtnText: { fontSize: 13, fontWeight: "700", color: "#15803D" },

  // Alerts header
  alertsHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  riskPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8 },
  riskPillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  // Alert card
  alertCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  alertHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  alertIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  alertReason: { fontSize: 12, color: "#374151", lineHeight: 17 },
  alertDivider: { height: 1, marginVertical: 10 },
  guidanceLabel: { fontSize: 11, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5, marginBottom: 6 },
  guidanceRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  guidanceDot: { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  guidanceText: { flex: 1, fontSize: 13, color: "#111", lineHeight: 18 },

  noAlertCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5, borderColor: "#86EFAC",
    borderRadius: 16,
    padding: 18, gap: 6, alignItems: "center",
    marginBottom: 10,
  },
  noAlertTitle: { fontSize: 15, fontWeight: "700", color: "#14532D" },
  noAlertSub:   { fontSize: 12, color: "#15803D", textAlign: "center", lineHeight: 17 },

  noConditionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22, gap: 8, alignItems: "center",
    marginTop: 6,
  },
  noConditionTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  noConditionSub:   { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 18 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "70%",
    overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, elevation: 12,
  },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  modalOption: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  modalOptionSelected: { backgroundColor: "#EFF6FF" },
  modalOptionText: { flex: 1, fontSize: 15, color: "#111" },
  modalOptionTextSelected: { fontWeight: "700", color: colors.main },
  modalSeparator: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 18 },
});

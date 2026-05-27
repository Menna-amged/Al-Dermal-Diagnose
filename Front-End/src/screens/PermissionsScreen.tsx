import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PERMISSIONS = [
  { icon: "location-outline" as const,     label: "Location",      sub: "For accurate local weather" },
  { icon: "camera-outline" as const,       label: "Camera",        sub: "To take skin photos for diagnosis" },
  { icon: "images-outline" as const,       label: "Photo Library", sub: "To upload skin images" },
  { icon: "notifications-outline" as const,label: "Notifications", sub: "For appointment reminders" },
];

export default function PermissionsScreen({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {}
    try {
      await ImagePicker.requestCameraPermissionsAsync();
    } catch {}
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    } catch {}
    try {
      await Notifications.requestPermissionsAsync();
    } catch {}
    await AsyncStorage.setItem("permissionsShown", "true");
    setLoading(false);
    onDone();
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("permissionsShown", "true");
    onDone();
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={48} color="#2563EB" />
        </View>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.sub}>DermaAI needs a few permissions to give you the best experience</Text>
      </View>

      <View style={styles.list}>
        {PERMISSIONS.map((p) => (
          <View key={p.label} style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name={p.icon} size={22} color="#2563EB" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{p.label}</Text>
              <Text style={styles.rowSub}>{p.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btn} onPress={handleAllow} activeOpacity={0.85} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Allow All & Continue</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} disabled={loading}>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 28, justifyContent: "space-between", paddingTop: 80, paddingBottom: 48 },

  top:      { alignItems: "center", gap: 12 },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  title:    { fontSize: 26, fontWeight: "700", color: "#111", textAlign: "center" },
  sub:      { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },

  list:       { gap: 20 },
  row:        { flexDirection: "row", alignItems: "center", gap: 16 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  rowText:    { flex: 1 },
  rowLabel:   { fontSize: 15, fontWeight: "600", color: "#111" },
  rowSub:     { fontSize: 12, color: "#888", marginTop: 2 },

  bottom:  { gap: 14, alignItems: "center" },
  btn:     { backgroundColor: "#2563EB", borderRadius: 14, height: 52, width: "100%", justifyContent: "center", alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  skip:    { color: "#999", fontSize: 13 },
});

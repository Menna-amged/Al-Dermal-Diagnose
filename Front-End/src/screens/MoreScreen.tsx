import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";
import colors from "../config/colors";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  isPremiumFeature?: boolean;
};

export default function MoreScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isPremium, setIsPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("isPremium").then((v) => setIsPremium(v === "true"));
    }, [])
  );

  const premiumGate = (route: string, title: string, description: string) => {
    if (isPremium) { navigation.navigate(route); return; }
    Alert.alert(
      "Premium Feature",
      `${title}\n\n${description}\n\nUpgrade to Premium to unlock this feature.`,
      [
        { text: "Maybe Later", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate("Premium") },
      ],
    );
  };

  const items: MenuItem[] = [
    {
      icon: <Ionicons name="person-circle-outline" size={26} color="#fff" />,
      label: "My Profile",
      subtitle: "View and edit your personal information",
      color: "#2563EB",
      onPress: () => navigation.navigate("Profile"),
    },
    {
      icon: <Ionicons name="information-circle-outline" size={26} color="#fff" />,
      label: "Diseases Info",
      subtitle: "Learn about all 8 skin conditions & download reports",
      color: "#7C3AED",
      onPress: () => navigation.navigate("DiseasesInfo"),
    },
    {
      icon: <FontAwesome5 name="hospital-alt" size={22} color="#fff" />,
      label: "Hospitals & Clinics",
      subtitle: "Find dermatology centers near you",
      color: "#0EA371",
      isPremiumFeature: true,
      onPress: () =>
        premiumGate(
          "HospitalsClinics",
          "Hospitals & Clinics nearby",
          "Browse trusted dermatology centers across Egypt with one-tap Google Maps directions.",
        ),
    },
    {
      icon: <MaterialCommunityIcons name="weather-sunny-alert" size={26} color="#fff" />,
      label: "Weather Health Alerts",
      subtitle: "Personalized warnings based on today's weather",
      color: "#F59E0B",
      isPremiumFeature: true,
      onPress: () =>
        premiumGate(
          "WeatherAlerts",
          "Weather Health Alerts",
          "Get personalized warnings when UV, heat, humidity or dust may flare your skin condition.",
        ),
    },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>More</Text>

        {items.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={item.onPress}
            activeOpacity={0.82}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
              {item.icon}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{item.label}</Text>
                {item.isPremiumFeature && !isPremium && (
                  <View style={styles.proBadge}>
                    <MaterialCommunityIcons name="crown" size={11} color="#F59E0B" />
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => navigation.navigate("Premium")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="crown" size={22} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>Unlock Hospitals & Clinics and Weather Health Alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <NavBar navigation={navigation} activeTab="More" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 10 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: "#111", marginBottom: 20 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 },
  label:    { fontSize: 15, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 12, color: "#6B7280", lineHeight: 17 },

  proBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#FFFBEB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  proBadgeText: { fontSize: 9, fontWeight: "800", color: "#92400E", letterSpacing: 0.5 },

  upgradeCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#1D4ED8", borderRadius: 16, padding: 18, marginTop: 8,
    shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  upgradeTitle:    { color: "#fff", fontSize: 15, fontWeight: "800" },
  upgradeSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
});

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, Pressable, Image, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";

export default function MoreScreen({ navigation, setIsLoggedIn }: any) {
  const insets = useSafeAreaInsets();
  const [isPremium, setIsPremium] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [photo,     setPhoto]     = useState<string | null>(null);
  const [gateModal, setGateModal] = useState<{ title: string; description: string; route: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiGet(["isPremium", "firstName", "lastName", "user_photo"]).then(([p, fn, ln, ph]) => {
        setIsPremium(p[1] === "true");
        setFirstName(fn[1] ?? "");
        setLastName(ln[1] ?? "");
        setPhoto(ph[1] || null);
      });
    }, [])
  );

  const [logoutModal, setLogoutModal] = useState(false);

  const doLogout = async () => {
    await AsyncStorage.multiRemove(["token", "userType", "firstName", "lastName", "user_profile", "user_tokens", "user_photo"]);
    setIsLoggedIn(false);
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) doLogout();
    } else {
      setLogoutModal(true);
    }
  };

  const premiumGate = (route: string, title: string, description: string) => {
    if (isPremium) { navigation.navigate(route); return; }
    setGateModal({ title, description, route });
  };

  const features = [
    {
      icon: <Ionicons name="body-outline" size={26} color="#fff" />,
      label: "Diseases Info",
      subtitle: "All 8 skin conditions explained",
      color: "#7C3AED",
      onPress: () => navigation.navigate("DiseasesInfo"),
    },
    {
      icon: <FontAwesome5 name="hospital-alt" size={22} color="#fff" />,
      label: "Hospitals & Clinics",
      subtitle: "Find dermatology centers near you",
      color: "#059669",
      isPremium: true,
      onPress: () => premiumGate("HospitalsClinics", "Hospitals & Clinics nearby", "Browse trusted dermatology centers across Egypt with one-tap Google Maps directions."),
    },
    {
      icon: <MaterialCommunityIcons name="weather-sunny-alert" size={26} color="#fff" />,
      label: "Weather Alerts",
      subtitle: "UV & humidity skin warnings",
      color: "#D97706",
      isPremium: true,
      onPress: () => premiumGate("WeatherAlerts", "Weather Health Alerts", "Get personalized warnings when UV, heat, humidity or dust may flare your skin condition."),
    },
  ];

  const general = [
    { icon: "help-circle-outline" as const,  label: "Help & Support", route: "HelpSupport" },
    { icon: "information-outline" as const,   label: "About",          route: "About" },
    { icon: "shield-outline" as const,        label: "Privacy Policy", route: "Privacy" },
    { icon: "chatbox-outline" as const,       label: "Feedback",       route: "Feedback" },
  ];

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "?";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Account label + Profile card ── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate("Profile")} activeOpacity={0.85}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarImage} onError={() => setPhoto(null)} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{fullName || "My Profile"}</Text>
            <Text style={styles.profileSub}>View & edit your account</Text>
          </View>
          <View style={[styles.planBadge, isPremium ? styles.planBadgePro : styles.planBadgeFree]}>
            {isPremium && <MaterialCommunityIcons name="crown" size={11} color="#D97706" />}
            <Text style={[styles.planBadgeText, { color: isPremium ? "#92400E" : "#2563EB" }]}>
              {isPremium ? "PRO" : "FREE"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* ── Features ── */}
        <Text style={styles.sectionLabel}>FEATURES</Text>
        <View style={styles.featureGrid}>
          {features.map((f, i) => (
            <TouchableOpacity key={i} style={[styles.featureCard, { borderTopColor: f.color }]} onPress={f.onPress} activeOpacity={0.8}>
              <View style={[styles.featureIconCircle, { backgroundColor: f.color }]}>
                {f.icon}
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
              {f.isPremium && !isPremium && (
                <View style={styles.proBadge}>
                  <MaterialCommunityIcons name="crown" size={9} color="#D97706" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Upgrade banner ── */}
        {!isPremium && (
          <TouchableOpacity style={styles.upgradeCard} onPress={() => navigation.navigate("Premium")} activeOpacity={0.88}>
            <MaterialCommunityIcons name="crown" size={28} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSub}>Unlock clinics, weather alerts & more</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* ── General links ── */}
        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.generalCard}>
          {general.map((g, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.generalRow, i < general.length - 1 && styles.generalDivider]}
              onPress={() => navigation.navigate(g.route)}
              activeOpacity={0.7}
            >
              <Ionicons name={g.icon} size={19} color="#6B7280" />
              <Text style={styles.generalLabel}>{g.label}</Text>
              <Ionicons name="chevron-forward" size={15} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <NavBar navigation={navigation} activeTab="More" />

      {/* ── Logout confirmation modal ── */}
      <Modal visible={logoutModal} transparent animationType="fade" onRequestClose={() => setLogoutModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLogoutModal(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 28 }]} onPress={() => {}}>
            <View style={styles.logoutIconWrap}>
              <MaterialCommunityIcons name="logout" size={28} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: "#111827" }]}>Logout</Text>
            <Text style={[styles.modalDesc, { marginBottom: 24 }]}>Are you sure you want to logout?</Text>
            <TouchableOpacity style={styles.logoutConfirmBtn} onPress={doLogout} activeOpacity={0.88}>
              <Text style={styles.logoutConfirmText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalDismissBtn} onPress={() => setLogoutModal(false)} activeOpacity={0.7}>
              <Text style={styles.modalDismissText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Premium gate modal ── */}
      <Modal visible={!!gateModal} transparent animationType="fade" onRequestClose={() => setGateModal(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setGateModal(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>

            {/* Crown icon */}
            <View style={styles.modalIconWrap}>
              <View style={styles.modalIconOuter}>
                <View style={styles.modalIconInner}>
                  <MaterialCommunityIcons name="crown" size={32} color="#F59E0B" />
                </View>
              </View>
            </View>

            {/* Text */}
            <Text style={styles.modalTitle}>{gateModal?.title}</Text>
            <Text style={styles.modalDesc}>{gateModal?.description}</Text>

            {/* Perks */}
            <View style={styles.perksBox}>
              {[
                { icon: "map-marker-outline", text: "Hospitals & Clinics near you" },
                { icon: "weather-sunny-alert", text: "Personalized UV & weather alerts" },
                { icon: "crown-outline",       text: "Priority doctor access" },
              ].map((p, i) => (
                <View key={i} style={styles.perkRow}>
                  <View style={styles.perkDot}>
                    <MaterialCommunityIcons name={p.icon as any} size={14} color="#D97706" />
                  </View>
                  <Text style={styles.perkText}>{p.text}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.modalUpgradeBtn}
              activeOpacity={0.88}
              onPress={() => { setGateModal(null); navigation.navigate("Premium"); }}
            >
              <MaterialCommunityIcons name="crown" size={16} color="#fff" />
              <Text style={styles.modalUpgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalDismissBtn} onPress={() => setGateModal(null)} activeOpacity={0.7}>
              <Text style={styles.modalDismissText}>Maybe Later</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: "#F3F4F6" },
  scroll:    { flex: 1 },
  container: { padding: 20 },

  /* Profile card */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#2563EB",
    alignItems: "center", justifyContent: "center",
  },
  avatarText:  { fontSize: 20, fontWeight: "800", color: "#fff" },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  profileName:  { fontSize: 16, fontWeight: "700", color: "#111827" },
  profileSub:   { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  planBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  planBadgePro:  { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A" },
  planBadgeFree: { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
  planBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  /* Section label */
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#9CA3AF",
    letterSpacing: 1.2, marginBottom: 10, marginLeft: 2,
  },

  /* Feature grid — 3 equal columns */
  featureGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderTopWidth: 3,
    alignItems: "flex-start",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  featureLabel:    { fontSize: 13, fontWeight: "700", color: "#111827" },
  featureSubtitle: { fontSize: 11, color: "#6B7280", lineHeight: 15 },
  proBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  proBadgeText: { fontSize: 9, fontWeight: "800", color: "#92400E" },

  /* Upgrade banner */
  upgradeCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#1D4ED8", borderRadius: 20, padding: 20,
    marginBottom: 28,
    shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  upgradeTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  upgradeSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  /* General links */
  generalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  generalRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  generalDivider: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  generalLabel:   { flex: 1, fontSize: 14, fontWeight: "500", color: "#374151" },

  /* Premium gate modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 36,
    alignItems: "center",
  },
  modalIconWrap: { marginBottom: 20, marginTop: 4 },
  modalIconOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#FFFBEB",
    alignItems: "center", justifyContent: "center",
  },
  modalIconInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#FEF3C7",
    alignItems: "center", justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20, fontWeight: "800", color: "#111827",
    textAlign: "center", marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14, color: "#6B7280", textAlign: "center",
    lineHeight: 21, marginBottom: 20,
  },
  perksBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  perkRow:  { flexDirection: "row", alignItems: "center", gap: 12 },
  perkDot:  {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#FFFBEB",
    alignItems: "center", justifyContent: "center",
  },
  perkText: { fontSize: 14, color: "#374151", fontWeight: "500", flex: 1 },
  modalUpgradeBtn: {
    width: "100%", flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: "#1D4ED8", borderRadius: 50,
    paddingVertical: 16, marginBottom: 12,
    shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  modalUpgradeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalDismissBtn: { paddingVertical: 8 },
  modalDismissText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },

  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FEF2F2", borderRadius: 16, paddingVertical: 16, marginTop: 16, marginBottom: 4 },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
  logoutIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  logoutConfirmBtn: { width: "100%", backgroundColor: "#EF4444", borderRadius: 50, paddingVertical: 15, alignItems: "center", marginBottom: 12 },
  logoutConfirmText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

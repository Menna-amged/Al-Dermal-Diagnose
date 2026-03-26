import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";

const accountSettings = [
  { id: 1, label: "Edit Profile", icon: <MaterialCommunityIcons name="account-edit-outline" size={22} color="#2563EB" /> },
  { id: 2, label: "Change Password", icon: <MaterialCommunityIcons name="sync" size={22} color="#2563EB" /> },
  { id: 3, label: "Location", icon: <Ionicons name="location-outline" size={22} color="#2563EB" /> },
];

const legalSupport = [
  { id: 1, label: "Terms & Conditions", icon: <MaterialCommunityIcons name="file-document-outline" size={22} color="#2563EB" /> },
  { id: 2, label: "Privacy Policy", icon: <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#2563EB" /> },
  { id: 3, label: "Helps & Support", icon: <MaterialCommunityIcons name="help-circle-outline" size={22} color="#2563EB" /> },
];

function SettingsGroup({ items }: { items: typeof accountSettings }) {
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <View key={item.id}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              {item.icon}
              <Text style={styles.rowLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          {index < items.length - 1 && <View style={styles.rowDivider} />}
        </View>
      ))}
    </View>
  );
}

export default function ProfileScreen({ navigation, setIsLoggedIn }: any) {
  const insets = useSafeAreaInsets();

  const doLogout = async () => {
    await AsyncStorage.multiRemove(["token", "isPremium", "firstName"]);
    setIsLoggedIn(false);
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) doLogout();
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout },
      ]);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#D1D5DB" />
          </View>
        </View>
        <Text style={styles.sectionLabel}>ACCOUNT SETTING</Text>
        <SettingsGroup items={accountSettings} />
        <Text style={styles.sectionLabel}>LEGAL & SUPPORT</Text>
        <SettingsGroup items={legalSupport} />

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <NavBar navigation={navigation} activeTab="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  avatarContainer: { alignItems: "center", marginBottom: 28 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" },
  sectionLabel: { fontSize: 12, fontWeight: "600", color: "#9CA3AF", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  group: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  rowLabel: { fontSize: 15, fontWeight: "500", color: "#111" },
  rowDivider: { height: 1, backgroundColor: "#F3F4F6" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FEF2F2", borderRadius: 16, paddingVertical: 16, marginTop: 4 },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
});

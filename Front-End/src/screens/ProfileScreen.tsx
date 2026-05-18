import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../config/colors";

const accountSettings = [
  { id: 1, label: "Edit Profile",    route: "EditProfile", icon: <MaterialCommunityIcons name="account-edit-outline" size={22} color="#2563EB" /> },
  { id: 2, label: "Change Password", route: "ChangePassword", icon: <MaterialCommunityIcons name="sync" size={22} color="#2563EB" /> },
  { id: 3, label: "Location",        route: "Location", icon: <Ionicons name="location-outline" size={22} color="#2563EB" /> },
];

const legalSupport = [
  { id: 1, label: "Terms & Conditions", route: "Terms",       icon: <MaterialCommunityIcons name="file-document-outline" size={22} color="#2563EB" /> },
  { id: 2, label: "Privacy Policy",     route: "Privacy",     icon: <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#2563EB" /> },
  { id: 3, label: "Helps & Support",    route: "HelpSupport", icon: <MaterialCommunityIcons name="help-circle-outline" size={22} color="#2563EB" /> },
  { id: 4, label: "Feedback",           route: "Feedback",    icon: <Ionicons name="chatbox-outline" size={22} color="#2563EB" /> },
  { id: 5, label: "About",              route: "About",       icon: <Ionicons name="information-circle-outline" size={22} color="#2563EB" /> },
];

function SettingsGroup({ items, navigation }: { items: typeof accountSettings; navigation?: any }) {
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <View key={item.id}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => item.route && navigation?.navigate(item.route)}
          >
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

function WalletCard({ tokens, navigation }: { tokens: number; navigation?: any }) {
  return (
    <View style={styles.walletCard}>
      <View style={styles.walletLeft}>
        <View style={styles.walletIconCircle}>
          <MaterialCommunityIcons name="wallet-outline" size={20} color="#2563EB" />
        </View>
        <View>
          <Text style={styles.walletLabel}>My tokens</Text>
          <Text style={styles.walletValue}>{tokens} tokens</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.buyBtn} activeOpacity={0.8} onPress={() => navigation?.navigate("BuyTokens")}>
        <Text style={styles.buyBtnText}>Buy tokens</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen({ navigation, setIsLoggedIn }: any) {
  const insets = useSafeAreaInsets();
  const [name, setName]     = useState("");
  const [lastName, setLastName] = useState("");
  const [photo, setPhoto]   = useState<string | null>(null);
  const [tokens, setTokens] = useState(0);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("user_profile").then((data) => {
        if (data) {
          const profile = JSON.parse(data);
          setName(profile.name ?? "");
          setLastName(profile.lastName ?? "");
          setPhoto(profile.photo ?? null);
        }
      });
      AsyncStorage.getItem("user_tokens").then((val) => {
        setTokens(val ? parseInt(val) : 5);
      });
    }, [])
  );

  const doLogout = async () => {
    await AsyncStorage.multiRemove(["token", "userType", "firstName", "user_profile", "user_tokens"]);
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
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          {photo && photo.length > 0 ? (
            <Image source={{ uri: photo }} style={styles.avatarImage} onError={() => setPhoto(null)} />
          ) : (
            <View style={styles.avatarDefault}>
              <MaterialCommunityIcons name="account" size={70} color="#fff" />
            </View>
          )}
          {(name || lastName) ? (
            <Text style={styles.profileName}>{name} {lastName}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT SETTING</Text>
        <SettingsGroup items={accountSettings} navigation={navigation} />

        <Text style={styles.sectionLabel}>MY WALLET</Text>
        <WalletCard tokens={tokens} navigation={navigation} />

        <Text style={styles.sectionLabel}>LEGAL & SUPPORT</Text>
        <SettingsGroup items={legalSupport} navigation={navigation} />

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
  avatarDefault: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.gray, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  profileName: { marginTop: 10, fontSize: 16, fontWeight: "600", color: "#111" },
  sectionLabel: { fontSize: 12, fontWeight: "600", color: "#9CA3AF", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  group: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  rowLabel: { fontSize: 15, fontWeight: "500", color: "#111" },
  rowDivider: { height: 1, backgroundColor: "#F3F4F6" },
  walletCard: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  walletLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  walletIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  walletLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
  walletValue: { fontSize: 16, fontWeight: "700", color: "#111" },
  buyBtn: { backgroundColor: "#2563EB", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  buyBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FEF2F2", borderRadius: 16, paddingVertical: 16, marginTop: 4 },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
});

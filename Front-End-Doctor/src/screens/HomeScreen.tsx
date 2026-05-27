import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../config/colors";

export default function HomeScreen({ onLogout }: { onLogout?: () => void }) {
  const doLogout = async () => {
    await AsyncStorage.multiRemove(["token", "userType", "firstName", "isPremium"]);
    onLogout?.();
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // Alert.alert buttons don't fire reliably on react-native-web → use native confirm.
      if (typeof window !== "undefined" && window.confirm("Are you sure you want to logout?")) {
        doLogout();
      }
      return;
    }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: doLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Al-Dermal Diagnose</Text>
        <Text style={styles.subtitle}>Patient Portal</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#0156F1" },
  subtitle: { fontSize: 14, color: "#6B7280" },
  logoutBtn: {
    margin: 24,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#DC2626" },
});

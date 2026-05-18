import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PACKAGES = [
  { id: "p1", tokens: 1,  price: "100 EGP" },
  { id: "p2", tokens: 3,  price: "249 EGP", perToken: "83 EGP / Consultation"},
  { id: "p3", tokens: 5, price: "400 EGP ", perToken: "80 EGP / Consultation" },
];

export default function BuyTokensScreen({ navigation }: any) {
  const [selected, setSelected] = useState("p2");
  const [loading, setLoading]   = useState(false);

  const handleBuy = async () => {
    const pkg = PACKAGES.find((p) => p.id === selected)!;
    Alert.alert(
      "Confirm Purchase",
      `Add ${pkg.tokens} tokens for ${pkg.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              const val = await AsyncStorage.getItem("user_tokens");
              const current = val ? parseInt(val) : 0;
              const newBalance = current + pkg.tokens;
              await AsyncStorage.setItem("user_tokens", String(newBalance));
              Alert.alert(
                "Success! 🎉",
                `${pkg.tokens} tokens added. Your balance is now ${newBalance} tokens.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch {
              Alert.alert("Error", "Something went wrong, please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Tokens</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="wallet-outline" size={28} color="#2563EB" />
          <Text style={styles.infoTitle}>Consultation Tokens</Text>
          <Text style={styles.infoSub}>Each token lets you send 1 consultation to a doctor</Text>
        </View>

        {/* Packages */}
        <Text style={styles.sectionLabel}>CHOOSE A PACKAGE</Text>
        {PACKAGES.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.packageRow, selected === pkg.id && styles.packageRowSelected]}
            onPress={() => setSelected(pkg.id)}
            activeOpacity={0.8}
          >
            {/* Radio */}
            <View style={[styles.radio, selected === pkg.id && styles.radioSelected]}>
              {selected === pkg.id && <View style={styles.radioDot} />}
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={styles.packageTop}>
                <Text style={styles.packageTokens}>{pkg.tokens} tokens</Text>
                {pkg.best && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>Best value</Text>
                  </View>
                )}
              </View>
              <Text style={styles.packagePerToken}>{pkg.perToken} per token</Text>
            </View>

            {/* Price */}
            <Text style={[styles.packagePrice, selected === pkg.id && styles.packagePriceSelected]}>
              {pkg.price}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Buy button */}
        <TouchableOpacity
          style={[styles.buyBtn, loading && { opacity: 0.6 }]}
          onPress={handleBuy}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buyBtnText}>
            {loading ? "Processing..." : `Buy ${PACKAGES.find(p => p.id === selected)?.tokens} tokens`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Payment integration coming soon. Tokens are added instantly for now.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  // info box
  infoBox: { backgroundColor: "#EFF6FF", borderRadius: 16, padding: 20, alignItems: "center", gap: 6, marginBottom: 24 },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#1D4ED8" },
  infoSub: { fontSize: 13, color: "#3B82F6", textAlign: "center" },

  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1, marginBottom: 12 },

  // package rows
  packageRow: { backgroundColor: "#fff", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10, borderWidth: 1.5, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  packageRowSelected: { borderColor: "#2563EB", backgroundColor: "#F8FBFF" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: "#2563EB" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2563EB" },
  packageTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  packageTokens: { fontSize: 15, fontWeight: "700", color: "#111" },
  bestBadge: { backgroundColor: "#2563EB", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  bestBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  packagePerToken: { fontSize: 12, color: "#9CA3AF" },
  packagePrice: { fontSize: 16, fontWeight: "700", color: "#6B7280" },
  packagePriceSelected: { color: "#2563EB" },

  // buy button
  buyBtn: { backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8, marginBottom: 12 },
  buyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  note: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
});
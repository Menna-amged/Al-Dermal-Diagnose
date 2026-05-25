import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Package = {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  perToken: number;
  label?: string;
  labelColor?: string;
  highlight: boolean;
};

const PACKAGES: Package[] = [
  {
    id: "p1",
    tokens: 1,
    price: 100,
    perToken: 100,
    highlight: false,
  },
  {
    id: "p2",
    tokens: 3,
    price: 249,
    originalPrice: 300,
    perToken: 83,
    label: "POPULAR",
    labelColor: "#2563EB",
    highlight: true,
  },
  {
    id: "p3",
    tokens: 5,
    price: 400,
    originalPrice: 500,
    perToken: 80,
    label: "BEST VALUE",
    labelColor: "#16A34A",
    highlight: false,
  },
];

const FEATURES = [
  { icon: "stethoscope", text: "1 token = 1 doctor consultation" },
  { icon: "clock-fast",  text: "Doctor replies within 24 hours" },
  { icon: "shield-check", text: "Verified dermatology specialists" },
  { icon: "chat-processing-outline", text: "Full chat access after consulting" },
];

export default function BuyTokensScreen({ navigation }: any) {
  const [selected, setSelected]   = useState("p2");
  const [balance, setBalance]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("user_tokens").then((val) => {
        setBalance(val ? Math.max(0, parseInt(val)) : 0);
      });
      setSuccess(false);
    }, [])
  );

  const selectedPkg = PACKAGES.find((p) => p.id === selected)!;

  const handleBuy = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // simulated payment
      const newBalance = balance + selectedPkg.tokens;
      await AsyncStorage.setItem("user_tokens", String(newBalance));
      setBalance(newBalance);
      setSuccess(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        <View style={styles.successScreen}>
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check-circle" size={72} color="#16A34A" />
          </View>
          <Text style={styles.successTitle}>Tokens Added!</Text>
          <Text style={styles.successSub}>
            {selectedPkg.tokens} token{selectedPkg.tokens > 1 ? "s" : ""} have been added to your wallet.
          </Text>
          <View style={styles.successBalanceBox}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#2563EB" />
            <Text style={styles.successBalanceText}>New balance: <Text style={{ fontWeight: "800" }}>{balance} tokens</Text></Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Tokens</Text>
        <View style={styles.balancePill}>
          <MaterialCommunityIcons name="wallet-outline" size={13} color="#2563EB" />
          <Text style={styles.balancePillText}>{balance}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconCircle}>
            <MaterialCommunityIcons name="hospital-building" size={32} color="#2563EB" />
          </View>
          <Text style={styles.heroTitle}>Consult a Specialist</Text>
          <Text style={styles.heroSub}>
            Tokens let you connect directly with verified dermatology doctors — no subscription needed.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <MaterialCommunityIcons name={f.icon as any} size={18} color="#2563EB" />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Packages */}
        <Text style={styles.sectionLabel}>CHOOSE A PACKAGE</Text>

        {PACKAGES.map((pkg) => {
          const isSelected = selected === pkg.id;
          const saving = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.card, isSelected && styles.cardSelected, pkg.highlight && !isSelected && styles.cardHighlight]}
              onPress={() => setSelected(pkg.id)}
              activeOpacity={0.85}
            >
              {/* Badge */}
              {pkg.label && (
                <View style={[styles.badge, { backgroundColor: pkg.labelColor }]}>
                  <Text style={styles.badgeText}>{pkg.label}</Text>
                </View>
              )}

              <View style={styles.cardInner}>
                {/* Left: tokens */}
                <View style={styles.cardLeft}>
                  <View style={[styles.tokenCircle, isSelected && styles.tokenCircleSelected]}>
                    <Text style={[styles.tokenCount, isSelected && styles.tokenCountSelected]}>{pkg.tokens}</Text>
                    <Text style={[styles.tokenWord, isSelected && styles.tokenWordSelected]}>token{pkg.tokens > 1 ? "s" : ""}</Text>
                  </View>
                </View>

                {/* Middle: details */}
                <View style={styles.cardMiddle}>
                  <Text style={styles.perTokenText}>{pkg.perToken} EGP / consultation</Text>
                  {saving > 0 && (
                    <View style={styles.savingBadge}>
                      <Text style={styles.savingText}>Save {saving} EGP</Text>
                    </View>
                  )}
                </View>

                {/* Right: price + radio */}
                <View style={styles.cardRight}>
                  {pkg.originalPrice && (
                    <Text style={styles.originalPrice}>{pkg.originalPrice} EGP</Text>
                  )}
                  <Text style={[styles.price, isSelected && styles.priceSelected]}>{pkg.price} EGP</Text>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package</Text>
            <Text style={styles.summaryValue}>{selectedPkg.tokens} token{selectedPkg.tokens > 1 ? "s" : ""}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per token</Text>
            <Text style={styles.summaryValue}>{selectedPkg.perToken} EGP</Text>
          </View>
          {selectedPkg.originalPrice && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>You save</Text>
              <Text style={[styles.summaryValue, { color: "#16A34A" }]}>{selectedPkg.originalPrice - selectedPkg.price} EGP</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{selectedPkg.price} EGP</Text>
          </View>
        </View>

        {/* Buy button */}
        <TouchableOpacity
          style={[styles.buyBtn, loading && { opacity: 0.7 }]}
          onPress={handleBuy}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color="#fff" />
              <Text style={styles.buyBtnText}>Pay {selectedPkg.price} EGP</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Payment gateway integration coming soon. Tokens are credited instantly for demo.
        </Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F3F4F6" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  balancePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  balancePillText: { fontSize: 13, fontWeight: "700", color: "#2563EB" },

  content: { paddingHorizontal: 16, paddingTop: 4 },

  // Hero
  hero: { backgroundColor: "#fff", borderRadius: 20, padding: 22, alignItems: "center", gap: 8, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  heroIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  heroSub: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20 },

  // Features
  featuresRow: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 20, gap: 10, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 13, color: "#374151" },

  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1, marginBottom: 10 },

  // Cards
  card: { backgroundColor: "#fff", borderRadius: 18, marginBottom: 12, borderWidth: 2, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, overflow: "hidden" },
  cardSelected: { borderColor: "#2563EB", backgroundColor: "#F8FBFF" },
  cardHighlight: { borderColor: "#BFDBFE" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderBottomRightRadius: 12 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },

  cardLeft: {},
  tokenCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  tokenCircleSelected: { backgroundColor: "#2563EB" },
  tokenCount: { fontSize: 22, fontWeight: "800", color: "#111" },
  tokenCountSelected: { color: "#fff" },
  tokenWord: { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
  tokenWordSelected: { color: "rgba(255,255,255,0.8)" },

  cardMiddle: { flex: 1, gap: 6 },
  perTokenText: { fontSize: 13, color: "#6B7280" },
  savingBadge: { alignSelf: "flex-start", backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  savingText: { fontSize: 11, fontWeight: "700", color: "#16A34A" },

  cardRight: { alignItems: "flex-end", gap: 4 },
  originalPrice: { fontSize: 12, color: "#D1D5DB", textDecorationLine: "line-through" },
  price: { fontSize: 18, fontWeight: "800", color: "#111" },
  priceSelected: { color: "#2563EB" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center", marginTop: 4 },
  radioSelected: { borderColor: "#2563EB" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2563EB" },

  // Summary
  summary: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, gap: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 13, color: "#9CA3AF" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#111" },
  summaryTotal: { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 10, marginTop: 2 },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#111" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#2563EB" },

  // Buy button
  buyBtn: { backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12, shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  buyBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  note: { fontSize: 12, color: "#9CA3AF", textAlign: "center", lineHeight: 18 },

  // Success screen
  successScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 14 },
  successCircle: { marginBottom: 8 },
  successTitle: { fontSize: 26, fontWeight: "800", color: "#111" },
  successSub: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  successBalanceBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EFF6FF", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, marginTop: 8 },
  successBalanceText: { fontSize: 15, color: "#2563EB" },
  doneBtn: { width: "100%", backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 16, shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  doneBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});

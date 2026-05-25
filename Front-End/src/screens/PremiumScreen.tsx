import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { patientApi } from "../config/api";

const FREE_FEATURES = [
  { icon: "camera-outline",           label: "4 AI skin scans",                       included: true },
  { icon: "document-text-outline",    label: "Diagnosis report",                       included: true },
  { icon: "chatbubble-ellipses-outline", label: "AI Chatbot access",                  included: true },
  { icon: "information-circle-outline", label: "Basic skin condition info",            included: true },
  { icon: "people-outline",           label: "Community tips & articles",              included: true },
  { icon: "infinite-outline",         label: "Unlimited scans",                        included: false },
  { icon: "medkit-outline",           label: "Doctor consultations",                   included: false },
  { icon: "wallet-outline",           label: "Starter tokens",                         included: false },
  { icon: "star-outline",             label: "Priority doctor matching",               included: false },
];

const PREMIUM_FEATURES = [
  { icon: "infinite-outline",         label: "Unlimited AI skin scans",                included: true },
  { icon: "document-text-outline",    label: "Detailed diagnosis reports",             included: true },
  { icon: "chatbubble-ellipses-outline", label: "AI Chatbot access",                  included: true },
  { icon: "information-circle-outline", label: "Full skin condition library",          included: true },
  { icon: "people-outline",           label: "Community tips & articles",              included: true },
  { icon: "medkit-outline",           label: "Doctor consultations via tokens",        included: true },
  { icon: "wallet-outline",           label: "3 starter tokens (300 EGP value)",       included: true },
  { icon: "star-outline",             label: "Priority doctor matching",               included: true },
  { icon: "shield-checkmark-outline", label: "Verified specialist access",             included: true },
];

export default function PremiumScreen({ navigation }: any) {
  const [isPremium, setIsPremium]   = useState(false);
  const [scansLeft, setScansLeft]   = useState(4);
  const [tokens, setTokens]         = useState(0);
  const [upgrading, setUpgrading]   = useState(false);
  const [activeTab, setActiveTab]   = useState<"free" | "premium">("premium");

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        AsyncStorage.getItem("isPremium"),
        AsyncStorage.getItem("user_tokens"),
        AsyncStorage.getItem("scans_used"),
      ]).then(([premium, tok, scans]) => {
        setIsPremium(premium === "true");
        setTokens(tok ? Math.max(0, parseInt(tok)) : 0);
        const used = scans ? parseInt(scans) : 0;
        setScansLeft(Math.max(0, 4 - used));
      });
    }, [])
  );

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await patientApi.patch("/users/me/upgrade");
      const newTokens = tokens + 3;
      await Promise.all([
        AsyncStorage.setItem("isPremium", "true"),
        AsyncStorage.setItem("user_tokens", String(newTokens)),
      ]);
      setIsPremium(true);
      setTokens(newTokens);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "Could not upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const features = activeTab === "free" ? FREE_FEATURES : PREMIUM_FEATURES;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="crown" size={34} color="#F59E0B" />
          </View>
          <Text style={styles.heroTitle}>
            {isPremium ? "You're on Premium" : "Upgrade to Premium"}
          </Text>
          <Text style={styles.heroSub}>
            {isPremium
              ? "Enjoy unlimited scans and direct doctor access."
              : "Get unlimited scans and consult real doctors."}
          </Text>

          {isPremium && (
            <View style={styles.premiumActiveBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.premiumActiveText}>Premium Active</Text>
            </View>
          )}
        </View>

        {/* Current status row */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <MaterialCommunityIcons name="camera-outline" size={20} color={isPremium ? "#2563EB" : "#9CA3AF"} />
            <Text style={styles.statusValue}>{isPremium ? "∞" : scansLeft}</Text>
            <Text style={styles.statusLabel}>Scans left</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusCard}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#2563EB" />
            <Text style={styles.statusValue}>{tokens}</Text>
            <Text style={styles.statusLabel}>Tokens</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusCard}>
            <MaterialCommunityIcons name={isPremium ? "crown" : "account-outline"} size={20} color={isPremium ? "#F59E0B" : "#9CA3AF"} />
            <Text style={styles.statusValue}>{isPremium ? "Pro" : "Free"}</Text>
            <Text style={styles.statusLabel}>Plan</Text>
          </View>
        </View>

        {/* Plan toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "free" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("free")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeTab === "free" && styles.toggleTextActive]}>Free</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "premium" && styles.toggleBtnActivePremium]}
            onPress={() => setActiveTab("premium")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="crown" size={13} color={activeTab === "premium" ? "#F59E0B" : "#9CA3AF"} />
            <Text style={[styles.toggleText, activeTab === "premium" && styles.toggleTextPremium]}>Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Features card */}
        <View style={[styles.featuresCard, activeTab === "premium" && styles.featuresCardPremium]}>
          {activeTab === "premium" && (
            <View style={styles.premiumCardHeader}>
              <MaterialCommunityIcons name="crown" size={16} color="#F59E0B" />
              <Text style={styles.premiumCardHeaderText}>Everything in Free, plus:</Text>
            </View>
          )}
          {features.map((f, i) => (
            <View key={i} style={[styles.featureRow, i < features.length - 1 && styles.featureRowBorder]}>
              <View style={[styles.featureIconCircle, f.included ? styles.featureIconIncluded : styles.featureIconExcluded]}>
                <Ionicons
                  name={f.included ? "checkmark" : "close"}
                  size={13}
                  color={f.included ? "#16A34A" : "#9CA3AF"}
                />
              </View>
              <Text style={[styles.featureLabel, !f.included && styles.featureLabelExcluded]}>
                {f.label}
              </Text>
              <Ionicons
                name={(f.icon as any)}
                size={16}
                color={f.included ? "#2563EB" : "#D1D5DB"}
              />
            </View>
          ))}
        </View>

        {/* Premium price card */}
        {activeTab === "premium" && !isPremium && (
          <View style={styles.priceCard}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceAmount}>500 <Text style={styles.priceCurrency}>EGP</Text></Text>
              <Text style={styles.pricePeriod}>per month</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRight}>
              <View style={styles.bonusRow}>
                <MaterialCommunityIcons name="wallet-plus-outline" size={16} color="#16A34A" />
                <Text style={styles.bonusText}>+ 3 free tokens</Text>
              </View>
              <Text style={styles.bonusSub}>worth 300 EGP</Text>
            </View>
          </View>
        )}

        {/* CTA */}
        {!isPremium ? (
          activeTab === "premium" ? (
            <TouchableOpacity
              style={[styles.upgradeBtn, upgrading && { opacity: 0.7 }]}
              onPress={handleUpgrade}
              disabled={upgrading}
              activeOpacity={0.85}
            >
              {upgrading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="crown" size={20} color="#F59E0B" />
                  <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setActiveTab("premium")}
              activeOpacity={0.85}
            >
              <Text style={styles.switchBtnText}>See Premium Plan</Text>
              <Ionicons name="arrow-forward" size={16} color="#2563EB" />
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.activeBox}>
            <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
            <Text style={styles.activeBoxText}>You're enjoying all Premium benefits</Text>
          </View>
        )}

        {!isPremium && (
          <TouchableOpacity onPress={() => navigation.navigate("BuyTokens")} style={styles.tokenLink}>
            <MaterialCommunityIcons name="wallet-outline" size={14} color="#2563EB" />
            <Text style={styles.tokenLinkText}>Just want tokens? Buy without subscribing</Text>
            <Ionicons name="chevron-forward" size={13} color="#2563EB" />
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content: { paddingHorizontal: 16, paddingTop: 4 },

  // Hero
  hero: { backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", gap: 8, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  heroIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
  heroSub: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20 },
  premiumActiveBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#DCFCE7", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  premiumActiveText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },

  // Status row
  statusRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statusCard: { flex: 1, alignItems: "center", gap: 4 },
  statusValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  statusLabel: { fontSize: 11, color: "#9CA3AF" },
  statusDivider: { width: 1, backgroundColor: "#F3F4F6" },

  // Toggle
  toggle: { flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 14, padding: 4, marginBottom: 14 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  toggleBtnActivePremium: { backgroundColor: "#1E3A5F", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
  toggleTextActive: { color: "#111" },
  toggleTextPremium: { color: "#fff" },

  // Features card
  featuresCard: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  featuresCardPremium: { borderWidth: 1.5, borderColor: "#BFDBFE" },
  premiumCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  premiumCardHeaderText: { fontSize: 13, fontWeight: "700", color: "#111" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11 },
  featureRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  featureIconCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureIconIncluded: { backgroundColor: "#DCFCE7" },
  featureIconExcluded: { backgroundColor: "#F3F4F6" },
  featureLabel: { flex: 1, fontSize: 14, color: "#111" },
  featureLabelExcluded: { color: "#9CA3AF" },

  // Price card
  priceCard: { flexDirection: "row", backgroundColor: "#1E3A5F", borderRadius: 18, padding: 20, marginBottom: 14, alignItems: "center" },
  priceLeft: { flex: 1 },
  priceAmount: { fontSize: 32, fontWeight: "800", color: "#fff" },
  priceCurrency: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  pricePeriod: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  priceDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.15)", marginHorizontal: 16 },
  priceRight: { alignItems: "flex-start" },
  bonusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bonusText: { fontSize: 14, fontWeight: "700", color: "#4ADE80" },
  bonusSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  // Upgrade button
  upgradeBtn: { backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14, shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  upgradeBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  switchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#EFF6FF", borderRadius: 16, paddingVertical: 15, marginBottom: 14 },
  switchBtnText: { fontSize: 15, fontWeight: "700", color: "#2563EB" },

  activeBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#F0FDF4", borderRadius: 16, paddingVertical: 16, marginBottom: 14 },
  activeBoxText: { fontSize: 14, fontWeight: "600", color: "#16A34A" },

  tokenLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  tokenLinkText: { fontSize: 13, color: "#2563EB", fontWeight: "500" },
});

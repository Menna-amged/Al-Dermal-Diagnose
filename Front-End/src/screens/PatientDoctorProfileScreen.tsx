import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { patientApi } from "../config/api";
import colors from "../config/colors";

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={14} color={i <= stars ? "#F59E0B" : "#E5E7EB"} />
      ))}
    </View>
  );
}

export default function PatientDoctorProfileScreen({ route, navigation }: any) {
  const { doctor } = route.params;
  const [isPremium, setIsPremium]       = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [upgrading, setUpgrading]       = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("isPremium"),
      AsyncStorage.getItem("user_tokens"),
    ]).then(([premium, tokens]) => {
      setIsPremium(premium === "true" || premium === JSON.stringify(true));
      setTokenBalance(tokens ? parseInt(tokens) : 0);
    });
  }, []);

  const handleUpgradeWithToken = () => {
    Alert.alert(
      "Use Token",
      `Use 1 token to upgrade to Premium?\n\nYour balance: ${tokenBalance} token${tokenBalance !== 1 ? "s" : ""}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use Token",
          onPress: async () => {
            setUpgrading(true);
            try {
              await patientApi.patch("/users/me/upgrade");
              const newBalance = tokenBalance - 1;
              await Promise.all([
                AsyncStorage.setItem("isPremium", JSON.stringify(true)),
                AsyncStorage.setItem("user_tokens", String(newBalance)),
              ]);
              setTokenBalance(newBalance);
              setIsPremium(true);
            } catch (e: any) {
              Alert.alert("Error", e?.response?.data?.error || "Could not upgrade. Please try again.");
            } finally {
              setUpgrading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpgradePress = () => {
    if (tokenBalance > 0) {
      handleUpgradeWithToken();
    } else {
      navigation.navigate("BuyTokens");
    }
  };

  const initials = doctor.name.replace("Dr. ", "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleEmailContact = () => {
    Linking.openURL(`mailto:${doctor.email}`).catch(() =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.heroSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.docName}>{doctor.name}</Text>
          {doctor.specialty ? (
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{doctor.specialty}</Text>
            </View>
          ) : null}
          {doctor.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text style={styles.locationText}>{doctor.location}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.rating > 0 ? doctor.rating.toFixed(1) : "—"}</Text>
            <StarRating rating={doctor.rating} />
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.cases}</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {doctor.clinicName ? (
            <InfoRow icon="business-outline" label="Clinic / Hospital" value={doctor.clinicName} />
          ) : null}
          {doctor.bio ? (
            <InfoRow icon="document-text-outline" label="About" value={doctor.bio} last />
          ) : null}
        </View>

        {/* Contact via email */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail-outline" size={18} color={colors.main} />
            <Text style={styles.contactTitle}>Contact Doctor</Text>
          </View>

          {isPremium ? (
            <TouchableOpacity style={styles.emailBtn} onPress={handleEmailContact} activeOpacity={0.85}>
              <Ionicons name="mail" size={18} color="#fff" />
              <Text style={styles.emailBtnText}>Send Email</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lockedBox}>
              <Ionicons name="lock-closed" size={28} color="#D1D5DB" style={{ marginBottom: 8 }} />
              <Text style={styles.lockedTitle}>Premium Required</Text>
              <Text style={styles.lockedSub}>
                Upgrade to Premium to contact doctors directly via email.
              </Text>
              <TouchableOpacity
                style={[styles.upgradeBtn, upgrading && { opacity: 0.7 }]}
                onPress={handleUpgradePress}
                disabled={upgrading}
                activeOpacity={0.85}
              >
                {upgrading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="star" size={15} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.upgradeBtnText}>
                      {tokenBalance > 0 ? `Upgrade with Token (${tokenBalance} left)` : "Upgrade to Premium"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={styles.buyRow}>
                <Text style={styles.buyRowText}>Don't have tokens?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("BuyTokens")} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                  <Text style={styles.buyLink}> Buy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoLabelRow}>
        <Ionicons name={icon} size={15} color={colors.main} style={{ marginRight: 6 }} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },

  content: { padding: 16 },

  heroSection: { alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 24, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", marginBottom: 12, shadowColor: colors.main, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 6 },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#fff" },
  docName: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 6 },
  specialtyBadge: { backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 6 },
  specialtyText: { fontSize: 13, color: colors.main, fontWeight: "600" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13, color: "#9CA3AF" },

  statsRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, paddingVertical: 18, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#E5E7EB" },

  infoCard: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  infoRow: { padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  infoLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  infoLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6 },
  infoValue: { fontSize: 14, color: "#374151", lineHeight: 20 },

  contactCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  contactHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  contactTitle: { fontSize: 15, fontWeight: "700", color: "#111" },

  emailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.main, borderRadius: 14, paddingVertical: 14 },
  emailBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  lockedBox: { alignItems: "center", paddingVertical: 16 },
  lockedTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginBottom: 6 },
  lockedSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 19, marginBottom: 16, paddingHorizontal: 8 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F59E0B", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22, minWidth: 220 },
  upgradeBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  buyRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  buyRowText: { fontSize: 13, color: "#9CA3AF" },
  buyLink: { fontSize: 13, color: colors.main, fontWeight: "700" },
});

import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Modal, Pressable, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { patientApi, HOST } from "../config/api";
import colors from "../config/colors";

type RecentCase = { condition: string; date: string; risk: string; status: string };

const RISK_COLORS: Record<string, string> = {
  LOW: "#16A34A", MEDIUM: "#D97706", HIGH: "#DC2626", CRITICAL: "#7C3AED",
};

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={14} color={i <= stars ? "#F59E0B" : "#E5E7EB"} />
      ))}
    </View>
  );
}

export default function ConsultDoctorProfileScreen({ route, navigation }: any) {
  const { doctor, imageUri, disease, confidence, tokens: initialTokens } = route.params;

  const [tokens, setTokens]             = useState<number>(initialTokens ?? 0);
  const [limitedTokens, setLimitedTokens] = useState<number>(0);
  const [recentCases, setRecentCases]   = useState<RecentCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [sending, setSending]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [showDiagnosisConfirm, setShowDiagnosisConfirm] = useState(false);
  const [sendError, setSendError]       = useState("");
  const [noTokensModal, setNoTokensModal] = useState(false);

  const initials = doctor.name.replace(/^Dr\.?\s*/i, "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // Always read fresh token balance when screen is focused
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("user_tokens").then((val) => {
        const n = val ? parseInt(val) : 0;
        setTokens(n < 0 ? 0 : n);
      });
      patientApi.get("/users/me").then(({ data }) => {
        setLimitedTokens(data.limitedTokens ?? 0);
      }).catch(() => {});
    }, [])
  );

  useEffect(() => {
    patientApi.get(`/users/doctors/${doctor.id}/cases`)
      .then(({ data }) => setRecentCases(data))
      .catch(() => setRecentCases([]))
      .finally(() => setCasesLoading(false));
  }, []);

  const handleConsult = () => {
    if (tokens < 1) {
      setNoTokensModal(true);
      return;
    }
    setSendError("");
    setShowConfirm(true);
  };

  const doConsult = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendError("");
    try {
      // Upload the skin image first using fetch (avoids axios Content-Type default conflict)
      let skinImageUrl: string | null = null;
      if (imageUri) {
        try {
          const token = await AsyncStorage.getItem("token");
          const formData = new FormData();
          if (Platform.OS === "web") {
            const blobRes = await fetch(imageUri);
            const blob = await blobRes.blob();
            formData.append("image", blob, "skin.jpg");
          } else {
            formData.append("image", { uri: imageUri, type: "image/jpeg", name: "skin.jpg" } as any);
          }
          const uploadRes = await fetch(`http://${HOST}:5000/consultations/upload-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (uploadRes.ok) {
            const uploaded = await uploadRes.json();
            skinImageUrl = uploaded.url ?? null;
          }
        } catch {
          // Non-fatal — proceed without image
        }
      }

      const { data: consultation } = await patientApi.post("/consultations", {
        doctorId: doctor.id,
        disease,
        confidence,
        skinImageUrl,
      });

      try {
        const { data: tokenData } = await patientApi.post("/users/me/tokens/spend");
        await AsyncStorage.setItem("user_tokens", String(tokenData.tokens));
      } catch {
        await AsyncStorage.setItem("user_tokens", String(tokens - 1));
      }

      navigation.navigate("ConsultationSent", {
        consultation: { ...consultation, doctorName: doctor.name },
      });
    } catch (err: any) {
      setSendError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const doConsultDiagnosis = async () => {
    setShowDiagnosisConfirm(false);
    setSending(true);
    setSendError("");
    try {
      let skinImageUrl: string | null = null;
      if (imageUri) {
        try {
          const token = await AsyncStorage.getItem("token");
          const formData = new FormData();
          if (Platform.OS === "web") {
            const blobRes = await fetch(imageUri);
            const blob = await blobRes.blob();
            formData.append("image", blob, "skin.jpg");
          } else {
            formData.append("image", { uri: imageUri, type: "image/jpeg", name: "skin.jpg" } as any);
          }
          const uploadRes = await fetch(`http://${HOST}:5000/consultations/upload-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (uploadRes.ok) {
            const uploaded = await uploadRes.json();
            skinImageUrl = uploaded.url ?? null;
          }
        } catch {}
      }

      const { data: consultation } = await patientApi.post("/consultations", {
        doctorId: doctor.id,
        disease,
        confidence,
        skinImageUrl,
        isDiagnosisOnly: true,
      });

      try {
        const { data: tokenData } = await patientApi.post("/users/me/tokens/spend-limited");
        setLimitedTokens(tokenData.limitedTokens);
      } catch {
        setLimitedTokens((prev) => Math.max(0, prev - 1));
      }

      navigation.navigate("ConsultationSent", {
        consultation: { ...consultation, doctorName: doctor.name },
      });
    } catch (err: any) {
      setSendError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "Dr"}</Text>
          </View>
          <Text style={styles.docName}>{doctor.name || "Doctor"}</Text>
          {doctor.specialty ? (
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{doctor.specialty}</Text>
            </View>
          ) : null}
          {doctor.clinicName ? (
            <View style={styles.clinicRow}>
              <Ionicons name="business-outline" size={13} color="#9CA3AF" />
              <Text style={styles.clinicText}>{doctor.clinicName}</Text>
            </View>
          ) : null}
          {doctor.location ? (
            <View style={styles.clinicRow}>
              <Ionicons name="location-outline" size={13} color="#9CA3AF" />
              <Text style={styles.clinicText}>{doctor.location}</Text>
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
            <Text style={styles.statLabel}>Total Cases</Text>
          </View>
        </View>

        {/* Bio */}
        {doctor.bio ? (
          <View style={styles.infoCard}>
            <View style={styles.infoHeaderRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.main} />
              <Text style={styles.infoHeader}>About</Text>
            </View>
            <Text style={styles.bioText}>{doctor.bio}</Text>
          </View>
        ) : null}

        {/* Recent Work */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <MaterialCommunityIcons name="stethoscope" size={16} color={colors.main} />
            <Text style={styles.infoHeader}>Recent Cases</Text>
          </View>
          {casesLoading ? (
            <ActivityIndicator size="small" color={colors.main} style={{ paddingVertical: 16 }} />
          ) : recentCases.length === 0 ? (
            <Text style={styles.noCasesText}>No cases recorded yet.</Text>
          ) : (
            recentCases.map((c, i) => (
              <View key={i} style={[styles.caseRow, i < recentCases.length - 1 && styles.caseRowBorder]}>
                <View style={styles.caseLeft}>
                  <Text style={styles.caseCondition}>{c.condition}</Text>
                  <Text style={styles.caseDate}>
                    {new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: (RISK_COLORS[c.risk] ?? "#6B7280") + "18" }]}>
                  <Text style={[styles.riskText, { color: RISK_COLORS[c.risk] ?? "#6B7280" }]}>{c.risk}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        {sendError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
            <Text style={styles.errorText}>{sendError}</Text>
          </View>
        ) : null}
        {limitedTokens > 0 && (
          <TouchableOpacity
            style={[styles.diagnosisBtn, sending && { opacity: 0.6 }]}
            onPress={() => setShowDiagnosisConfirm(true)}
            disabled={sending}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="stethoscope" size={17} color={colors.main} />
            <Text style={styles.diagnosisBtnText}>Request Diagnosis Only ({limitedTokens} token{limitedTokens > 1 ? "s" : ""})</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.consultBtn, sending && { opacity: 0.6 }]}
          onPress={handleConsult}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.consultBtnText}>Consult this Doctor</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* No-tokens modal */}
      <Modal visible={noTokensModal} transparent animationType="fade" onRequestClose={() => setNoTokensModal(false)}>
        <Pressable style={styles.backdrop} onPress={() => setNoTokensModal(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.ntIconOuter}>
              <View style={styles.ntIconInner}>
                <MaterialCommunityIcons name="wallet-outline" size={30} color="#2563EB" />
              </View>
            </View>
            <Text style={styles.ntTitle}>No Tokens Left</Text>
            <Text style={styles.ntDesc}>
              You have{" "}
              <Text style={{ fontWeight: "700", color: "#2563EB" }}>0 tokens</Text>
              . You need at least 1 token to consult a doctor.
            </Text>
            <View style={styles.ntInfoBox}>
              <MaterialCommunityIcons name="information-outline" size={14} color="#D97706" />
              <Text style={styles.ntInfoText}>Each consultation costs 1 token. Tokens never expire.</Text>
            </View>
            <TouchableOpacity
              style={styles.ntBuyBtn}
              activeOpacity={0.88}
              onPress={() => { setNoTokensModal(false); navigation.navigate("BuyTokens"); }}
            >
              <MaterialCommunityIcons name="cart-outline" size={17} color="#fff" />
              <Text style={styles.ntBuyText}>Buy Tokens</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 8 }} onPress={() => setNoTokensModal(false)}>
              <Text style={{ fontSize: 14, color: "#9CA3AF", fontWeight: "500" }}>Maybe Later</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmation modal */}
      <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalAvatar}>
              <Text style={styles.modalAvatarText}>{initials || "Dr"}</Text>
            </View>
            <Text style={styles.modalTitle}>Consult this doctor?</Text>
            <Text style={styles.modalSub}>
              <Text style={styles.modalDoctorName}>{doctor.name}</Text>
              {" "}will review your case and get back to you.
            </Text>
            <View style={styles.modalDivider} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={doConsult} activeOpacity={0.85}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Consult</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Diagnosis-only confirmation modal */}
      <Modal visible={showDiagnosisConfirm} transparent animationType="fade" onRequestClose={() => setShowDiagnosisConfirm(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalAvatar, { backgroundColor: "#7C3AED" }]}>
              <MaterialCommunityIcons name="stethoscope" size={28} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Diagnosis Only</Text>
            <Text style={styles.modalSub}>
              <Text style={styles.modalDoctorName}>{doctor.name}</Text>
              {" "}will review your AI result and submit a final diagnosis directly.{"\n"}
              <Text style={{ color: "#7C3AED", fontWeight: "600" }}>No chat — just a direct diagnosis.</Text>
            </Text>
            <View style={[styles.modalDivider, { marginBottom: 12 }]} />
            <View style={[styles.modalDivider, { height: "auto", backgroundColor: "#F0F4FF", borderRadius: 10, padding: 10, marginBottom: 16 }]}>
              <Text style={{ fontSize: 12, color: "#4B5563", textAlign: "center", lineHeight: 18 }}>
                Uses 1 diagnosis token. These are granted when a doctor declines your request.
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDiagnosisConfirm(false)} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: "#7C3AED" }]} onPress={doConsultDiagnosis} activeOpacity={0.85}>
                <MaterialCommunityIcons name="stethoscope" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  content: { padding: 16 },

  heroCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 24, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, gap: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", marginBottom: 6, shadowColor: colors.main, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 6 },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#fff" },
  docName: { fontSize: 20, fontWeight: "700", color: "#111" },
  specialtyBadge: { backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  specialtyText: { fontSize: 12, color: colors.main, fontWeight: "600" },
  clinicRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  clinicText: { fontSize: 12, color: "#9CA3AF" },

  statsRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, paddingVertical: 18, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#E5E7EB" },

  infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  infoHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  infoHeader: { fontSize: 14, fontWeight: "700", color: "#111" },
  bioText: { fontSize: 14, color: "#374151", lineHeight: 21 },
  noCasesText: { fontSize: 13, color: "#9CA3AF", paddingVertical: 8 },

  caseRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  caseRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  caseLeft: { gap: 2 },
  caseCondition: { fontSize: 14, fontWeight: "600", color: "#111" },
  caseDate: { fontSize: 11, color: "#9CA3AF" },
  riskBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  riskText: { fontSize: 11, fontWeight: "700" },

  footer: { backgroundColor: "#fff", padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 10, marginBottom: 10 },
  errorText: { flex: 1, fontSize: 13, color: "#DC2626" },
  diagnosisBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13, marginBottom: 10, borderWidth: 1.5, borderColor: colors.main, backgroundColor: "#EEF2FF" },
  diagnosisBtnText: { color: colors.main, fontSize: 14, fontWeight: "700" },
  consultBtn: { backgroundColor: colors.main, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  consultBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // No-tokens bottom sheet
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  bottomSheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 36, alignItems: "center" },
  ntIconOuter: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  ntIconInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#BFDBFE", alignItems: "center", justifyContent: "center" },
  ntTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8 },
  ntDesc: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  ntInfoBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFBEB", borderRadius: 12, padding: 12, width: "100%", marginBottom: 24 },
  ntInfoText: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18 },
  ntBuyBtn: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1D4ED8", borderRadius: 50, paddingVertical: 16, marginBottom: 12, shadowColor: "#2563EB", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  ntBuyText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Confirmation modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 32 },
  modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 380, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 },
  modalAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", marginBottom: 16, shadowColor: colors.main, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6 },
  modalAvatarText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 8 },
  modalSub: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 21, marginBottom: 20 },
  modalDoctorName: { fontWeight: "700", color: "#111" },
  modalDivider: { height: 1, backgroundColor: "#F3F4F6", width: "100%", marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F4F6" },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  confirmBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.main },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

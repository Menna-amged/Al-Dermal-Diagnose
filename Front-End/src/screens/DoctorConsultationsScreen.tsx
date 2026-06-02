import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar, Modal, TextInput, ScrollView, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { patientApi } from "../config/api";
import colors from "../config/colors";
import BottomTabBar from "../components/layout/BottomTabBar";

type Consultation = {
  id: string;
  disease: string;
  confidence: number;
  status: "PENDING" | "OPEN" | "CLOSED";
  createdAt: string;
  denyReason?: string;
  skinImageUrl?: string | null;
  isDiagnosisOnly?: boolean;
  patient: { user: { firstName: string; lastName: string; email: string } };
};

const DENY_PRESETS = [
  "Your AI diagnosis looks accurate — no follow-up is needed at this time.",
  "This condition is outside my specialty. Please consult a relevant specialist.",
  "Based on the scan, please visit a clinic in person for a physical examination.",
  "Insufficient information to proceed — please submit clearer images.",
  "I am currently unavailable. Please try again later or consult another doctor.",
];

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:        { label: "Pending",        color: "#D97706", bg: "#FFFBEB" },
  DIAGNOSIS_ONLY: { label: "Diagnosis Only", color: "#7C3AED", bg: "#F5F3FF" },
  OPEN:           { label: "Active",         color: "#16A34A", bg: "#F0FDF4" },
  CLOSED:         { label: "Closed",         color: "#9CA3AF", bg: "#F3F4F6" },
  DENIED:         { label: "Declined",       color: "#DC2626", bg: "#FEF2F2" },
};

export default function DoctorConsultationsScreen({ navigation }: any) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);

  // Deny modal state
  const [denyModal, setDenyModal]         = useState(false);
  const [denyTarget, setDenyTarget]       = useState<Consultation | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customReason, setCustomReason]   = useState("");
  const [denying, setDenying]             = useState(false);

  // Accept state
  const [accepting, setAccepting]         = useState<string | null>(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await patientApi.get("/consultations");
      setConsultations(data as Consultation[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setAccepting(id);
    try {
      await patientApi.patch(`/consultations/${id}/accept`);
      setConsultations((prev) => prev.map((c) => c.id === id ? { ...c, status: "OPEN" } : c));
    } catch {}
    setAccepting(null);
  };

  const openDenyModal = (item: Consultation) => {
    setDenyTarget(item);
    setSelectedPreset(null);
    setCustomReason("");
    setDenyModal(true);
  };

  const handleDeny = async () => {
    if (!denyTarget) return;
    const reason = customReason.trim() || selectedPreset || "";
    setDenying(true);
    try {
      await patientApi.patch(`/consultations/${denyTarget.id}/deny`, { reason });
      setConsultations((prev) => prev.map((c) => c.id === denyTarget.id ? { ...c, status: "CLOSED", denyReason: reason } : c));
      setDenyModal(false);
    } catch {}
    setDenying(false);
  };

  const pending = consultations.filter((c) => c.status === "PENDING");
  const active  = consultations.filter((c) => c.status === "OPEN");
  const closed  = consultations.filter((c) => c.status === "CLOSED");

  const renderCard = (item: Consultation) => {
    const { user } = item.patient;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Patient";
    const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const statusKey = item.status === "CLOSED" && item.denyReason
      ? "DENIED"
      : item.status === "PENDING" && item.isDiagnosisOnly
      ? "DIAGNOSIS_ONLY"
      : item.status;
    const st = STATUS_LABEL[statusKey] ?? STATUS_LABEL.CLOSED;
    const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.patientName}>{name}</Text>
              <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>
            <Text style={styles.disease}>{item.disease}</Text>
            {item.confidence > 0 && (
              <Text style={styles.conf}>{Math.round(item.confidence)}% confidence · {date}</Text>
            )}
            {item.denyReason ? (
              <View style={styles.reasonBox}>
                <Ionicons name="information-circle-outline" size={13} color="#DC2626" />
                <Text style={styles.reasonText} numberOfLines={2}>{item.denyReason}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Skin photo */}
        {item.skinImageUrl ? (
          <Image source={{ uri: item.skinImageUrl }} style={styles.skinPhoto} resizeMode="cover" />
        ) : null}

        {/* Action buttons */}
        {item.status === "PENDING" && item.isDiagnosisOnly && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.diagnosisOnlyBtn]}
            onPress={() => navigation.navigate("FinalDiagnosis", {
              patient: { condition: item.disease, confidence: item.confidence },
              consultationId: item.id,
            })}
          >
            <Ionicons name="document-text-outline" size={16} color="#fff" />
            <Text style={styles.diagnosisOnlyBtnText}>Submit Diagnosis</Text>
          </TouchableOpacity>
        )}
        {item.status === "PENDING" && !item.isDiagnosisOnly && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.denyBtn]}
              onPress={() => openDenyModal(item)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.denyBtnText}>Deny</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleAccept(item.id)}
              disabled={accepting === item.id}
            >
              {accepting === item.id
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}
        {item.status === "OPEN" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={() => navigation.navigate("DoctorChat", {
              consultationId: item.id,
              patientName: name,
              patientInitials: initials,
              disease: item.disease,
            })}
          >
            <Ionicons name="chatbubbles-outline" size={16} color="#fff" />
            <Text style={styles.chatBtnText}>Open Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consultations</Text>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.main} /></View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color="#E5E7EB" />
          <Text style={styles.errorText}>Could not load consultations</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {pending.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.sectionTitle}>Pending Requests ({pending.length})</Text>
              </View>
              {pending.map(renderCard)}
            </>
          )}
          {active.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: "#16A34A" }]} />
                <Text style={styles.sectionTitle}>Active Chats ({active.length})</Text>
              </View>
              {active.map(renderCard)}
            </>
          )}
          {closed.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: closed.some((c) => c.denyReason) ? "#DC2626" : "#9CA3AF" }]} />
                <Text style={styles.sectionTitle}>Closed ({closed.length})</Text>
              </View>
              {closed.map(renderCard)}
            </>
          )}
          {consultations.length === 0 && (
            <View style={styles.centered}>
              <Ionicons name="chatbubbles-outline" size={56} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No consultations yet</Text>
              <Text style={styles.emptySub}>Patients who request consultations will appear here.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <BottomTabBar activeTab="Consults" />

      {/* Deny Modal */}
      <Modal visible={denyModal} transparent animationType="slide" onRequestClose={() => setDenyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Deny Consultation</Text>
            <Text style={styles.modalSub}>
              Select a reason or write your own. The patient will be notified and their token will be refunded.
            </Text>

            <Text style={styles.modalSection}>Quick Reasons</Text>
            {DENY_PRESETS.map((preset, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.presetRow, selectedPreset === preset && styles.presetRowActive]}
                onPress={() => { setSelectedPreset(preset); setCustomReason(""); }}
              >
                <View style={[styles.presetRadio, selectedPreset === preset && styles.presetRadioActive]}>
                  {selectedPreset === preset && <View style={styles.presetRadioDot} />}
                </View>
                <Text style={[styles.presetText, selectedPreset === preset && styles.presetTextActive]}>
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.modalSection}>Custom Reason (optional)</Text>
            <TextInput
              style={styles.customInput}
              value={customReason}
              onChangeText={(t) => { setCustomReason(t); setSelectedPreset(null); }}
              placeholder="Write your own reason…"
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={300}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDenyModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDenyBtn, denying && { opacity: 0.6 }]}
                onPress={handleDeny}
                disabled={denying || (!selectedPreset && !customReason.trim())}
              >
                {denying
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.confirmDenyBtnText}>Send &amp; Refund Token</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: "#F3F4F6" },
  header:      { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#111" },
  list:        { padding: 16, gap: 6, paddingBottom: 32 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 8 },
  sectionDot:  { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 },
  card:        { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardTop:     { flexDirection: "row", gap: 12, marginBottom: 12 },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText:  { color: "#fff", fontSize: 15, fontWeight: "700" },
  rowBetween:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  patientName: { fontSize: 14, fontWeight: "700", color: "#111" },
  disease:     { fontSize: 13, color: colors.main, fontWeight: "600", marginBottom: 2 },
  conf:        { fontSize: 11, color: "#9CA3AF" },
  statusPill:  { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText:  { fontSize: 11, fontWeight: "700" },
  reasonBox:   { flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 6, backgroundColor: "#F9FAFB", borderRadius: 8, padding: 8 },
  reasonText:  { fontSize: 11, color: "#6B7280", flex: 1, lineHeight: 16 },
  skinPhoto:   { width: "100%", height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: "#E5E7EB" },
  actions:     { flexDirection: "row", gap: 10 },
  actionBtn:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  denyBtn:     { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
  denyBtnText: { fontSize: 14, fontWeight: "700", color: "#DC2626" },
  acceptBtn:   { backgroundColor: colors.main },
  acceptBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  chatBtn:            { backgroundColor: "#16A34A", flex: 0, paddingHorizontal: 20 },
  chatBtnText:        { fontSize: 14, fontWeight: "700", color: "#fff" },
  diagnosisOnlyBtn:   { backgroundColor: "#7C3AED", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  diagnosisOnlyBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  centered:    { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
  errorText:   { fontSize: 14, color: "#6B7280" },
  retryBtn:    { backgroundColor: colors.main, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:   { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyTitle:  { fontSize: 16, fontWeight: "700", color: "#9CA3AF" },
  emptySub:    { fontSize: 13, color: "#C4C4C4", textAlign: "center" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet:   { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: "85%" },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  modalTitle:   { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 6 },
  modalSub:     { fontSize: 13, color: "#6B7280", lineHeight: 20, marginBottom: 16 },
  modalSection: { fontSize: 12, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  presetRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 8 },
  presetRowActive: { borderColor: colors.main, backgroundColor: "#EEF2FF" },
  presetRadio:  { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  presetRadioActive: { borderColor: colors.main },
  presetRadioDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.main },
  presetText:   { fontSize: 13, color: "#374151", flex: 1, lineHeight: 18 },
  presetTextActive: { color: colors.main, fontWeight: "600" },
  customInput:  { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 12, fontSize: 14, color: "#111", minHeight: 72, textAlignVertical: "top", marginTop: 4, marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn:    { flex: 1, paddingVertical: 14, borderRadius: 50, alignItems: "center", backgroundColor: "#F3F4F6" },
  cancelBtnText: { fontSize: 15, fontWeight: "700", color: "#374151" },
  confirmDenyBtn: { flex: 2, paddingVertical: 14, borderRadius: 50, alignItems: "center", backgroundColor: "#DC2626" },
  confirmDenyBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});

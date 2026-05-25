import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../config/api";
import colors from "../config/colors";
import BottomTabBar from "../components/layout/BottomTabBar";

type Consultation = {
  id: string;
  disease: string;
  confidence: number;
  status: string;
  createdAt: string;
  patient: { user: { firstName: string; lastName: string } };
  messages: { text: string; senderRole: string; createdAt: string }[];
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#F59E0B",
  OPEN: "#16A34A",
  CLOSED: "#9CA3AF",
};

export default function ConsultationsScreen({ navigation }: any) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);

  const fetchConsultations = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/consultations");
      setConsultations(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const acceptConsultation = async (id: string) => {
    try {
      await api.patch(`/consultations/${id}/accept`);
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "OPEN" } : c))
      );
    } catch {
      Alert.alert("Error", "Could not accept consultation. Please try again.");
    }
  };

  const denyConsultation = async (id: string) => {
    Alert.alert("Decline Consultation", "Are you sure you want to decline this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline", style: "destructive",
        onPress: async () => {
          try {
            await api.patch(`/consultations/${id}/deny`);
            setConsultations((prev) => prev.filter((c) => c.id !== id));
          } catch {
            Alert.alert("Error", "Could not decline consultation.");
          }
        },
      },
    ]);
  };

  useFocusEffect(useCallback(() => { fetchConsultations(); }, []));

  const renderItem = ({ item }: { item: Consultation }) => {
    const patientName = `${item.patient?.user?.firstName ?? ""} ${item.patient?.user?.lastName ?? ""}`.trim() || "Patient";
    const lastMsg     = item.messages?.[0];
    const hasUnread   = lastMsg && lastMsg.senderRole === "PATIENT";
    const statusColor = STATUS_COLOR[item.status] ?? "#9CA3AF";
    const isPending   = item.status === "PENDING";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("DoctorChat", {
          consultationId: item.id,
          patientName,
          disease: item.disease,
        })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {patientName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </Text>
          </View>
          <View style={styles.diseasePill}>
            <Text style={styles.diseaseText}>{item.disease}</Text>
            <Text style={styles.confidenceText}> · {item.confidence}%</Text>
          </View>
          {isPending ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={(e) => { e.stopPropagation?.(); acceptConsultation(item.id); }}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.denyBtn}
                onPress={(e) => { e.stopPropagation?.(); denyConsultation(item.id); }}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                <Text style={styles.denyBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardBottomRow}>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {lastMsg ? lastMsg.text : "No messages yet — tap to reply"}
              </Text>
              {hasUnread && <View style={styles.unreadDot} />}
            </View>
          )}
        </View>

        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consultations</Text>
        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{consultations.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.main} />
          <Text style={styles.loadingText}>Loading consultations…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={48} color="#E5E7EB" />
          <Text style={styles.errorText}>Could not load consultations</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchConsultations}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={consultations}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="chatbubbles-outline" size={56} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No consultations yet</Text>
              <Text style={styles.emptySub}>Patients will appear here when they consult you.</Text>
            </View>
          }
        />
      )}

      <BottomTabBar activeTab="Consultations" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: "#F3F4F6" },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#111" },
  countBadge: { backgroundColor: colors.main, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  list: { padding: 16, gap: 10 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },

  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cardBody: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patientName: { fontSize: 15, fontWeight: "700", color: "#111" },
  timeText: { fontSize: 11, color: "#9CA3AF" },
  diseasePill: { flexDirection: "row", alignItems: "center" },
  diseaseText: { fontSize: 12, color: colors.main, fontWeight: "600" },
  confidenceText: { fontSize: 12, color: "#9CA3AF" },
  cardBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lastMsg: { fontSize: 12, color: "#9CA3AF", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.main },
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },

  loadingText: { fontSize: 14, color: "#9CA3AF" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#9CA3AF" },
  emptySub: { fontSize: 13, color: "#C4C4C4", textAlign: "center" },
  errorText: { fontSize: 15, fontWeight: "600", color: "#111" },
  retryBtn: { backgroundColor: colors.main, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: "#fff", fontWeight: "600" },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  acceptBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#16A34A", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  acceptBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  denyBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEE2E2", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  denyBtnText: { color: "#DC2626", fontSize: 12, fontWeight: "700" },
});

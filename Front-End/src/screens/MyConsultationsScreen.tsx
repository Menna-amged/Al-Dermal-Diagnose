import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { patientApi } from "../config/api";
import colors from "../config/colors";
import NavBar from "../components/NavBar";

type Consultation = {
  id: string;
  disease: string;
  status: string;
  createdAt: string;
  denyReason?: string | null;
  isDiagnosisOnly?: boolean;
  doctor: { user: { firstName: string; lastName: string } };
  messages: { text: string; createdAt: string }[];
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:         "#F59E0B",
  DIAGNOSIS_ONLY:  "#7C3AED",
  OPEN:            "#16A34A",
  CLOSED:          "#9CA3AF",
  DECLINED:        "#DC2626",
};

export default function MyConsultationsScreen({ navigation }: any) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);

  const fetchConsultations = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await patientApi.get("/consultations");
      setConsultations(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchConsultations(); }, []));

  const renderItem = ({ item }: { item: Consultation }) => {
    const firstName = item.doctor?.user?.firstName ?? "";
    const lastName  = item.doctor?.user?.lastName  ?? "";
    const doctorName = `Dr. ${firstName} ${lastName}`.trim();
    const initials = (firstName[0] ?? "") + (lastName[0] ?? "") || "Dr";
    const lastMsg = item.messages?.[0];
    const isDenied       = item.status === "CLOSED" && !!item.denyReason;
    const isDiagOnly     = item.status === "PENDING" && !!item.isDiagnosisOnly;
    const statusKey      = isDenied ? "DECLINED" : isDiagOnly ? "DIAGNOSIS_ONLY" : item.status;
    const statusColor    = STATUS_COLOR[statusKey] ?? "#9CA3AF";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Chat", {
          consultationId: item.id,
          doctorName,
          disease: item.disease,
        })}
      >
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </Text>
          </View>
          <Text style={styles.disease}>{item.disease}</Text>
          <View style={styles.cardBottomRow}>
            <Text style={[styles.lastMsg, isDenied && { color: "#DC2626", fontWeight: "600" }, isDiagOnly && { color: "#7C3AED", fontWeight: "600" }, item.status === "OPEN" && !lastMsg && { color: "#16A34A", fontWeight: "600" }]} numberOfLines={1}>
              {isDenied
                ? "Request declined by doctor"
                : isDiagOnly
                ? "Awaiting doctor's diagnosis — no chat"
                : item.status === "OPEN" && !lastMsg
                ? "Chat accepted — say hello!"
                : lastMsg ? lastMsg.text : "No messages yet"}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Consultations</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.main} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="wifi-off" size={48} color="#E5E7EB" />
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
              <Text style={styles.emptySub}>Consult a doctor after your AI scan.</Text>
            </View>
          }
        />
      )}

      <NavBar navigation={navigation} activeTab="Chats" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },

  list: { padding: 16, gap: 10 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },

  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardLeft: {},
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.main, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cardBody: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  doctorName: { fontSize: 14, fontWeight: "700", color: "#111" },
  timeText: { fontSize: 11, color: "#9CA3AF" },
  disease: { fontSize: 12, color: colors.main, fontWeight: "600" },
  cardBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lastMsg: { fontSize: 12, color: "#9CA3AF", flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#9CA3AF" },
  emptySub: { fontSize: 13, color: "#C4C4C4", textAlign: "center" },
  errorText: { fontSize: 15, fontWeight: "600", color: "#111" },
  retryBtn: { backgroundColor: colors.main, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: "#fff", fontWeight: "600" },

});

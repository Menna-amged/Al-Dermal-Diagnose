import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { patientApi } from "../config/api";
import colors from "../config/colors";

type Doctor = {
  id: string; name: string; email: string; phone: string;
  location: string; specialty: string; clinicName: string;
  bio: string; rating: number; cases: number;
};

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={12} color={i <= stars ? "#F59E0B" : "#E5E7EB"} />
      ))}
    </View>
  );
}

function DoctorCard({ doc, onPress }: { doc: Doctor; onPress: () => void }) {
  const initials = doc.name.replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "Dr"}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.docName}>{doc.name || "Doctor"}</Text>
          {doc.clinicName ? (
            <View style={styles.clinicRow}>
              <Ionicons name="business-outline" size={12} color="#9CA3AF" />
              <Text style={styles.clinicText} numberOfLines={1}>{doc.clinicName}</Text>
            </View>
          ) : null}
          {doc.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#9CA3AF" />
              <Text style={styles.locationText}>{doc.location}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.ratingBox}>
          <Text style={styles.ratingNum}>{doc.rating > 0 ? doc.rating.toFixed(1) : "—"}</Text>
          <StarRating rating={doc.rating} />
          <Text style={styles.casesText}>{doc.cases} cases</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.viewText}>View Profile & Consult</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.main} />
      </View>
    </TouchableOpacity>
  );
}

export default function ConsultDoctorSelectScreen({ route, navigation }: any) {
  const { imageUri, disease, confidence, tokens } = route.params;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await patientApi.get("/users/doctors", {
        params: { specialty: disease },
      });
      setDoctors(data);
    } catch {
      setError("Could not load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [disease]);

  useEffect(() => { fetchDoctors(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose a Doctor</Text>
          <View style={styles.diseasePill}>
            <Text style={styles.diseasePillText}>{disease}</Text>
          </View>
        </View>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.main} />
          <Text style={styles.loadingText}>Finding specialists…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>🩺</Text>
          <Text style={styles.errorTitle}>Could not load doctors</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchDoctors}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(d) => d.id}
          renderItem={({ item }) => (
            <DoctorCard
              doc={item}
              onPress={() => navigation.navigate("ConsultDoctorProfile", { doctor: item, imageUri, disease, confidence, tokens })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>
              {doctors.length} specialist{doctors.length !== 1 ? "s" : ""} found · sorted by rating
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.errorEmoji}>👨‍⚕️</Text>
              <Text style={styles.errorTitle}>No specialists found</Text>
              <Text style={styles.errorSub}>No doctors are currently listed for {disease}.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerCenter: { alignItems: "center", gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  diseasePill: { backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  diseasePillText: { fontSize: 11, fontWeight: "700", color: colors.main },

  list: { padding: 16, paddingBottom: 32 },
  sectionLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500", marginBottom: 12 },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  info: { flex: 1, gap: 4 },
  docName: { fontSize: 15, fontWeight: "700", color: "#111" },
  clinicRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  clinicText: { fontSize: 12, color: "#6B7280", flex: 1 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 11, color: "#9CA3AF" },
  ratingBox: { alignItems: "flex-end", gap: 3 },
  ratingNum: { fontSize: 16, fontWeight: "800", color: "#111" },
  casesText: { fontSize: 11, color: "#9CA3AF" },

  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 10 },
  viewText: { fontSize: 13, color: colors.main, fontWeight: "600" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  loadingText: { fontSize: 14, color: "#9CA3AF" },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  errorSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
  retryBtn: { backgroundColor: colors.main, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: "#fff", fontWeight: "600" },
});

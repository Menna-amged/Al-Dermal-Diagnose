import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, StatusBar, ActivityIndicator, Modal, FlatList,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import NavBar from "../components/NavBar";
import api from "../config/api";

const GOVERNORATES = [
  "All", "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea",
  "Beheira", "Fayoum", "Gharbia", "Ismailia", "Menofia",
  "Minya", "Qalyubia", "New Valley", "Suez", "Aswan",
  "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharqia",
  "South Sinai", "Kafr El Sheikh", "Matrouh", "Luxor", "Qena",
  "North Sinai", "Sohag",
];

const DISEASES = [
  "All", "Acne & Rosacea", "Chickenpox", "Monkeypox",
  "Eczema", "Vitiligo", "Actinic Keratosis", "Skin Cancer", "Nail Fungus",
];

type Doctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialty: string;
  rating: number;
  cases: number;
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
  const initials = doc.name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.docName}>{doc.name}</Text>
          {doc.specialty ? (
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{doc.specialty}</Text>
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
      <View style={styles.viewProfile}>
        <Text style={styles.viewProfileText}>View Profile</Text>
        <Ionicons name="chevron-forward" size={14} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );
}

export default function DoctorScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [doctors, setDoctors]       = useState<Doctor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [query, setQuery]           = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedGov,     setSelectedGov]     = useState("All");
  const [selectedDisease, setSelectedDisease] = useState("All");
  const [pendingGov,      setPendingGov]      = useState("All");
  const [pendingDisease,  setPendingDisease]  = useState("All");

  const fetchDoctors = useCallback(async (gov: string, disease: string) => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (gov     !== "All") params.governorate = gov;
      if (disease !== "All") params.specialty   = disease;
      const { data } = await api.get("/users/doctors", { params });
      setDoctors(data);
    } catch {
      setError("Could not load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDoctors(selectedGov, selectedDisease); }, [fetchDoctors]));

  const applyFilter = () => {
    setSelectedGov(pendingGov);
    setSelectedDisease(pendingDisease);
    setShowFilter(false);
    fetchDoctors(pendingGov, pendingDisease);
  };

  const resetFilter = () => {
    setPendingGov("All");
    setPendingDisease("All");
  };

  const openFilter = () => {
    setPendingGov(selectedGov);
    setPendingDisease(selectedDisease);
    setShowFilter(true);
  };

  const filtered = doctors.filter((d) => {
    const q = query.toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
  });

  const hasFilter = selectedGov !== "All" || selectedDisease !== "All";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certified Dermatologists</Text>
        <TouchableOpacity style={[styles.filterBtn, hasFilter && styles.filterBtnActive]} onPress={openFilter}>
          <Ionicons name="options-outline" size={20} color={hasFilter ? "#fff" : "#2563EB"} />
          {hasFilter && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, specialty or city"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Active filter chips */}
      {hasFilter && (
        <View style={styles.chipsRow}>
          {selectedGov !== "All" && (
            <TouchableOpacity style={styles.chip} onPress={() => { setSelectedGov("All"); fetchDoctors("All", selectedDisease); }}>
              <Ionicons name="location" size={12} color="#2563EB" />
              <Text style={styles.chipText}>{selectedGov}</Text>
              <Ionicons name="close" size={12} color="#2563EB" />
            </TouchableOpacity>
          )}
          {selectedDisease !== "All" && (
            <TouchableOpacity style={styles.chip} onPress={() => { setSelectedDisease("All"); fetchDoctors(selectedGov, "All"); }}>
              <Ionicons name="medical" size={12} color="#2563EB" />
              <Text style={styles.chipText}>{selectedDisease}</Text>
              <Ionicons name="close" size={12} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Body */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading doctors…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>🩺</Text>
          <Text style={styles.errorTitle}>No doctors available right now</Text>
          <Text style={styles.errorSub}>Check back later or try adjusting your filters</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchDoctors(selectedGov, selectedDisease)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DoctorCard doc={item} onPress={() => navigation.navigate("PatientDoctorProfile", { doctor: item })} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {query ? `Results (${filtered.length})` : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} found`}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <FontAwesome5 name="user-md" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No doctors found</Text>
            </View>
          }
        />
      )}

      <NavBar navigation={navigation} activeTab="Doctor" />

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Doctors</Text>
            <TouchableOpacity onPress={resetFilter}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Governorate */}
          <Text style={styles.filterLabel}>GOVERNORATE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {GOVERNORATES.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionPill, pendingGov === g && styles.optionPillActive]}
                onPress={() => setPendingGov(g)}
              >
                <Text style={[styles.optionText, pendingGov === g && styles.optionTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Disease / Specialty */}
          <Text style={styles.filterLabel}>SPECIALTY / DISEASE</Text>
          <View style={styles.pillsWrap}>
            {DISEASES.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.optionPill, pendingDisease === d && styles.optionPillActive]}
                onPress={() => setPendingDisease(d)}
              >
                <Text style={[styles.optionText, pendingDisease === d && styles.optionTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
            <Text style={styles.applyText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  filterBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  filterBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  filterDot: { position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 10, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: "#111" },

  chipsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 12, color: "#2563EB", fontWeight: "500" },

  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12, marginTop: 4 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 80 },
  loadingText: { fontSize: 14, color: "#9CA3AF" },
  errorEmoji: { fontSize: 48, marginBottom: 4 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#111", textAlign: "center" },
  errorSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 4 },
  errorText: { fontSize: 14, color: "#EF4444", textAlign: "center" },
  retryBtn: { backgroundColor: "#2563EB", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyText: { fontSize: 15, color: "#9CA3AF", marginTop: 8 },

  // Doctor card
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  info: { flex: 1, gap: 4 },
  docName: { fontSize: 15, fontWeight: "700", color: "#111" },
  specialtyBadge: { alignSelf: "flex-start", backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  specialtyText: { fontSize: 11, color: "#2563EB", fontWeight: "600" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 11, color: "#9CA3AF" },
  ratingBox: { alignItems: "flex-end", gap: 3 },
  ratingNum: { fontSize: 16, fontWeight: "800", color: "#111" },
  casesText: { fontSize: 11, color: "#9CA3AF" },

  viewProfile: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 12, gap: 3 },
  viewProfileText: { fontSize: 13, color: "#2563EB", fontWeight: "600" },

  // Filter modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  resetText: { fontSize: 14, color: "#EF4444", fontWeight: "600" },
  filterLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.8, marginBottom: 10 },
  pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  optionPill: { borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#fff" },
  optionPillActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  optionText: { fontSize: 13, color: "#6B7280" },
  optionTextActive: { color: "#2563EB", fontWeight: "600" },
  applyBtn: { backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  applyText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

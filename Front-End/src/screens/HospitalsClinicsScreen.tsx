import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Linking, Platform, StatusBar, Alert, Modal, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/colors";
import { HOSPITALS, GOVERNORATES, Hospital } from "../data/hospitals";

function openInMaps(hospital: Hospital) {
  // Search Google Maps by hospital name + governorate + Egypt so Google's
  // own database resolves the real location (more reliable than raw coordinates).
  const query = encodeURIComponent(`${hospital.name}, ${hospital.governorate}, Egypt`);

  const url = Platform.select({
    ios:     `maps://?q=${query}`,
    android: `geo:0,0?q=${query}`,
    default: `https://www.google.com/maps/search/?api=1&query=${query}`,
  }) as string;

  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
      .catch(() => Alert.alert("Error", "Could not open Google Maps."));
  });
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <View style={styles.ratingRow}>
      {Array.from({ length: full  }).map((_, i) => <Ionicons key={`f${i}`} name="star"           size={13} color="#F59E0B" />)}
      {half  && <Ionicons name="star-half" size={13} color="#F59E0B" />}
      {Array.from({ length: empty }).map((_, i) => <Ionicons key={`e${i}`} name="star-outline"   size={13} color="#F59E0B" />)}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
      <Text style={styles.ratingReviews}>({reviews})</Text>
    </View>
  );
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="hospital-building" size={26} color={colors.main} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hospitalName} numberOfLines={2}>{hospital.name}</Text>
          <View style={styles.govRow}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.govText}>{hospital.governorate}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.address}>{hospital.address}</Text>

      <View style={styles.specialtyBadge}>
        <MaterialCommunityIcons name="stethoscope" size={13} color={colors.main} />
        <Text style={styles.specialtyText}>{hospital.specialty}</Text>
      </View>

      <View style={styles.doctorsSection}>
        <Text style={styles.doctorsLabel}>Doctors</Text>
        {hospital.doctors.map((d, i) => (
          <View key={i} style={styles.doctorRow}>
            <View style={styles.doctorDot} />
            <Text style={styles.doctorText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <StarRating rating={hospital.rating} reviews={hospital.reviews} />
        {hospital.phone ? (
          <TouchableOpacity
            style={styles.phoneBtn}
            onPress={() => Linking.openURL(`tel:${hospital.phone}`).catch(() => {})}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={13} color="#16A34A" />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.mapsBtn}
        onPress={() => openInMaps(hospital)}
        activeOpacity={0.85}
      >
        <Ionicons name="navigate" size={16} color="#fff" />
        <Text style={styles.mapsBtnText}>Open in Google Maps</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HospitalsClinicsScreen({ navigation }: any) {
  const [selectedGov, setSelectedGov] = useState<string>("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = useMemo(
    () => selectedGov === "All" ? HOSPITALS : HOSPITALS.filter(h => h.governorate === selectedGov),
    [selectedGov]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospitals & Clinics</Text>
        <View style={styles.premiumBadge}>
          <MaterialCommunityIcons name="crown" size={12} color="#F59E0B" />
        </View>
      </View>

      {/* Dropdown selector */}
      <View style={styles.dropdownWrapper}>
        <Text style={styles.dropdownLabel}>SELECT AREA</Text>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setDropdownOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="location" size={18} color={colors.main} />
          <Text style={styles.dropdownText}>{selectedGov === "All" ? "All Governorates" : selectedGov}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filtered.length}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HospitalCard hospital={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listHint}>
            Tap "Open in Google Maps" to get turn-by-turn directions.
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="medkit-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No hospitals listed for this governorate yet.</Text>
          </View>
        }
      />

      {/* Dropdown modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Area</Text>
              <TouchableOpacity onPress={() => setDropdownOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={GOVERNORATES}
              keyExtractor={(g) => g}
              renderItem={({ item }) => {
                const count = item === "All" ? HOSPITALS.length : HOSPITALS.filter(h => h.governorate === item).length;
                const selected = selectedGov === item;
                return (
                  <TouchableOpacity
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => {
                      setSelectedGov(item);
                      setDropdownOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selected ? "location" : "location-outline"}
                      size={18}
                      color={selected ? colors.main : "#6B7280"}
                    />
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>{item}</Text>
                    <Text style={styles.modalOptionCount}>{count}</Text>
                    {selected && <Ionicons name="checkmark-circle" size={18} color={colors.main} />}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  premiumBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#FFFBEB",
    alignItems: "center", justifyContent: "center",
  },

  // Dropdown
  dropdownWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dropdownLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dropdownText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111" },
  countBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 12, fontWeight: "700", color: colors.main },

  listContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 12 },
  listHint:    { fontSize: 12, color: "#6B7280", marginBottom: 4, paddingHorizontal: 2 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardHeaderRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
  },
  hospitalName: { fontSize: 15, fontWeight: "700", color: "#111" },
  govRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  govText: { fontSize: 12, color: "#6B7280" },

  address: { fontSize: 13, color: "#374151", lineHeight: 19 },

  specialtyBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: "flex-start",
  },
  specialtyText: { fontSize: 12, fontWeight: "600", color: colors.main },

  doctorsSection: { gap: 4, marginTop: 4 },
  doctorsLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5 },
  doctorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  doctorDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.main },
  doctorText: { fontSize: 13, color: "#111" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingValue: { fontSize: 13, fontWeight: "700", color: "#111", marginLeft: 4 },
  ratingReviews: { fontSize: 11, color: "#9CA3AF" },
  phoneBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center", justifyContent: "center",
  },

  mapsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.main,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  mapsBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: "#9CA3AF" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "70%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modalOptionSelected: { backgroundColor: "#EFF6FF" },
  modalOptionText:         { flex: 1, fontSize: 15, color: "#111" },
  modalOptionTextSelected: { fontWeight: "700", color: colors.main },
  modalOptionCount: { fontSize: 12, fontWeight: "600", color: "#9CA3AF" },
  modalSeparator: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 18 },
});

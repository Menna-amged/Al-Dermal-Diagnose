import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import PatientCard, { Patient } from "../components/patients/PatientCard";
import BottomTabBar from "../components/layout/BottomTabBar";

const PENDING_COUNT = 3;

const PATIENTS: Patient[] = [
  { id: "1", name: "John Doe", email: "John.Doe@gmail.com", time: "09:30 AM", condition: "Eczema", conditionColor: "#F5A623", initials: "JD" },
  { id: "2", name: "Emma Wilson", email: "emma-wilson231@gmail.com", time: "10:45 AM", condition: "Psoriasis", conditionColor: "#E8524A", initials: "EW" },
  { id: "3", name: "Sarah Ross", email: "Sara3R8@gmail.com", time: "12:15 PM", condition: "Acne Vulgaris", conditionColor: "#4A90D9", initials: "SR" },
  { id: "4", name: "David Kim", email: "david.K87@gmail.com", time: "03:28 PM", condition: "", conditionColor: "", initials: "DK" },
];

export default function DoctorHomescreen() {
  const [search, setSearch] = useState("");

  const filtered = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Patients</Text>
        <TouchableOpacity style={styles.profileCircle} activeOpacity={0.8}>
          <FontAwesome5 name="user-md" size={20} color={colors.main} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.darkGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={colors.darkGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.queueHeader}>
        <Text style={styles.queueTitle}>TODAY'S QUEUE</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{PENDING_COUNT} Pending</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PatientCard patient={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.black,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
  },
  queueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  queueTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.darkGray,
    letterSpacing: 0.8,
  },
  pendingBadge: {
    backgroundColor: "#EAF0FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.main,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
});

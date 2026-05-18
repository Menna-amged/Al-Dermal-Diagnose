import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, StatusBar } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common, CONDITION_PRIORITY } from "../config/theme";
import PatientCard, { Patient } from "../components/patients/PatientCard";
import BottomTabBar from "../components/layout/BottomTabBar";

const PATIENTS: Patient[] = [
  { id: "1", name: "John Doe",    email: "John.Doe@gmail.com",       time: "09:30 AM", condition: "Eczema",           conditionColor: "#F5A623", conditionBg: "#FFF4E0", initials: "JD", age: 30, gender: "Male",   confidence: 92, notes: "The spot has been itching for about 2 weeks. I noticed it has grown slightly in diameter and change color darker in the center. It bleeds sometimes when scratched." },
  { id: "2", name: "Emma Wilson", email: "emma-wilson231@gmail.com", time: "10:45 AM", condition: "Skin Cancer",      conditionColor: "#7B0000", conditionBg: "#FFE5E5", initials: "EW", age: 25, gender: "Female", confidence: 95, notes: "Mole changed shape and color over last 3 months. Family history of skin cancer." },
  { id: "3", name: "Sarah Ross",  email: "Sara3R8@gmail.com",        time: "12:15 PM", condition: "Actinic Keratosis",conditionColor: "#C0392B", conditionBg: "#FDECEA", initials: "SR", age: 42, gender: "Female", confidence: 88, notes: "Rough scaly patches on the scalp. Worsens with sun exposure." },
  { id: "4", name: "David Kim",   email: "david.K87@gmail.com",      time: "03:28 PM", condition: "Acne & Rosacea",  conditionColor: "#4A90D9", conditionBg: "#E8F2FF", initials: "DK", age: 22, gender: "Male",   confidence: 78, notes: "Persistent acne on forehead and cheeks for 6 months." },
];

export default function HomeScreen({ navigation }: any) {
  const [search, setSearch] = useState("");

  const filtered = PATIENTS
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (CONDITION_PRIORITY[a.condition] ?? 99) - (CONDITION_PRIORITY[b.condition] ?? 99));

  return (
    <SafeAreaView style={common.screenBg} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[common.rowBetween, styles.header]}>
        <Text style={styles.title}>My Patients</Text>
        <TouchableOpacity style={styles.profileCircle} activeOpacity={0.8}>
          <FontAwesome5 name="user-md" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={[common.row, styles.searchContainer]}>
        <Ionicons name="search-outline" size={18} color={colors.darkGray} style={{ marginRight: 8 }} />
        <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor={colors.darkGray} value={search} onChangeText={setSearch} />
      </View>

      <View style={[common.rowBetween, styles.queueHeader]}>
        <Text style={common.label}>TODAY'S QUEUE</Text>
        <View style={common.badge}>
          <Text style={common.badgeText}>{PATIENTS.length} Pending</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onPress={() => navigation.navigate("PatientDetails", { patient: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={common.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.lightGray} />
            <Text style={common.emptyText}>No results found</Text>
          </View>
        }
      />

      <BottomTabBar activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: "700", color: colors.black },
  profileCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.main, justifyContent: "center", alignItems: "center", shadowColor: colors.main, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  searchContainer: { backgroundColor: colors.white, borderRadius: 14, marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15, color: colors.black },
  queueHeader: { paddingHorizontal: 20, marginBottom: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
});
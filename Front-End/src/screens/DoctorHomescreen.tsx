import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../config/colors";
import { common, CONDITION_PRIORITY, SEVERITY_MAP } from "../config/theme";
import PatientCard, { Patient } from "../components/patients/PatientCard";
import BottomTabBar from "../components/layout/BottomTabBar";
import { doctorApi } from "../config/api";

function mapApiPatient(p: any): Patient {
  const name     = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const sev      = p.condition ? SEVERITY_MAP[p.condition] : null;
  const time     = p.lastCaseAt
    ? new Date(p.lastCaseAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  return {
    id:             p.id,
    name,
    email:          p.email ?? "",
    time,
    condition:      p.condition   ?? "",
    conditionColor: sev?.color    ?? "#9CA3AF",
    conditionBg:    sev?.bg       ?? "#F3F4F6",
    initials,
    age:            p.age         ?? 0,
    gender:         p.gender      ?? "",
    confidence:     p.confidence  ?? 0,
    notes:          "",
  };
}

export default function HomeScreen({ navigation }: any) {
  const [search, setSearch]       = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patients, setPatients]   = useState<Patient[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem("firstName").then((name) => setDoctorName(name ?? ""));
    loadPatients();
  }, []));

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await doctorApi.get("/patients");
      setPatients((data as any[]).map(mapApiPatient));
    } catch {
      setError("Could not load patients.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (CONDITION_PRIORITY[a.condition] ?? 99) - (CONDITION_PRIORITY[b.condition] ?? 99));

  return (
    <SafeAreaView style={common.screenBg} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[common.rowBetween, styles.header]}>
        <View>
          <Text style={styles.welcome}>Welcome, Dr. {doctorName} 👋</Text>
          <Text style={styles.title}>My Patients</Text>
        </View>
        <TouchableOpacity
          style={styles.profileCircle}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Profile")}
        >
          <FontAwesome5 name="user-md" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={[common.row, styles.searchContainer]}>
        <Ionicons name="search-outline" size={18} color={colors.darkGray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients"
          placeholderTextColor={colors.darkGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={[common.rowBetween, styles.queueHeader]}>
        <Text style={common.label}>PATIENTS</Text>
        {!loading && (
          <View style={common.badge}>
            <Text style={common.badgeText}>{filtered.length} Total</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.main} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.lightGray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadPatients} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PatientCard
              patient={item}
              onPress={() => navigation.navigate("PatientDetails", { patientId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={common.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.lightGray} />
              <Text style={common.emptyText}>
                {search ? "No results found" : "No patients assigned yet"}
              </Text>
            </View>
          }
        />
      )}

      <BottomTabBar activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:        { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  welcome:       { fontSize: 13, color: colors.darkGray, marginBottom: 2 },
  title:         { fontSize: 28, fontWeight: "700", color: colors.black },
  profileCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.main, justifyContent: "center", alignItems: "center", shadowColor: colors.main, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  searchContainer: { backgroundColor: colors.white, borderRadius: 14, marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchInput:   { flex: 1, fontSize: 15, color: colors.black },
  queueHeader:   { paddingHorizontal: 20, marginBottom: 10 },
  listContent:   { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  centered:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText:     { fontSize: 14, color: colors.darkGray, textAlign: "center" },
  retryBtn:      { backgroundColor: colors.main, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:     { color: colors.white, fontWeight: "700", fontSize: 14 },
});

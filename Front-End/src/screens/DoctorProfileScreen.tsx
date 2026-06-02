import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../config/colors";
import { common } from "../config/theme";
import ProfileField from "../components/profile/ProfileField";
import { doctorApi } from "../config/api";

export default function DoctorProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats]     = useState<{ patients: number; accuracy: number; cases: number } | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      doctorApi.get("/profile/me"),
      doctorApi.get("/dashboard"),
    ]).then(([profileRes, dashRes]) => {
      if (!active) return;
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
      if (dashRes.status === "fulfilled") {
        const d = dashRes.value.data;
        setStats({
          patients: d.totalPatients ?? d.patients ?? 0,
          accuracy: d.accuracy ?? 0,
          cases:    d.totalCases ?? d.cases ?? 0,
        });
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[common.rowBetween, styles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color={colors.black} />
          </TouchableOpacity>
          <Text style={common.title}>My Profile</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.main} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const name      = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Doctor";
  const specialty = profile?.specialty ?? "";
  const clinic    = profile?.clinicName ?? "";
  const initials  = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const fields = [
    { icon: "person-outline"        as const, label: "Full Name",       value: name },
    { icon: "mail-outline"          as const, label: "Email",           value: profile?.email ?? "" },
    { icon: "call-outline"          as const, label: "Phone",           value: profile?.phone ?? "" },
    { icon: "medical-outline"       as const, label: "Specialty",       value: specialty },
    { icon: "business-outline"      as const, label: "Clinic/Hospital", value: clinic },
    { icon: "document-text-outline" as const, label: "Bio",             value: profile?.bio ?? "", multiline: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={[common.rowBetween, styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={colors.black} />
        </TouchableOpacity>
        <Text style={common.title}>My Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          {specialty ? <Text style={styles.profileSpecialty}>{specialty}</Text> : null}
          {clinic ? (
            <View style={styles.clinicBadge}>
              <Ionicons name="business-outline" size={13} color={colors.main} />
              <Text style={styles.clinicText}>{clinic}</Text>
            </View>
          ) : null}
        </View>

        {stats && (
          <View style={styles.statsRow}>
            {[
              [String(stats.patients), "Patients"],
              [String(stats.cases),    "Cases"],
              [stats.accuracy ? `${stats.accuracy}%` : "—", "Accuracy"],
            ].map(([val, lbl], i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{val}</Text>
                  <Text style={styles.statLabel}>{lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        <View style={styles.fieldsCard}>
          {fields.map((f, i) => (
            <ProfileField key={i} {...f} onChange={() => {}} editing={false} isLast={i === fields.length - 1} />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background },
  header:           { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  content:          { padding: 16 },
  avatarSection:    { alignItems: "center", paddingVertical: 24 },
  avatar:           { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", marginBottom: 12, shadowColor: colors.main, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 6 },
  avatarText:       { fontSize: 30, fontWeight: "700", color: colors.white },
  profileName:      { fontSize: 20, fontWeight: "700", color: colors.black, marginBottom: 4 },
  profileSpecialty: { fontSize: 14, color: colors.darkGray, marginBottom: 8 },
  clinicBadge:      { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50 },
  clinicText:       { fontSize: 13, color: colors.main, fontWeight: "500" },
  statsRow:         { flexDirection: "row", backgroundColor: colors.white, borderRadius: 16, paddingVertical: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  statItem:         { flex: 1, alignItems: "center" },
  statValue:        { fontSize: 22, fontWeight: "700", color: colors.main },
  statLabel:        { fontSize: 12, color: colors.darkGray, marginTop: 2 },
  statDivider:      { width: 1, backgroundColor: "#E5E7EB" },
  fieldsCard:       { backgroundColor: colors.white, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2, marginBottom: 16 },
});

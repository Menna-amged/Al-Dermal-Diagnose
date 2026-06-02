import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common, SEVERITY_MAP } from "../config/theme";
import ScreenHeader from "../components/layout/ScreenHeader";
import PatientAvatar from "../components/patients/PatientAvatar";
import { doctorApi } from "../config/api";

export default function PatientDetailsScreen({ navigation, route }: any) {
  const patientId = route.params?.patientId ?? route.params?.patient?.id;

  const [patient, setPatient] = useState<any>(route.params?.patient ?? null);
  const [loading, setLoading] = useState(!route.params?.patient);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!patient && patientId) load();
  }, [patientId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await doctorApi.get(`/patients/${patientId}`);
      setPatient(data);
    } catch {
      setError("Could not load patient details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={common.screen} edges={["top"]}>
        <ScreenHeader title="Patient Details" onBack={() => navigation.goBack()} />
        <View style={styles.centered}><ActivityIndicator color={colors.main} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (error || !patient) {
    return (
      <SafeAreaView style={common.screen} edges={["top"]}>
        <ScreenHeader title="Patient Details" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.lightGray} />
          <Text style={styles.errorText}>{error ?? "Patient not found."}</Text>
          {error && (
            <TouchableOpacity onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const name      = [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials  = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const latestCase = patient.cases?.[0] ?? null;
  const condition  = latestCase?.condition ?? patient.condition ?? null;
  const confidence = latestCase?.confidence ?? patient.confidence ?? null;
  const notes         = latestCase?.notes ?? null;
  const skinImageUrl  = latestCase?.skinImageUrl ?? patient.consultationSkinImageUrl ?? null;
  const sev        = condition ? (SEVERITY_MAP[condition] ?? SEVERITY_MAP["Normal"]) : null;

  const diagnosedDate = latestCase?.date
    ? new Date(latestCase.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <ScreenHeader title="Patient Details" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient info card */}
        <View style={[common.card, common.row, styles.infoCard]}>
          <PatientAvatar initials={initials} size={48} />
          <View style={styles.infoText}>
            <Text style={styles.patientName}>{name}</Text>
            <Text style={common.subtitle}>{patient.email}</Text>
            {(patient.gender || patient.age) && (
              <Text style={common.subtitle}>
                {[patient.gender, patient.age ? `${patient.age} years` : null].filter(Boolean).join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Diagnosis section — only if a case exists */}
        {condition && sev && (
          <>
            <Text style={[common.title, styles.sectionTitle]}>Latest Diagnosis</Text>
            <View style={styles.predictionBox}>
              <View style={common.rowBetween}>
                <Text style={styles.aiLabel}>AI MODEL PREDICTION</Text>
                {confidence != null && (
                  <Text style={styles.confidence}>{Math.round(confidence)}%</Text>
                )}
              </View>
              <Text style={styles.conditionName}>{condition}</Text>
              <View style={[common.row, styles.badgeRow]}>
                <View style={[common.row, styles.severityBadge, { backgroundColor: sev.bg }]}>
                  <Ionicons name="warning-outline" size={12} color={sev.color} />
                  <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
                </View>
                {latestCase?.status === "DIAGNOSED" && (
                  <View style={[common.row, styles.followBadge]}>
                    <Ionicons name="checkmark-circle-outline" size={12} color="#16A34A" />
                    <Text style={[styles.followText, { color: "#16A34A" }]}>Diagnosed</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.reportBtn, { width: "100%" }]}
                onPress={() => navigation.navigate("DiagnosisReport", { patient: { ...patient, name, initials, condition, confidence, notes, skinImageUrl }, caseId: latestCase?.id, consultationId: patient.consultationId ?? null })}
              >
                <Text style={styles.reportBtnText}>View Full Report</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Notes */}
        {notes && (
          <View style={[common.card, styles.notesCard]}>
            <View style={[common.row, { gap: 8, marginBottom: 10 }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.black} />
              <Text style={common.title}>Patient Notes</Text>
            </View>
            <Text style={[common.subtitle, { lineHeight: 20 }]}>"{notes}"</Text>
            {diagnosedDate && <Text style={styles.notesDate}>Recorded on {diagnosedDate}</Text>}
          </View>
        )}

        {/* All cases list */}
        {patient.cases && patient.cases.length > 0 && (
          <>
            <Text style={[common.title, styles.sectionTitle]}>Case History</Text>
            <View style={styles.casesList}>
              {patient.cases.map((c: any, i: number) => {
                const cs = SEVERITY_MAP[c.condition] ?? SEVERITY_MAP["Normal"];
                return (
                  <TouchableOpacity
                    key={c.id ?? i}
                    style={[common.card, styles.caseRow]}
                    onPress={() => navigation.navigate("DiagnosisReport", { patient: { ...patient, name, initials, condition: c.condition, confidence: c.confidence, notes: c.notes, skinImageUrl: c.skinImageUrl ?? null }, caseId: c.id, consultationId: patient.consultationId ?? null })}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.caseCondition}>{c.condition}</Text>
                      <Text style={common.subtitle}>
                        {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {c.confidence ? ` · ${Math.round(c.confidence)}%` : ""}
                      </Text>
                    </View>
                    <View style={[styles.caseBadge, { backgroundColor: cs.bg }]}>
                      <Text style={[styles.caseBadgeText, { color: cs.color }]}>{cs.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.gray} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {!condition && !patient.cases?.length && (
          <View style={styles.centered}>
            <Ionicons name="folder-open-outline" size={40} color={colors.lightGray} />
            <Text style={styles.errorText}>No cases on record yet.</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoCard:       { marginHorizontal: 16, marginVertical: 12 },
  infoText:       { flex: 1, marginLeft: 12 },
  patientName:    { fontSize: 15, fontWeight: "700", color: colors.black },
  sectionTitle:   { marginHorizontal: 16, marginBottom: 10, marginTop: 8 },
  predictionBox:  { marginHorizontal: 16, marginTop: 4, backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 12 },
  aiLabel:        { fontSize: 11, fontWeight: "700", color: colors.main, letterSpacing: 0.5 },
  confidence:     { fontSize: 18, fontWeight: "700", color: colors.main },
  conditionName:  { fontSize: 24, fontWeight: "700", color: colors.black, marginVertical: 6 },
  badgeRow:       { gap: 10, marginBottom: 14 },
  severityBadge:  { gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  severityText:   { fontSize: 12, fontWeight: "600" },
  followBadge:    { gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: "#F0FDF4" },
  followText:     { fontSize: 12, fontWeight: "600" },
  reportBtn:      { flex: 1, backgroundColor: "#EAF0FF", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  reportBtnText:  { fontSize: 14, fontWeight: "600", color: colors.main },
  notesCard:      { margin: 16 },
  notesDate:      { fontSize: 11, color: colors.gray, marginTop: 8 },
  casesList:      { paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  caseRow:        { flexDirection: "row", alignItems: "center" },
  caseCondition:  { fontSize: 14, fontWeight: "700", color: colors.black, marginBottom: 2 },
  caseBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  caseBadgeText:  { fontSize: 11, fontWeight: "600" },
  centered:       { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 },
  errorText:      { fontSize: 14, color: colors.darkGray, textAlign: "center" },
  retryBtn:       { backgroundColor: colors.main, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:      { color: colors.white, fontWeight: "700", fontSize: 14 },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common, SEVERITY_MAP } from "../config/theme";
import ScreenHeader from "../components/layout/ScreenHeader";
import PatientAvatar from "../components/patients/PatientAvatar";

export default function PatientDetailsScreen({ navigation, route }: any) {
  const { patient } = route.params;
  const sev = SEVERITY_MAP[patient.condition] ?? SEVERITY_MAP["Normal"];

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <ScreenHeader
        title="Patient Details"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[common.card, common.row, styles.infoCard]}>
          <PatientAvatar initials={patient.initials} size={48} />
          <View style={styles.infoText}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={common.subtitle}>{patient.email}</Text>
            <Text style={common.subtitle}>
              {patient.gender}, {patient.age} years
            </Text>
          </View>
        </View>

        <Text style={[common.title, styles.sectionTitle]}>
          Diagnosis Analysis
        </Text>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
          }}
          style={styles.diagImage}
        />

        <View style={styles.predictionBox}>
          <View style={common.rowBetween}>
            <Text style={styles.aiLabel}>AI MODEL PREDICTION</Text>
            <Text style={styles.confidence}>{patient.confidence}%</Text>
          </View>
          <Text style={styles.conditionName}>{patient.condition}</Text>
          <View style={[common.row, styles.badgeRow]}>
            <View
              style={[
                common.row,
                styles.severityBadge,
                { backgroundColor: sev.bg },
              ]}
            >
              <Ionicons name="warning-outline" size={12} color={sev.color} />
              <Text style={[styles.severityText, { color: sev.color }]}>
                {sev.label}
              </Text>
            </View>
            <View style={[common.row, styles.followBadge]}>
              <Ionicons
                name="information-circle-outline"
                size={12}
                color={colors.main}
              />
              <Text style={styles.followText}>Follow-up Required</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.reportBtn, { width: "100%" }]}
            onPress={() => navigation.navigate("DiagnosisReport", { patient })}
          >
            <Text style={styles.reportBtnText}>View Full Report</Text>
          </TouchableOpacity>
        </View>

        <View style={[common.card, styles.notesCard]}>
          <View style={[common.row, { gap: 8, marginBottom: 10 }]}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={colors.black}
            />
            <Text style={common.title}>Patient Notes</Text>
          </View>
          <Text style={[common.subtitle, { lineHeight: 20 }]}>
            "{patient.notes}"
          </Text>
          <Text style={styles.notesDate}>Added on Oct. 12, 2023</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoCard: { marginHorizontal: 16, marginVertical: 12 },
  infoText: { flex: 1, marginLeft: 12 },
  patientName: { fontSize: 15, fontWeight: "700", color: colors.black },
  chatIcon: { padding: 8, backgroundColor: "#EAF0FF", borderRadius: 10 },
  sectionTitle: { marginHorizontal: 16, marginBottom: 10 },
  diagImage: {
    marginHorizontal: 16,
    height: 220,
    resizeMode: "cover",
    borderRadius: 12,
  },
  predictionBox: { marginHorizontal: 16, marginTop: 14 },
  aiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.main,
    letterSpacing: 0.5,
  },
  confidence: { fontSize: 18, fontWeight: "700", color: colors.main },
  conditionName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
    marginVertical: 6,
  },
  badgeRow: { gap: 10, marginBottom: 14 },
  severityBadge: {
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  severityText: { fontSize: 12, fontWeight: "600" },
  followBadge: {
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#EAF0FF",
  },
  followText: { fontSize: 12, fontWeight: "600", color: colors.main },
  reportBtn: {
    flex: 1,
    backgroundColor: "#EAF0FF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  reportBtnText: { fontSize: 14, fontWeight: "600", color: colors.main },
  shareBtn: { padding: 10, backgroundColor: "#EAF0FF", borderRadius: 12 },
  notesCard: { margin: 16 },
  notesDate: { fontSize: 11, color: colors.gray, marginTop: 8 },
});

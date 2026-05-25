import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common, CONDITION_INFO } from "../config/theme";
import ScreenHeader from "../components/layout/ScreenHeader";

export default function DiagnosisReportScreen({ navigation, route }: any) {
  const { patient } = route.params;
  const info = CONDITION_INFO[patient.condition] ?? {
    subtitle: "Skin Condition",
    overview: "A skin condition diagnosed by AI model.",
    steps: ["Consult with a dermatologist.", "Follow prescribed treatment."],
  };

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <ScreenHeader title="Diagnosis Report" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800" }} style={styles.diagImage} />

        <View style={styles.content}>
          <Text style={styles.diagLabel}>DIAGNOSIS</Text>
          <View style={[common.rowBetween, { marginBottom: 20 }]}>
            <View>
              <Text style={styles.conditionName}>{patient.condition}</Text>
              <Text style={common.subtitle}>({info.subtitle})</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceNum}>{patient.confidence}%</Text>
              <Text style={styles.confidenceLabel}>CONFIDENCE</Text>
            </View>
          </View>

          <Text style={styles.sectionNum}>1. Condition Overview</Text>
          <Text style={[common.subtitle, { lineHeight: 22 }]}>{info.overview}</Text>

          <Text style={styles.sectionNum}>2. Recommended Next Steps</Text>
          {info.steps.map((step, i) => (
            <View key={i} style={[common.row, styles.stepRow]}>
              <View style={styles.stepDot} />
              <Text style={[common.subtitle, { flex: 1, lineHeight: 22 }]}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.finalDiagBtn}
          onPress={() => navigation.navigate("FinalDiagnosis", { patient })}
        >
          <Text style={styles.finalDiagText}>Final Diagnosis</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  diagImage: { marginHorizontal: 16, height: 220, resizeMode: "cover", borderRadius: 12 },
  content: { padding: 16 },
  diagLabel: { fontSize: 11, fontWeight: "700", color: colors.main, letterSpacing: 1, marginBottom: 4 },
  conditionName: { fontSize: 28, fontWeight: "700", color: colors.black },
  confidenceBadge: { backgroundColor: "#EAF0FF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" },
  confidenceNum: { fontSize: 20, fontWeight: "700", color: colors.main },
  confidenceLabel: { fontSize: 10, fontWeight: "600", color: colors.main, letterSpacing: 0.5 },
  sectionNum: { fontSize: 15, fontWeight: "700", color: colors.black, marginTop: 16, marginBottom: 8 },
  stepRow: { gap: 8, marginBottom: 6, alignItems: "flex-start" },
  stepDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.main, marginTop: 6 },
  finalDiagBtn: {
    backgroundColor: colors.main,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  finalDiagText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
});
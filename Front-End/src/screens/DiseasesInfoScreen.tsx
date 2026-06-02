import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import REPORTS, { ALL_DISEASES, DiseaseReport } from "../data/diseaseReports";
import { downloadReport } from "../utils/pdfReport";
import colors from "../config/colors";

const DISEASE_COLORS: Record<string, string> = {
  "Acne & Rosacea":     "#EC4899",
  "Actinic Keratosis":  "#F97316",
  "Chickenpox":         "#8B5CF6",
  "Eczema":             "#06B6D4",
  "Monkeypox":          "#DC2626",
  "Nail Fungus":        "#10B981",
  "SkinCancer":         "#EF4444",
  "Vitiligo":           "#2563EB",
};

const DISEASE_ICONS: Record<string, string> = {
  "Acne & Rosacea":     "face-woman-outline",
  "Actinic Keratosis":  "white-balance-sunny",
  "Chickenpox":         "dots-grid",
  "Eczema":             "water-outline",
  "Monkeypox":          "bug-outline",
  "Nail Fungus":        "nail",
  "SkinCancer":         "alert-circle-outline",
  "Vitiligo":           "palette-outline",
};

function DiseaseCard({ name, onDownload }: { name: string; onDownload: () => Promise<void> }) {
  const report = REPORTS[name] as DiseaseReport;
  const color  = DISEASE_COLORS[name] ?? "#2563EB";
  const icon   = DISEASE_ICONS[name] ?? "medical-bag";
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    await onDownload();
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded((e) => !e)} activeOpacity={0.8}>
        <View style={[styles.iconWrap, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={icon as any} size={22} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{name}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <Text style={styles.cardDesc}>{report.description}</Text>

          <Text style={styles.sectionLabel}>Main Causes</Text>
          {report.causes.slice(0, 3).map((c, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: color }]} />
              <Text style={styles.bulletText}>{c}</Text>
            </View>
          ))}
          {report.causes.length > 3 && (
            <Text style={[styles.moreNote, { color }]}>+ {report.causes.length - 3} more in the full report</Text>
          )}

          <View style={[styles.visitBox, report.visitDoctor ? styles.visitYes : styles.visitNo]}>
            <Ionicons
              name={report.visitDoctor ? "alert-circle" : "checkmark-circle"}
              size={16}
              color={report.visitDoctor ? "#C2410C" : "#15803D"}
            />
            <Text style={[styles.visitText, { color: report.visitDoctor ? "#C2410C" : "#15803D" }]}>
              {report.visitDoctor ? "Doctor consultation recommended" : "Can manage at home with care"}
            </Text>
          </View>

          <TouchableOpacity style={[styles.downloadBtn, { borderColor: color }]} onPress={handleDownload} activeOpacity={0.85} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={color} />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={18} color={color} />
                <Text style={[styles.downloadBtnText, { color }]}>Download Full Report (PDF)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function DiseasesInfoScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diseases Info</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Learn about the 8 skin conditions our AI can detect. Tap any disease to read about its causes, first aid steps, and whether you need to see a doctor. Download a full PDF report to keep for reference.
        </Text>

        {ALL_DISEASES.map((name) => (
          <DiseaseCard
            key={name}
            name={name}
            onDownload={() => downloadReport(REPORTS[name])}
          />
        ))}

        <Text style={styles.disclaimer}>
          These reports are for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.
        </Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: colors.white },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  container:   { padding: 16, paddingBottom: 32 },
  intro:       { fontSize: 13, color: "#6B7280", lineHeight: 19, marginBottom: 16, backgroundColor: "#F9FAFB", borderRadius: 12, padding: 14 },

  card: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#111" },

  cardBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  cardDesc: { fontSize: 13, color: "#374151", lineHeight: 19, marginTop: 10, marginBottom: 12 },

  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 6 },
  bulletRow:    { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 5 },
  bullet:       { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  bulletText:   { fontSize: 13, color: "#374151", flex: 1, lineHeight: 18 },
  moreNote:     { fontSize: 12, fontStyle: "italic", marginTop: 2, marginBottom: 8 },

  visitBox:  { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 10, marginTop: 10, marginBottom: 10 },
  visitYes:  { backgroundColor: "#FFF7ED" },
  visitNo:   { backgroundColor: "#F0FDF4" },
  visitText: { fontSize: 13, fontWeight: "600", flex: 1, lineHeight: 18 },

  downloadBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, marginTop: 4,
    backgroundColor: "#F9FAFB",
  },
  downloadBtnText: { fontSize: 14, fontWeight: "700" },

  disclaimer: {
    fontSize: 11, color: "#9CA3AF", textAlign: "center",
    lineHeight: 16, marginTop: 8, paddingHorizontal: 10,
  },
});

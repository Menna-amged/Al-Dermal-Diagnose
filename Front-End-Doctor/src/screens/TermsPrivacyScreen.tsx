import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";
import { common } from "../config/theme";

const SECTIONS = [
  { title: "1. Introduction", body: "Welcome to DermAI Diagnose. By using this application, you agree to these terms and conditions. Please read them carefully before using the app." },
  { title: "2. Medical Disclaimer", body: "The AI diagnosis provided by this application is intended to assist medical professionals only. It does not replace professional medical judgment. Always verify AI results with your clinical expertise." },
  { title: "3. Patient Data Privacy", body: "All patient data is encrypted and stored securely. We comply with medical data privacy regulations. Patient information is never shared with third parties without explicit consent." },
  { title: "4. Data Usage", body: "Anonymized and aggregated data may be used to improve our AI models. No personally identifiable information is used for training without explicit consent." },
  { title: "5. User Responsibilities", body: "You are responsible for maintaining the confidentiality of your account credentials. Report any unauthorized access immediately to our support team." },
  { title: "6. Changes to Terms", body: "We may update these terms periodically. Continued use of the app after changes constitutes acceptance of the new terms." },
  { title: "7. Contact Us", body: "For any questions regarding these terms or our privacy policy, contact us at legal@dermaldiagnose.com" },
];

export default function TermsPrivacyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[common.rowBetween, styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.black} />
        </TouchableOpacity>
        <Text style={common.title}>Terms & Privacy</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        <View style={styles.card}>
          {SECTIONS.map((s, i) => (
            <View key={i} style={[styles.section, i < SECTIONS.length - 1 && styles.sectionBorder]}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  content: { padding: 16 },
  lastUpdated: { fontSize: 12, color: colors.darkGray, marginBottom: 12 },
  card: { backgroundColor: colors.white, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  section: { padding: 16 },
  sectionBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.black, marginBottom: 8 },
  sectionBody: { fontSize: 14, color: colors.darkGray, lineHeight: 22 },
});
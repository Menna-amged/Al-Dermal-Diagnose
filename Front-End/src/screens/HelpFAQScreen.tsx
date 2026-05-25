import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";
import { common } from "../config/theme";

const FAQS = [
  {
    q: "How does the AI diagnosis work?",
    a: "Our AI model analyzes skin images using deep learning to detect and classify skin conditions with high accuracy.",
  },
  {
    q: "How do I view a patient's full report?",
    a: "Go to the patient's details screen and tap 'View Full Report' to see the complete diagnosis report.",
  },
  {
    q: "Can I edit my final diagnosis?",
    a: "Yes, you can submit your final diagnosis and notes from the Final Diagnosis screen after reviewing the AI prediction.",
  },
  {
    q: "How do I change my password?",
    a: "Go to Settings → Change Password and enter your current and new password.",
  },
  {
    q: "Is patient data secure?",
    a: "Yes, all patient data is encrypted and stored securely following medical data privacy standards.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us at support@dermaldiagnose.com for any technical issues or inquiries.",
  },
];

export default function HelpFAQScreen({ navigation }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[common.rowBetween, styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.black} />
        </TouchableOpacity>
        <Text style={common.title}>Help & FAQ</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          {FAQS.map((item, i) => (
            <View
              key={i}
              style={[styles.faqItem, i < FAQS.length - 1 && styles.faqBorder]}
            >
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <Text style={styles.questionText}>{item.q}</Text>
                <Ionicons
                  name={openIndex === i ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.darkGray}
                />
              </TouchableOpacity>
              {openIndex === i && (
                <Text style={styles.answerText}>{item.a}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  faqItem: { padding: 16 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  answerText: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 10,
    lineHeight: 22,
  },
});

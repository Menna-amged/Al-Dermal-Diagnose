import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using DermAI, you agree to be bound by these Terms. If you do not agree, please discontinue use of the application immediately.",
  },
  {
    title: "2. Medical Disclaimer",
    body: "DermAI provides AI-assisted skin analysis for informational purposes only. Results are not a substitute for professional medical diagnosis or treatment advice from a qualified physician.",
  },
  {
    title: "3. User Responsibilities",
    body: "You are responsible for the accuracy of any information you provide. Do not share login credentials or use another person's account without permission.",
  },
  {
    title: "4. Intellectual Property",
    body: "All content, features, and functionality of DermAI are the exclusive property of the development team and are protected by applicable intellectual property laws.",
  },
  {
    title: "5. Limitation of Liability",
    body: "DermAI and its developers shall not be liable for any indirect, incidental, or consequential damages arising from your use of the application or reliance on its AI results.",
  },
  {
    title: "6. Changes to Terms",
    body: "We reserve the right to update these Terms at any time. Continued use of the app after changes constitutes your acceptance of the new Terms.",
  },
];

export default function TermsAndConditionsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: April 2026</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Legal Document</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8EDFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    color: colors.main,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
});

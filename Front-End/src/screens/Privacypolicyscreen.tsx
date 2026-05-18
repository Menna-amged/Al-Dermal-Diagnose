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
    title: "Data We Collect",
    body: "We collect skin images you submit, account information (name, email), and usage analytics to improve our AI model and your overall experience within the app.",
  },
  {
    title: "How We Use Your Data",
    body: "Your data is used solely to provide diagnosis results, improve our AI model, and enable doctor consultations. We never sell your personal data to third parties.",
  },
  {
    title: "Data Security",
    body: "All data is encrypted in transit and at rest using industry-standard protocols. Skin images are stored securely and are only accessible to you and authorized medical professionals you consult.",
  },
  {
    title: "Your Rights",
    body: "You may request access, correction, or deletion of your personal data at any time by contacting us or navigating to the app settings.",
  },
  {
    title: "Cookies & Analytics",
    body: "We use anonymized analytics to understand how users interact with the app. No personally identifiable information is linked to analytics data.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or an in-app notification.",
  },
];

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Effective: April 2026</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Privacy</Text>
        </View>

        {/* Intro card */}
        <View style={styles.introCard}>
          <View style={styles.shieldIcon}>
            <Ionicons name="lock-closed" size={18} color={colors.main} />
          </View>
          <Text style={styles.introText}>
            We are committed to protecting your personal information and being
            transparent about what we collect and why.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        {/* Contact note */}
        <View style={styles.contactNote}>
          <Text style={styles.contactNoteText}>
            Questions about your privacy?{" "}
            <Text style={styles.contactLink}>Contact us at support@dermai.app</Text>
          </Text>
        </View>

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
  introCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  shieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#D0E8FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  introText: {
    flex: 1,
    fontSize: 13,
    color: "#1A4A8A",
    lineHeight: 20,
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
  contactNote: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contactNoteText: {
    fontSize: 13,
    color: "#6E6E73",
    textAlign: "center",
    lineHeight: 20,
  },
  contactLink: {
    color: colors.main,
    fontWeight: "500",
  },
});

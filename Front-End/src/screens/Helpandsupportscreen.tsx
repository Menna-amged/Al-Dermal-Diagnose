import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: "How accurate is the AI diagnosis?",
    answer:
      "Our Vision Transformer (ViT) model achieves high accuracy on common skin conditions. Results are for informational purposes only — always consult a doctor for a final diagnosis.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your images and personal data are encrypted in transit and at rest. We never share your data without your explicit consent. See our Privacy Policy for full details.",
  },
  {
    question: "How do I talk to a doctor?",
    answer:
      "Go to the Doctor tab, browse available specialists, and start a real-time chat. Premium users get priority access and faster response times.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Yes. Navigate to Profile → Settings → Delete Account. All your personal data will be permanently removed within 30 days.",
  },
  {
    question: "What skin conditions can the app detect?",
    answer:
      "DermAI can identify a wide range of common skin conditions including acne, eczema, psoriasis, rosacea, and more. The model is continuously trained to improve coverage.",
  },
  {
    question: "Is the app free to use?",
    answer:
      "DermAI offers a free tier with basic diagnosis features. Premium plans unlock doctor chat, detailed reports, and history tracking.",
  },
];

const contactOptions = [
  {
    label: "Email Support",
    sub: "support@dermai.app",
    bgColor: "#E8EDFF",
    icon: "mail-outline" as const,
    iconColor: colors.main,
    onPress: () => Linking.openURL("mailto:support@dermai.app"),
  },
  {
    label: "Live Chat",
    sub: "Typically replies in minutes",
    bgColor: "#E8F5E9",
    icon: "chatbubble-outline" as const,
    iconColor: "#2E7D32",
    onPress: () => {},
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  };

  return (
    <TouchableOpacity style={styles.faqCard} onPress={toggle} activeOpacity={0.8}>
      <View style={styles.faqRow}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#9CA3AF"
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpAndSupportScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQs */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FAQs</Text>
        </View>

        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}

        {/* Contact */}
        <View style={[styles.badge, styles.badgeGreen, { marginTop: 8 }]}>
          <Text style={[styles.badgeText, { color: "#2E7D32" }]}>Contact Us</Text>
        </View>

        {contactOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
            onPress={option.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.contactIcon, { backgroundColor: option.bgColor }]}>
              <Ionicons name={option.icon} size={20} color={option.iconColor} />
            </View>
            <View style={styles.contactTextWrap}>
              <Text style={styles.contactLabel}>{option.label}</Text>
              <Text style={styles.contactSub}>{option.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
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
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8EDFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    color: colors.main,
    fontWeight: "500",
  },
  badgeGreen: {
    backgroundColor: "#E8F5E9",
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: "#555",
    lineHeight: 21,
    marginTop: 10,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  contactSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
});

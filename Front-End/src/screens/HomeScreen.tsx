import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WeatherCard from "../components/WeatherCard";
import SunWarningCard from "../components/SunWarningCard";
import FloatingChatButton from "../components/FloatingChatButton";
import NavBar from "../components/NavBar";
import colors from "../config/colors";

const steps = [
  {
    icon: <Ionicons name="camera-outline" size={28} color="#3B82F6" />,
    title: "1. Scan",
    text: "Take a clear photo",
  },
  {
    icon: <MaterialCommunityIcons name="atom" size={28} color="#3B82F6" />,
    title: "2.Analyze",
    text: "Our AI analyze it",
  },
  {
    icon: <Ionicons name="clipboard-outline" size={28} color="#3B82F6" />,
    title: "3. Report",
    text: "Receive your results",
  },
];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [disease, setDisease]     = useState("");

  useEffect(() => {
    AsyncStorage.getItem("firstName").then((name) => setFirstName(name ?? ""));
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiGet(["isPremium", "current_condition"]).then(([premiumPair, diseasePair]) => {
        setIsPremium(premiumPair[1] === "true");
        setDisease(diseasePair[1] ?? "");
      });
    }, [])
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back, {firstName}</Text>
        </View>

        <WeatherCard />
        {isPremium && disease ? <SunWarningCard disease={disease} /> : null}

        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepCard}>
              {step.icon}
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.scanCard}>
          <Text style={styles.scanTitle}>Check your skin!</Text>
          <Text style={styles.scanSubtitle}>
            Get an instant AI-powered analysis.
          </Text>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => navigation.navigate("Camera")}
          >
            <Text style={styles.scanBtnText}>Scan Your Skin Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate("History")} activeOpacity={0.75}>
            <View style={[styles.quickIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="time-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.quickLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate("Premium")} activeOpacity={0.75}>
            <View style={[styles.quickIcon, { backgroundColor: "#FFFBEB" }]}>
              <MaterialCommunityIcons name="crown-outline" size={24} color="#D97706" />
            </View>
            <Text style={styles.quickLabel}>Be Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate("BuyTokens")} activeOpacity={0.75}>
            <View style={[styles.quickIcon, { backgroundColor: "#ECFDF5" }]}>
              <MaterialCommunityIcons name="ticket-outline" size={24} color="#059669" />
            </View>
            <Text style={styles.quickLabel}>Buy Tokens</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <FloatingChatButton navigation={navigation} />
      <NavBar navigation={navigation} activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 14,
  },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 90 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcome: { fontSize: 22, fontWeight: "700", color: "#111" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111" },
  stepsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  stepCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  stepTitle: { fontWeight: "700", fontSize: 13, color: "#111", textAlign: "center", marginTop: 4 },
  stepText: { fontSize: 11, color: "#6B7280", textAlign: "center" },
  scanCard: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  scanTitle: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 6 },
  scanSubtitle: { color: "#6B7280", fontSize: 14, marginBottom: 18 },
  scanBtn: { backgroundColor: "#2563EB", borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  scanBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  quickItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 10,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
});

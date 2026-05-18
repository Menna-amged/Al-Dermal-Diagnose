import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WeatherCard from "../components/WeatherCard";
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

  useEffect(() => {
    AsyncStorage.getItem("firstName").then((name) => setFirstName(name ?? ""));
  }, []);

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
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <WeatherCard />

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

        <View style={{ height: 20 }} />
      </ScrollView>

      <FloatingChatButton />
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
  container: { padding: 20, paddingBottom: 10 },
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
  },
  scanTitle: { fontSize: 20, fontWeight: "800", color: "#111", marginBottom: 6 },
  scanSubtitle: { color: "#6B7280", fontSize: 14, marginBottom: 18 },
  scanBtn: { backgroundColor: "#2563EB", borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  scanBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

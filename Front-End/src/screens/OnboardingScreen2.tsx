import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthLayout from "../components/layout/AuthLayout";
import colors from "../config/colors";

export default function OnboardingScreen2({ navigation }: any) {
  return (
    <AuthLayout headerHeight={240} showCircles showBack={false}>
      {/* Skip */}
      <TouchableOpacity
        style={styles.skip}
        onPress={() => navigation.navigate("UserType")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Ionicons name="people" size={28} color={colors.main} />
      </View>

      <Text style={styles.cardTitle}>Connect with Dermatologists</Text>
      <Text style={styles.cardText}>
        Get professional consultations from{"\n"}certified skin specialists near you.
      </Text>

      {/* Dots */}
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>

      {/* Next */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate("UserType")}
        >
          <Text style={styles.nextText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  skip: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  skipText: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: "500",
  },
  iconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#EAF1FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
    alignSelf: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 15,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.main,
    width: 18,
    borderRadius: 3,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 20,
    alignItems: "flex-end",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});

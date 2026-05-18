import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AuthLayout from "../components/layout/AuthLayout";
import colors from "../config/colors";

function UserTypeScreen({ navigation }: any) {
  return (
    <AuthLayout headerHeight={240} showCircles showBack={false}>
      <View style={styles.container}>
        <Text style={styles.heading}>Who are you?</Text>
        <Text style={styles.sub}>Select your role to continue</Text>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <View style={styles.cards}>
          {/* Patient card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("PatientLogin")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#EAF3FF" }]}>
              <Ionicons name="person" size={32} color={colors.main} />
            </View>
            <Text style={styles.cardLabel}>Patient</Text>
            <Text style={styles.cardSub}>Scan & diagnose your skin</Text>
            <View style={styles.arrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.main} />
            </View>
          </TouchableOpacity>

          {/* Doctor card */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("DoctorLogin")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#EDFAF3" }]}>
              <FontAwesome5 name="user-md" size={30} color="#16a34a" />
            </View>
            <Text style={styles.cardLabel}>Doctor</Text>
            <Text style={styles.cardSub}>Review & diagnose patients</Text>
            <View style={[styles.arrow, { backgroundColor: "#EDFAF3" }]}>
              <Ionicons name="arrow-forward" size={16} color="#16a34a" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}

export default UserTypeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 36,
  },
  cards: {
    width: "100%",
    gap: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 28,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: colors.main,
    width: 18,
    borderRadius: 3,
  },
  arrow: {
    position: "absolute",
    right: 22,
    top: "50%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";
import PatientAvatar from "./PatientAvatar";

export type Patient = {
  id: string;
  name: string;
  email: string;
  time: string;
  condition: string;
  conditionColor: string;
  initials: string;
};

type Props = {
  patient: Patient;
  onPress?: (patient: Patient) => void;
};

export default function PatientCard({ patient, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(patient)}
    >
      <PatientAvatar initials={patient.initials} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.time}>{patient.time}</Text>
        </View>
        <Text style={styles.email}>{patient.email}</Text>

        {patient.condition ? (
          <View style={[styles.badge, { borderColor: patient.conditionColor }]}>
            <Text style={[styles.badgeText, { color: patient.conditionColor }]}>
              {patient.condition}
            </Text>
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.darkGray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.black,
  },
  time: {
    fontSize: 11,
    color: colors.darkGray,
  },
  email: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

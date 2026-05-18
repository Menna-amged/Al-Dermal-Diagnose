import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";
import { common } from "../../config/theme";
import PatientAvatar from "./PatientAvatar";

export type Patient = {
  id: string;
  name: string;
  email: string;
  time: string;
  condition: string;
  conditionColor: string;
  conditionBg: string;
  initials: string;
  age: number;
  gender: string;
  confidence: number;
  notes: string;
};

type Props = {
  patient: Patient;
  onPress?: (patient: Patient) => void;
};

export default function PatientCard({ patient, onPress }: Props) {
  return (
    <TouchableOpacity style={[common.card, common.row]} activeOpacity={0.7} onPress={() => onPress?.(patient)}>
      <PatientAvatar initials={patient.initials} />
      <View style={styles.content}>
        <View style={common.rowBetween}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.time}>{patient.time}</Text>
        </View>
        <Text style={[common.subtitle, { marginBottom: 6 }]}>{patient.email}</Text>
        {patient.condition ? (
          <View style={[styles.badge, { borderColor: patient.conditionColor, backgroundColor: patient.conditionBg }]}>
            <Text style={[styles.badgeText, { color: patient.conditionColor }]}>{patient.condition}</Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: "700", color: colors.black },
  time: { fontSize: 11, color: colors.darkGray },
  badge: { alignSelf: "flex-start", borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
});

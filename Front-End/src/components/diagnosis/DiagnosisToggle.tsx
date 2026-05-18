import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

type Props = {
  value: boolean | null;
  onChange: (val: boolean) => void;
};

export default function DiagnosisToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, value === true && styles.btnCorrect]}
        onPress={() => onChange(true)}
        activeOpacity={0.8}
      >
        <Ionicons name={value === true ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={value === true ? colors.white : colors.darkGray} />
        <Text style={[styles.text, value === true && styles.textActive]}>Correct</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, value === false && styles.btnIncorrect]}
        onPress={() => onChange(false)}
        activeOpacity={0.8}
      >
        <Ionicons name={value === false ? "close-circle" : "close-circle-outline"} size={20} color={value === false ? colors.white : colors.darkGray} />
        <Text style={[styles.text, value === false && styles.textActive]}>Incorrect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", backgroundColor: "#F2F4F8", borderRadius: 50, padding: 4, gap: 4 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 50 },
  btnCorrect: { backgroundColor: colors.main },
  btnIncorrect: { backgroundColor: "#6B7280" },
  text: { fontSize: 15, fontWeight: "600", color: colors.darkGray },
  textActive: { color: colors.white },
});

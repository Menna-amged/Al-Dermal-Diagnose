import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  isLast?: boolean;
};

export default function ProfileField({ icon, label, value, editing, onChange, multiline, isLast }: Props) {
  return (
    <View style={[styles.row, !isLast && styles.border]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.main} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {editing ? (
          <TextInput
            style={[styles.input, multiline && styles.inputMulti]}
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "auto"}
          />
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginTop: 2 },
  content: { flex: 1 },
  label: { fontSize: 11, color: colors.darkGray, fontWeight: "500", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 14, color: "#111", lineHeight: 20 },
  input: { fontSize: 14, color: "#111", borderBottomWidth: 1, borderBottomColor: colors.main, paddingBottom: 4 },
  inputMulti: { minHeight: 70, lineHeight: 20 },
});

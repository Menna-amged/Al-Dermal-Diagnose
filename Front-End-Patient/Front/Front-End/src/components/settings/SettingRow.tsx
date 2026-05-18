import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: "navigate" | "toggle" | "danger";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
  isLast?: boolean;
};

export default function SettingRow({ icon, label, type, value, onPress, onToggle, isLast }: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={type !== "toggle" ? onPress : undefined}
      activeOpacity={type === "toggle" ? 1 : 0.7}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrap, type === "danger" && styles.iconWrapDanger]}>
          <Ionicons name={icon} size={20} color={type === "danger" ? "#EF4444" : colors.main} />
        </View>
        <Text style={[styles.label, type === "danger" && styles.labelDanger]}>{label}</Text>
      </View>
      {type === "toggle" ? (
        <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#D1D5DB", true: colors.main }} thumbColor={colors.white} />
      ) : type === "navigate" ? (
        <Ionicons name="chevron-forward" size={18} color={colors.darkGray} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  iconWrapDanger: { backgroundColor: "#FEE2E2" },
  label: { fontSize: 15, color: colors.black, fontWeight: "500" },
  labelDanger: { color: "#EF4444" },
});

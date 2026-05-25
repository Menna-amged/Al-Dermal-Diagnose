import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../config/colors";
import SettingRow from "./SettingRow";

type Row = {
  icon: any;
  label: string;
  type: "navigate" | "toggle" | "danger";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
};

type Props = {
  title?: string;
  rows: Row[];
};

export default function SettingSection({ title, rows }: Props) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <SettingRow key={i} {...row} isLast={i === rows.length - 1} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  title: { fontSize: 12, fontWeight: "600", color: colors.darkGray, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: "white", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
});

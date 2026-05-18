import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../config/colors";
import { common } from "../../config/theme";
import PatientAvatar from "../patients/PatientAvatar";

type Props = {
  name: string;
  initials: string;
  type: string;
  time: string;
};

export default function AppointmentCard({ name, initials, type, time }: Props) {
  return (
    <View style={[common.card, common.row]}>
      <PatientAvatar initials={initials} size={44} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={common.subtitle}>{type}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: "700", color: colors.black },
  time: { fontSize: 13, fontWeight: "700", color: colors.main },
});

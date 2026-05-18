import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../config/colors";

type Props = {
  initials: string;
  size?: number;
};

export default function PatientAvatar({ initials, size = 46 }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#DDEAFF",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.main,
  },
});

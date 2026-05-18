import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Stepper from "./Stepper";

type Props = {
  title: string;
  step: number;
  navigation: any;
};

export default function AuthHeader({ title, step, navigation }: Props) {
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <View style={{ width: 22 }} />
      </View>

      <Stepper currentStep={step} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
});

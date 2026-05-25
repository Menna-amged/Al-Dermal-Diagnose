import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

type Props = {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
};

export default function Toast({ type, message, onClose }: Props) {
  return (
    <View style={[styles.toast, type === "success" ? styles.success : styles.error]}>
      <View style={styles.inner}>
        <Ionicons
          name={type === "success" ? "checkmark-circle" : "close-circle"}
          size={20}
          color={colors.white}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
      {onClose ? (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={18} color={colors.white} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 6,
    marginLeft: 10,
  },
  success: {
    backgroundColor: colors.main,
  },
  error: {
    backgroundColor: "#EF4444",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";
import { common } from "../../config/theme";

type Props = {
  title: string;
  onBack: () => void;
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onRightPress?: () => void;
};

export default function ScreenHeader({ title, onBack, rightIcon, onRightPress }: Props) {
  return (
    <View style={[common.rowBetween, styles.header]}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-back" size={26} color={colors.black} />
      </TouchableOpacity>
      <Text style={common.title}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={rightIcon} size={22} color={colors.black} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 26 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 12 },
});
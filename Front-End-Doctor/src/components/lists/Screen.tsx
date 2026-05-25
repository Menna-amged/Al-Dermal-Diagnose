import React, { ReactNode } from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../config/colors";

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.screen, style]}>
    

      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default Screen;

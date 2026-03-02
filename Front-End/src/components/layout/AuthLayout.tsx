import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

type Props = {
  children: React.ReactNode;
  headerHeight?: number;
  image?: any;
  showCircles?: boolean;
  onBack?: () => void;
  showBack?: boolean;
};

export default function AuthLayout({
  children,
  headerHeight = 120,
  image,
  showCircles = false,
  onBack,
  showBack = true,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.header, { height: headerHeight }]}>
        {showBack && onBack && (
          <TouchableOpacity style={styles.backIcon} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        )}

        {showCircles && (
          <>
            <View style={styles.circleTop} />
            <View style={styles.headerContent}>
              <Text style={styles.appTitle}>DERMASCAN</Text>
              <Text style={styles.appSubtitle}>DETECT . ANALYZE . HEAL</Text>
            </View>
            <View style={styles.circleBottom} />
          </>
        )}

        {image && <Image source={image} style={styles.image} />}
      </View>

      <KeyboardAwareScrollView
        style={styles.card}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 ,paddingBottom: 40 ,paddingTop: 24}}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.main,
  },
  header: {
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "visible",
  },
  backIcon: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  headerContent: {
    zIndex: 3,
    alignItems: "center",
    marginBottom: 60,
  },
  appTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
  appSubtitle: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 10,
    opacity: 0.9,
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    position: "absolute",
    bottom: -60,
    zIndex: 5,
  },
  circleTop: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#4C90F8",
    top: -60,
    left: -60,
    opacity: 0.9,
  },
  circleBottom: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: "#0A58CA",
    bottom: -160,
    right: -60,
    opacity: 1,
    zIndex: 0,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1,
  },
});
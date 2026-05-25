import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
    
        <Image source={require("../assets/splash.png")} style={styles.image} />
    
      <Text style={styles.title}>Derm AI Diagnose</Text>
      <Text style={styles.subtitle}>your AI powered skin health companion.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0156F1",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
  },
});

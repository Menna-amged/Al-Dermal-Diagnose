import { View, Text  ,StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={styles.title}>DermAl Diagnose 🧬</Text>
    </View>
  );

}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0156F1",
  },
});
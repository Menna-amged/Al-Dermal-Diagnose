import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FloatingChatButton({ navigation }: any) {
  const handlePress = async () => {
    const data = await AsyncStorage.getItem("user_profile");
    const profile = data ? JSON.parse(data) : {};
    const userName = [profile.name, profile.lastName].filter(Boolean).join(" ") || "there";
    navigation.navigate("Chatbot", { userName });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <MaterialCommunityIcons name="robot-outline" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 50,
  },
});

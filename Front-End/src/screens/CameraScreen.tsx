import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import NavBar from "../components/NavBar";

export default function CameraScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      navigation.navigate("Prediction", { imageUri: result.assets[0].uri });
    }
  };

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow gallery access to upload a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      navigation.navigate("Prediction", { imageUri: result.assets[0].uri });
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Scan</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optionBtn} onPress={handleCamera}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera" size={32} color="#2563EB" />
            </View>
            <Text style={styles.optionLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionBtn} onPress={handleUpload}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={32} color="#2563EB" />
            </View>
            <Text style={styles.optionLabel}>Upload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            For the most accurate diagnosis, please ensure your photo meets the following criteria before uploading.
          </Text>
        </View>
      </View>

      <NavBar navigation={navigation} activeTab="Camera" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  optionsRow: { flexDirection: "row", gap: 50, marginBottom: 40 },
  optionBtn: { alignItems: "center", gap: 10 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: { fontSize: 15, fontWeight: "500", color: "#111" },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
});

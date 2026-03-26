import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResultScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { imageUri } = route.params;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.statusCard}>
          <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
          <Text style={styles.statusTitle}>Image Uploaded Successfully</Text>
          <Text style={styles.statusSub}>Your scan is ready for analysis</Text>
        </View>
        <TouchableOpacity style={styles.analyzeBtn}>
          <Text style={styles.analyzeBtnText}>Analyze Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retakeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="camera-outline" size={18} color="#2563EB" />
          <Text style={styles.retakeBtnText}>Retake Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content: { padding: 24, alignItems: "center", gap: 20 },
  image: { width: "100%", height: 300, borderRadius: 20, resizeMode: "cover" },
  statusCard: { width: "100%", backgroundColor: "#F0FDF4", borderRadius: 16, padding: 20, alignItems: "center", gap: 8 },
  statusTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  statusSub: { fontSize: 13, color: "#6B7280" },
  analyzeBtn: { width: "100%", backgroundColor: "#2563EB", borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  retakeBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  retakeBtnText: { color: "#2563EB", fontWeight: "600", fontSize: 15 },
});

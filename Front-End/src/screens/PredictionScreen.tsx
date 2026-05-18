import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function runPrediction(imageUri: string): Promise<{ disease: string; confidence: number }> {
  await new Promise((res) => setTimeout(res, 2000));
  return { disease: "Acne & Rosacea", confidence: 87 };
}

export default function PredictionScreen({ route, navigation }: any) {
  const { imageUri } = route.params as { imageUri: string };

  const [loading, setLoading]       = useState(true);
  const [disease, setDisease]       = useState("");
  const [confidence, setConfidence] = useState(0);
  const [tokens, setTokens] = useState(0);


  useEffect(() => {
    if (!imageUri) {
      Alert.alert("No image", "Please select an image first.");
      navigation.goBack();
    }
  }, [imageUri]);

  useEffect(() => {
    const init = async () => {
      const val = await AsyncStorage.getItem("user_tokens");
      setTokens(val ? parseInt(val) : 5);
      const result = await runPrediction(imageUri);
      setDisease(result.disease);
      setConfidence(result.confidence);

      
      await AsyncStorage.setItem("last_disease", result.disease);

      setLoading(false);
    };
    if (imageUri) {
      init();
    }
  }, []);

  const handleConsult = () => {
    if (tokens < 1) {
      Alert.alert(
        "Not enough tokens",
        "You need 1 token to send a consultation.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Buy tokens", onPress: () => navigation.navigate("BuyTokens") },
        ]
      );
      return;
    }
    navigation.navigate("ConsultDoctorSelect", { imageUri, disease, confidence, tokens });
  };

  const confidenceColor =
    confidence >= 80 ? "#16A34A" : confidence >= 60 ? "#D97706" : "#DC2626";

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Analyzing your image...</Text>
          </View>
        ) : (
          <>
            {/* Result Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultIconCircle}>
                  <MaterialCommunityIcons name="stethoscope" size={22} color="#2563EB" />
                </View>
                <Text style={styles.resultTitle}>AI Prediction</Text>
              </View>

              <View style={styles.resultDivider} />

              <Text style={styles.diseaseLabel}>Detected condition</Text>
              <Text style={styles.diseaseName}>{disease}</Text>

              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                  {confidence}%
                </Text>
              </View>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${confidence}%`, backgroundColor: confidenceColor },
                  ]}
                />
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.disclaimerRow}>
                <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
                <Text style={styles.disclaimerText}>
                  This is not a medical diagnosis. Always consult a doctor.
                </Text>
              </View>
            </View>

            {/* Tokens badge */}
            <View style={styles.tokensBadge}>
              <MaterialCommunityIcons name="wallet-outline" size={16} color="#2563EB" />
              <Text style={styles.tokensBadgeText}>
                You have <Text style={{ fontWeight: "700" }}>{tokens} tokens</Text>
              </Text>
            </View>

            {/* Consult Doctor button */}
            <TouchableOpacity
              style={styles.consultBtn}
              onPress={handleConsult}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.consultBtnText}>Consult a doctor</Text>
              <View style={styles.consultTokenCost}>
                <Text style={styles.consultTokenCostText}>1 token</Text>
              </View>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  imageCard: { borderRadius: 16, overflow: "hidden", marginBottom: 16, height: 220, backgroundColor: "#E5E7EB" },
  image: { width: "100%", height: "100%" },
  loadingBox: { backgroundColor: "#fff", borderRadius: 16, padding: 40, alignItems: "center", gap: 16, marginBottom: 16 },
  loadingText: { fontSize: 14, color: "#6B7280", marginTop: 8 },
  resultCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  resultIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  resultDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  diseaseLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 4 },
  diseaseName: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 14 },
  confidenceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  confidenceLabel: { fontSize: 13, color: "#6B7280" },
  confidenceValue: { fontSize: 15, fontWeight: "700" },
  progressBg: { height: 6, backgroundColor: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", borderRadius: 3 },
  disclaimerRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  disclaimerText: { fontSize: 12, color: "#9CA3AF", flex: 1, lineHeight: 18 },
  tokensBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 12 },
  tokensBadgeText: { fontSize: 13, color: "#2563EB" },
  consultBtn: { backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  consultBtnDisabled: { opacity: 0.6 },
  consultBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  consultTokenCost: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  consultTokenCostText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipText: { fontSize: 14, color: "#9CA3AF" },
});
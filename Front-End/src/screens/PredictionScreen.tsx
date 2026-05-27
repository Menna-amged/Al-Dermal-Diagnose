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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../config/colors";
import { pipelineApi } from "../config/api";
import { getReport } from "../data/diseaseReports";
import { downloadReport } from "../utils/pdfReport";

type PipelineStatus = "lesion_detected" | "unknown_condition" | "clear_skin" | "rejected" | "";

async function runPrediction(imageUri: string): Promise<any> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const res  = await fetch(imageUri);
    const blob = await res.blob();
    formData.append("file", new File([blob], "skin.jpg", { type: blob.type || "image/jpeg" }));
  } else {
    (formData as any).append("file", { uri: imageUri, type: "image/jpeg", name: "skin.jpg" });
  }

  const baseURL = pipelineApi.defaults.baseURL;
  const res = await fetch(`${baseURL}/predict?images=true`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
}

export default function PredictionScreen({ route, navigation }: any) {
  const { imageUris } = route.params as { imageUris: string[] };

  const [loading, setLoading]               = useState(true);
  const [disease, setDisease]               = useState("");
  const [confidence, setConfidence]         = useState(0);
  const [tokens, setTokens]                 = useState(0);
  const [maskImageUri, setMaskImageUri]     = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("");
  const [showMask, setShowMask]             = useState(false);

  useEffect(() => {
    if (!imageUris?.length) {
      Alert.alert("No images", "Please go back and add your photos.");
      navigation.goBack();
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const val     = await AsyncStorage.getItem("user_tokens");
      const parsed  = val ? parseInt(val) : 0;
      const balance = parsed < 0 ? 0 : parsed;
      if (balance !== parsed) await AsyncStorage.setItem("user_tokens", String(balance));
      setTokens(balance);

      try {
        const data   = await runPrediction(imageUris[0]);
        const status = data.status as PipelineStatus;
        setPipelineStatus(status);

        if (status === "rejected") {
          Alert.alert(
            "Not a Skin Image",
            data.message || "This image does not appear to be a skin photo. Please try again.",
            [{ text: "Go Back", onPress: () => navigation.goBack() }]
          );
          setLoading(false);
          return;
        }

        let resultDisease    = "";
        let resultConfidence = 0;

        if (status === "clear_skin") {
          resultDisease    = "No Lesion Detected";
          resultConfidence = 0;
        } else if (status === "unknown_condition") {
          resultDisease    = "Unknown Image";
          resultConfidence = 0;
          if (data.images?.overlay) setMaskImageUri(data.images.overlay);
        } else if (status === "lesion_detected") {
          resultDisease    = data.predicted_class || "";
          resultConfidence = Math.round((data.confidence || 0) * 100);
          if (data.images?.overlay) setMaskImageUri(data.images.overlay);
        }

        setDisease(resultDisease);
        setConfidence(resultConfidence);
        await AsyncStorage.setItem("last_disease", resultDisease);
        await saveScanToHistory(imageUris[0], resultDisease, resultConfidence);
      } catch (err: any) {
        const msg = err?.message || "Analysis failed. Please try again.";
        Alert.alert("Analysis Failed", msg, [
          { text: "Go Back", onPress: () => navigation.goBack() },
        ]);
      }

      setLoading(false);
    };

    if (imageUris?.length) init();
  }, []);

  const saveScanToHistory = async (uri: string, dis: string, conf: number) => {
    try {
      const raw   = await AsyncStorage.getItem("skin_scan_history");
      const prev  = raw ? JSON.parse(raw) : [];
      const entry = { id: Date.now().toString(), uri, disease: dis, confidence: conf, date: new Date().toISOString() };
      await AsyncStorage.setItem("skin_scan_history", JSON.stringify([entry, ...prev].slice(0, 50)));
    } catch {}
  };

  const handleDownloadReport = async () => {
    const report = getReport(disease);
    if (!report) {
      Alert.alert("No report available", "We don't have a detailed report for this condition yet.");
      return;
    }
    await downloadReport(report);
  };

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
    navigation.navigate("ConsultDoctorSelect", { imageUri: imageUris[0], disease, confidence, tokens });
  };

  const isOod      = pipelineStatus === "unknown_condition";
  const isClear    = pipelineStatus === "clear_skin";
  const isDetected = pipelineStatus === "lesion_detected";

  const diseaseColor     = isOod ? "#DC2626" : isClear ? "#16A34A" : "#111";
  const confidenceColor  = confidence >= 80 ? "#16A34A" : confidence >= 60 ? "#D97706" : "#DC2626";
  const displayedImage   = showMask && maskImageUri ? maskImageUri : imageUris[0];

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Single image viewer */}
        <View style={styles.imageCard}>
          <Image source={{ uri: displayedImage }} style={styles.image} resizeMode="cover" />

          {/* Toggle tabs — shown only after analysis + when mask exists */}
          {!loading && maskImageUri && (
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !showMask && styles.toggleBtnActive]}
                onPress={() => setShowMask(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="image-outline" size={13} color={!showMask ? "#fff" : "#6B7280"} />
                <Text style={[styles.toggleText, !showMask && styles.toggleTextActive]}>Original</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, showMask && styles.toggleBtnActive]}
                onPress={() => setShowMask(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="scan-outline" size={13} color={showMask ? "#fff" : "#6B7280"} />
                <Text style={[styles.toggleText, showMask && styles.toggleTextActive]}>Lesion Mask</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Label when showing mask */}
          {showMask && maskImageUri && (
            <View style={styles.maskBadge}>
              <Text style={styles.maskBadgeText}>Green = detected lesion area</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.main} />
            <Text style={styles.loadingText}>Analyzing your photo…</Text>
            <Text style={styles.loadingSubText}>Running 3-stage skin diagnosis pipeline</Text>
          </View>
        ) : (
          <>
            {/* Result Card */}
            <View style={[styles.resultCard, isOod && styles.resultCardOod, isClear && styles.resultCardClear]}>
              <View style={styles.resultHeader}>
                <View style={[
                  styles.resultIconCircle,
                  isOod   && { backgroundColor: "#FEE2E2" },
                  isClear && { backgroundColor: "#F0FDF4" },
                ]}>
                  <MaterialCommunityIcons
                    name={isClear ? "check-circle-outline" : isOod ? "alert-circle-outline" : "stethoscope"}
                    size={22}
                    color={isOod ? "#DC2626" : isClear ? "#16A34A" : colors.main}
                  />
                </View>
                <Text style={styles.resultTitle}>AI Prediction</Text>
              </View>

              <View style={styles.resultDivider} />

              <Text style={styles.diseaseLabel}>Detected condition</Text>
              <Text style={[styles.diseaseName, { color: diseaseColor }]}>{disease}</Text>

              {/* Confidence — only for lesion_detected */}
              {isDetected && confidence > 0 && (
                <>
                  <View style={styles.confidenceRow}>
                    <Text style={styles.confidenceLabel}>Confidence</Text>
                    <Text style={[styles.confidenceValue, { color: confidenceColor }]}>{confidence}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${confidence}%`, backgroundColor: confidenceColor }]} />
                  </View>
                </>
              )}

              <View style={styles.resultDivider} />

              {isClear && (
                <View style={styles.statusRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#16A34A" />
                  <Text style={[styles.statusText, { color: "#16A34A" }]}>
                    No skin lesion detected. Your skin looks healthy in this photo!
                  </Text>
                </View>
              )}

              {isOod && (
                <View style={styles.statusRow}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={[styles.statusText, { color: "#DC2626", fontWeight: "700" }]}>
                    Visit a doctor quickly!
                  </Text>
                </View>
              )}

              {isDetected && (
                <View style={styles.statusRow}>
                  <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.disclaimerText}>
                    This is not a medical diagnosis. Always consult a qualified doctor.
                  </Text>
                </View>
              )}
            </View>

            {/* Tokens badge */}
            <View style={styles.tokensBadge}>
              <MaterialCommunityIcons name="wallet-outline" size={16} color={colors.main} />
              <Text style={styles.tokensBadgeText}>
                You have <Text style={{ fontWeight: "700" }}>{tokens} tokens</Text>
              </Text>
            </View>

            {/* Consult Doctor button */}
            <TouchableOpacity style={styles.consultBtn} onPress={handleConsult} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.consultBtnText}>Consult a doctor</Text>
              <View style={styles.consultTokenCost}>
                <Text style={styles.consultTokenCostText}>1 token</Text>
              </View>
            </TouchableOpacity>

            {isDetected && getReport(disease) && (
              <TouchableOpacity style={styles.reportBtn} onPress={handleDownloadReport} activeOpacity={0.85}>
                <Ionicons name="document-text-outline" size={20} color="#2563EB" />
                <Text style={styles.reportBtnText}>Download Disease Report (PDF)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: "#F3F4F6" },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  content:     { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  /* Single image viewer */
  imageCard: { borderRadius: 16, overflow: "hidden", marginBottom: 16, height: 260, backgroundColor: "#E5E7EB" },
  image:     { width: "100%", height: "100%" },

  /* Toggle */
  toggleRow: {
    position: "absolute", bottom: 10, left: 10, right: 10,
    flexDirection: "row", backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12, padding: 3, gap: 3,
  },
  toggleBtn:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: colors.main },
  toggleText:      { fontSize: 12, fontWeight: "600", color: "#D1D5DB" },
  toggleTextActive:{ color: "#fff" },

  maskBadge: {
    position: "absolute", top: 10, left: 10,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  maskBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  /* Loading */
  loadingBox:    { backgroundColor: "#fff", borderRadius: 16, padding: 40, alignItems: "center", gap: 10, marginBottom: 16 },
  loadingText:   { fontSize: 14, color: "#6B7280" },
  loadingSubText:{ fontSize: 12, color: "#9CA3AF" },

  /* Result card */
  resultCard:     { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  resultCardOod:  { borderWidth: 1.5, borderColor: "#FECACA" },
  resultCardClear:{ borderWidth: 1.5, borderColor: "#BBF7D0" },
  resultHeader:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  resultIconCircle:{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  resultTitle:    { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
  resultDivider:  { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  diseaseLabel:   { fontSize: 12, color: "#9CA3AF", marginBottom: 4 },
  diseaseName:    { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 14 },
  confidenceRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  confidenceLabel:{ fontSize: 13, color: "#6B7280" },
  confidenceValue:{ fontSize: 15, fontWeight: "700" },
  progressBg:     { height: 6, backgroundColor: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill:   { height: "100%", borderRadius: 3 },
  statusRow:      { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  statusText:     { fontSize: 13, flex: 1, lineHeight: 18 },
  disclaimerText: { fontSize: 12, color: "#9CA3AF", flex: 1, lineHeight: 18 },

  /* CTA */
  tokensBadge:         { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 12 },
  tokensBadgeText:     { fontSize: 13, color: colors.main },
  consultBtn:          { backgroundColor: colors.main, borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  consultBtnText:      { color: "#fff", fontSize: 16, fontWeight: "700" },
  consultTokenCost:    { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  consultTokenCostText:{ color: "#fff", fontSize: 11, fontWeight: "600" },
  reportBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#2563EB", borderRadius: 14, paddingVertical: 14,
    marginBottom: 10, backgroundColor: "#EFF6FF",
  },
  reportBtnText: { color: "#2563EB", fontSize: 15, fontWeight: "700" },
  skipBtn:             { alignItems: "center", paddingVertical: 10 },
  skipText:            { fontSize: 14, color: "#9CA3AF" },
});

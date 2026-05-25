import React, { useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Image, Alert, Linking, Platform,
  Animated, TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import NavBar from "../components/NavBar";
import colors from "../config/colors";

const GUIDELINES = [
  {
    icon: "sunny-outline" as const,
    title: "Use Natural Light",
    desc: "Shoot near a window or outdoors. Avoid shadows and direct flash — they hide skin details.",
  },
  {
    icon: "resize-outline" as const,
    title: "Right Distance",
    desc: "Hold your phone 10–15 cm from the skin so the affected area fills most of the frame.",
  },
  {
    icon: "hand-right-outline" as const,
    title: "Keep Steady",
    desc: "Rest your elbow on a surface if needed. Motion blur is the most common cause of bad results.",
  },
  {
    icon: "eye-outline" as const,
    title: "Sharp Focus",
    desc: "Tap the affected area on screen before shooting to lock autofocus on the right spot.",
  },
  {
    icon: "water-outline" as const,
    title: "Clean Skin",
    desc: "Gently remove makeup, creams, or oils before scanning so the skin texture is clearly visible.",
  },
  {
    icon: "ban-outline" as const,
    title: "No Filters",
    desc: "Never use beautify modes, filters, or HDR. Unaltered photos give significantly better diagnoses.",
  },
];

const SHEET_HEIGHT = 320;

export default function CameraScreen({ navigation }: any) {
  const [photo, setPhoto]                   = useState<string | null>(null);
  const [guidelinesOpen, setGuidelinesOpen] = useState(true);
  const [sheetVisible, setSheetVisible]     = useState(false);

  const slideAnim   = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const showSheet = () => {
    setSheetVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 0,   useNativeDriver: true, bounciness: 4 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const hideSheet = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim,    { toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0,            duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setSheetVisible(false);
      callback?.();
    });
  };

  // ── pickers ──────────────────────────────────────────────────────────────

  const openCamera = async () => {
    if (Platform.OS === "web") { openGallery(); return; }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: "images", quality: 0.85 });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch {
      Alert.alert("Error", "Could not open the camera. Please try again.");
    }
  };

  const openGallery = async () => {
    try {
      if (Platform.OS === "android") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow photo access in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.85 });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch {
      Alert.alert("Error", "Could not open the gallery. Please try again.");
    }
  };

  const handleSlotPress = () => {
    if (Platform.OS === "web") openGallery();
    else showSheet();
  };

  const handleAnalyze = () => {
    if (!photo) return;
    navigation.navigate("Prediction", { imageUris: [photo] });
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Skin Scan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Take or upload one clear photo of the affected skin area. Make sure it's well-lit and in focus for the best result.
        </Text>

        {/* Photo slot */}
        <TouchableOpacity
          style={[styles.slot, photo && styles.slotFilled]}
          onPress={handleSlotPress}
          activeOpacity={0.8}
        >
          {photo ? (
            <>
              <Image source={{ uri: photo }} style={styles.slotImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setPhoto(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={26} color="#DC2626" />
              </TouchableOpacity>
              <View style={styles.replaceHint}>
                <Ionicons name="pencil-outline" size={13} color="#fff" />
                <Text style={styles.replaceHintText}>Tap to replace</Text>
              </View>
            </>
          ) : (
            <View style={styles.slotEmpty}>
              <View style={styles.slotIconCircle}>
                <Ionicons name="camera-outline" size={36} color={colors.main} />
              </View>
              <Text style={styles.slotAddTitle}>Add Photo</Text>
              <Text style={styles.slotAddSub}>
                {Platform.OS === "web"
                  ? "Click to upload a photo from your computer"
                  : "Tap to take a photo or choose from your gallery"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Guidelines */}
        <TouchableOpacity
          style={styles.guidelinesToggle}
          onPress={() => setGuidelinesOpen((o) => !o)}
          activeOpacity={0.7}
        >
          <View style={styles.guidelinesTitleRow}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={colors.main} />
            <Text style={styles.guidelinesTitle}>How to take an accurate photo</Text>
          </View>
          <Ionicons name={guidelinesOpen ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {guidelinesOpen && (
          <View style={styles.guidelinesList}>
            {GUIDELINES.map((g, i) => (
              <View key={i} style={[styles.guidelineItem, i === GUIDELINES.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.guidelineIcon}>
                  <Ionicons name={g.icon} size={18} color={colors.main} />
                </View>
                <View style={styles.guidelineBody}>
                  <Text style={styles.guidelineItemTitle}>{g.title}</Text>
                  <Text style={styles.guidelineItemDesc}>{g.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {!photo && (
          <Text style={styles.footerHint}>
            📷 Add a clear photo of the affected skin area to continue
          </Text>
        )}
        <TouchableOpacity
          style={[styles.analyzeBtn, !photo && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={!photo}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="stethoscope" size={20} color="#fff" />
          <Text style={styles.analyzeBtnText}>Analyze Skin</Text>
        </TouchableOpacity>
      </View>

      <NavBar navigation={navigation} activeTab="Camera" />

      {/* ── Bottom sheet (mobile only — web goes directly to file picker) ── */}
      {sheetVisible && Platform.OS !== "web" && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={() => hideSheet()}>
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: backdropAnim },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header row */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIconCircle}>
                <Ionicons name="image-outline" size={26} color={colors.main} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{photo ? "Replace Photo" : "Add Skin Photo"}</Text>
                <Text style={styles.sheetSub}>Choose how you'd like to add your photo</Text>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            {/* Camera option */}
            <TouchableOpacity
              style={styles.option}
              activeOpacity={0.7}
              onPress={() => hideSheet(openCamera)}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="camera" size={22} color="#16A34A" />
              </View>
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>Take a Photo</Text>
                <Text style={styles.optionDesc}>Open your camera and capture now</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <View style={styles.optionSep} />

            {/* Gallery option */}
            <TouchableOpacity
              style={styles.option}
              activeOpacity={0.7}
              onPress={() => hideSheet(openGallery)}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#EFF6FF" }]}>
                <MaterialCommunityIcons name="image-multiple-outline" size={22} color={colors.main} />
              </View>
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionDesc}>Pick an existing photo from your library</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <View style={styles.sheetDivider} />

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => hideSheet()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },

  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  intro: { fontSize: 14, color: "#6B7280", lineHeight: 22, textAlign: "center", marginBottom: 24 },

  /* Photo slot */
  slot: {
    width: "100%", aspectRatio: 4 / 3,
    borderRadius: 20, borderWidth: 2, borderColor: "#E5E7EB",
    borderStyle: "dashed", overflow: "hidden",
    backgroundColor: "#FAFAFA", marginBottom: 24,
  },
  slotFilled: { borderStyle: "solid", borderColor: colors.main },
  slotImage: { width: "100%", height: "100%" },
  slotEmpty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  slotIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
  },
  slotAddTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  slotAddSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 32 },
  removeBtn: { position: "absolute", top: 8, right: 8 },
  replaceHint: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)", flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 6,
  },
  replaceHintText: { fontSize: 12, color: "#fff", fontWeight: "600" },

  /* Guidelines */
  guidelinesToggle: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F9FAFB", borderRadius: 14, padding: 14, marginBottom: 2,
  },
  guidelinesTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  guidelinesTitle: { fontSize: 14, fontWeight: "700", color: "#111" },
  guidelinesList: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#F3F4F6",
    overflow: "hidden", marginBottom: 8,
  },
  guidelineItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    padding: 14, borderBottomWidth: 1, borderBottomColor: "#F9FAFB",
  },
  guidelineIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  guidelineBody: { flex: 1 },
  guidelineItemTitle: { fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 3 },
  guidelineItemDesc: { fontSize: 12, color: "#6B7280", lineHeight: 18 },

  /* Footer */
  footer: {
    position: "absolute", bottom: 64, left: 0, right: 0,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6",
    gap: 8,
  },
  footerHint: { fontSize: 12, color: "#6B7280", textAlign: "center" },
  analyzeBtn: {
    backgroundColor: colors.main, borderRadius: 16, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  analyzeBtnDisabled: { backgroundColor: "#D1D5DB" },
  analyzeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  /* Bottom sheet */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center", marginTop: 12, marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, marginBottom: 20,
  },
  sheetIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: "#111", marginBottom: 2 },
  sheetSub:   { fontSize: 13, color: "#9CA3AF" },
  sheetDivider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 20, marginBottom: 8 },

  option: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  optionIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  optionBody: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 2 },
  optionDesc:  { fontSize: 12, color: "#9CA3AF" },
  optionSep:   { height: 1, backgroundColor: "#F9FAFB", marginHorizontal: 20 },

  cancelBtn: {
    marginHorizontal: 20, marginTop: 8,
    backgroundColor: "#F3F4F6", borderRadius: 16,
    paddingVertical: 15, alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#6B7280" },
});

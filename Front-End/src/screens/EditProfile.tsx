import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../config/colors";
import { patientApi } from "../config/api";

const PROFILE_KEY = "user_profile";

export default function EditProfile({ navigation }: any) {
  const [name, setName]                     = useState("");
  const [lastName, setLastName]             = useState("");
  const [email, setEmail]                   = useState("");
  const [originalEmail, setOriginalEmail]   = useState("");
  const [photo, setPhoto]                   = useState<string | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState("");

  // OTP modal
  const [otpVisible, setOtpVisible]         = useState(false);
  const [otp, setOtp]                       = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading]         = useState(false);
  const [otpError, setOtpError]             = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg]           = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await patientApi.get("/users/me");
        setName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setEmail(data.email ?? "");
        setOriginalEmail(data.email ?? "");
      } catch {}
      const stored = await AsyncStorage.getItem(PROFILE_KEY).catch(() => null);
      if (stored) {
        const profile = JSON.parse(stored);
        setPhoto(profile.photo ?? null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const emailChanged = email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      await patientApi.patch("/users/me", { firstName: name, lastName });
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ name, lastName, email, photo }));

      if (emailChanged) {
        try {
          await patientApi.post("/users/me/request-email-change", { newEmail: email.trim() });
          setOtp(["", "", "", "", "", ""]);
          setOtpError("");
          setResendMsg("");
          setOtpVisible(true);
          startCooldown();
        } catch (emailErr: any) {
          if (emailErr?.response?.status === 409) {
            setSaveError("This email is already registered. Please use a different one.");
          } else {
            setSaveError(emailErr?.response?.data?.error ?? "Could not send OTP. Please try again.");
          }
        }
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      setSaveError(err?.response?.data?.error ?? "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleConfirmOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      await patientApi.post("/users/me/confirm-email-change", { otp: code });
      setOtpVisible(false);
      setOriginalEmail(email.trim());
      navigation.goBack();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setOtpError("This email was taken while verifying. Please use a different one.");
        setOtpVisible(false);
      } else {
        setOtpError(err?.response?.data?.error ?? "Invalid OTP. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendMsg("");
    setOtpError("");
    try {
      await patientApi.post("/users/me/request-email-change", { newEmail: email.trim() });
      setOtp(["", "", "", "", "", ""]);
      startCooldown();
      setResendMsg("A new OTP has been sent.");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setOtpVisible(false);
        setSaveError("This email is already registered. Please use a different one.");
      } else {
        setOtpError(err?.response?.data?.error ?? "Could not resend OTP.");
      }
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photo Access Required",
        "Please allow photo library access in Settings.",
        [{ text: "Cancel", style: "cancel" }, { text: "Open Settings", onPress: () => Linking.openURL("app-settings:") }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={colors.main} />
            : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {photo && photo.length > 0 ? (
              <Image source={{ uri: photo }} style={styles.avatarImage} onError={() => setPhoto(null)} />
            ) : (
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account" size={70} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickImage}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handlePickImage}>
            <Text style={styles.changePhotoText}>Change Profile Picture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>FIRST NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your first name"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>LAST NAME</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, emailChanged && styles.inputHighlighted]}
            value={email}
            onChangeText={(v) => { setEmail(v); setSaveError(""); }}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailChanged && (
            <View style={styles.emailHint}>
              <Ionicons name="mail-outline" size={13} color="#D97706" />
              <Text style={styles.emailHintText}>You'll receive an OTP to verify this new email.</Text>
            </View>
          )}

          {saveError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={otpVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="mail-outline" size={28} color={colors.main} />
            </View>
            <Text style={styles.modalTitle}>Verify New Email</Text>
            <Text style={styles.modalSubtitle}>
              We sent a 6-digit code to{"\n"}
              <Text style={{ fontWeight: "700", color: "#111" }}>{email}</Text>
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputRefs.current[i] = r; }}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null, otpError ? styles.otpBoxError : null]}
                  value={digit}
                  onChangeText={(v) => { handleOtpChange(v, i); setOtpError(""); }}
                  onKeyPress={(e) => handleOtpKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {otpError ? (
              <View style={styles.otpErrorBox}>
                <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                <Text style={styles.otpErrorText}>{otpError}</Text>
              </View>
            ) : null}

            {resendMsg ? (
              <Text style={styles.resendSuccessText}>{resendMsg}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.confirmBtn, otpLoading && { opacity: 0.7 }]}
              onPress={handleConfirmOtp}
              disabled={otpLoading}
              activeOpacity={0.85}
            >
              {otpLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.confirmBtnText}>Confirm</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} style={styles.resendBtn}>
              <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOtpVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  saveText: { fontSize: 16, fontWeight: "500", color: colors.main },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  avatarSection: { alignItems: "center", marginBottom: 36 },
  avatarWrapper: { position: "relative", marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.gray, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  cameraBadge: { position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.main, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff" },
  changePhotoText: { fontSize: 15, color: colors.main, fontWeight: "500" },

  form: { gap: 4 },
  label: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", letterSpacing: 0.8, marginBottom: 6 },
  input: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: "#111", marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  inputHighlighted: { borderColor: "#D97706" },
  emailHint: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  emailHintText: { fontSize: 12, color: "#D97706" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, marginTop: 4 },
  errorText: { flex: 1, fontSize: 13, color: "#DC2626" },

  // OTP modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 28, width: "100%", alignItems: "center" },
  modalIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  otpBox: { width: 44, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: "#E5E7EB", textAlign: "center", fontSize: 22, fontWeight: "700", color: "#111" },
  otpBoxFilled: { borderColor: colors.main, backgroundColor: "#EFF6FF" },
  otpBoxError: { borderColor: "#DC2626" },
  otpErrorBox: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  otpErrorText: { fontSize: 13, color: "#DC2626" },
  resendSuccessText: { fontSize: 13, color: "#16A34A", marginBottom: 12 },
  confirmBtn: { backgroundColor: colors.main, borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center", marginBottom: 14, marginTop: 4 },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resendBtn: { marginBottom: 10 },
  resendText: { fontSize: 14, color: colors.main, fontWeight: "600" },
  resendDisabled: { color: "#9CA3AF" },
  cancelBtn: { paddingVertical: 6 },
  cancelText: { fontSize: 14, color: "#9CA3AF" },
});

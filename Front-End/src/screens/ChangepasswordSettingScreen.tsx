import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";
import { patientApi } from "../config/api";

const RULES = [
  { label: "At least 6 characters",       test: (p: string) => p.length >= 6 },
  { label: "One uppercase letter (A–Z)",   test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",   test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)",             test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function PasswordInput({
  value, onChangeText, placeholder,
}: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  const [secure, setSecure] = useState(true);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secure}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
        <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

function StrengthRule({ label, passed }: { label: string; passed: boolean }) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name={passed ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={passed ? "#16A34A" : "#D1D5DB"}
      />
      <Text style={[styles.ruleText, passed && styles.ruleTextPassed]}>{label}</Text>
    </View>
  );
}

export default function ChangepasswordSettingScreen({ navigation }: any) {
  const [current, setCurrent]   = useState("");
  const [newPass, setNewPass]   = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const allRulesPassed = RULES.every((r) => r.test(newPass));
  const passwordsMatch = newPass.length > 0 && newPass === confirm;
  const canSubmit      = current.length > 0 && allRulesPassed && passwordsMatch && !loading;

  const handleChange = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await patientApi.post("/users/me/change-password", { currentPassword: current, newPassword: newPass });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={72} color="#16A34A" />
          <Text style={styles.successTitle}>Password Changed!</Text>
          <Text style={styles.successSub}>Your password has been updated successfully.</Text>
          <TouchableOpacity style={styles.successButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.form}>

          <View>
            <Text style={styles.label}>CURRENT PASSWORD</Text>
            <PasswordInput value={current} onChangeText={(v) => { setCurrent(v); setError(""); }} placeholder="Enter current password" />
          </View>

          <View>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <PasswordInput value={newPass} onChangeText={(v) => { setNewPass(v); setError(""); }} placeholder="Enter new password" />

            {/* Strength rules */}
            {newPass.length > 0 && (
              <View style={styles.rulesBox}>
                {RULES.map((r) => (
                  <StrengthRule key={r.label} label={r.label} passed={r.test(newPass)} />
                ))}
              </View>
            )}
          </View>

          <View>
            <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
            <PasswordInput value={confirm} onChangeText={(v) => { setConfirm(v); setError(""); }} placeholder="Re-enter new password" />
            {confirm.length > 0 && !passwordsMatch && (
              <Text style={styles.mismatchText}>Passwords do not match.</Text>
            )}
          </View>

        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleChange}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Change Password</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },

  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  form: { gap: 20, marginBottom: 24 },

  label: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", letterSpacing: 0.8, marginBottom: 8 },

  inputWrapper: { backgroundColor: "#fff", borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#111" },
  eyeIcon: { padding: 4 },

  rulesBox: { marginTop: 12, backgroundColor: "#F9FAFB", borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: { fontSize: 13, color: "#9CA3AF" },
  ruleTextPassed: { color: "#16A34A" },

  mismatchText: { fontSize: 12, color: "#DC2626", marginTop: 6, marginLeft: 4 },

  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText: { flex: 1, fontSize: 13, color: "#DC2626" },

  button: { backgroundColor: colors.main, borderRadius: 50, paddingVertical: 18, alignItems: "center" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  successBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  successButton: { backgroundColor: colors.main, borderRadius: 50, paddingVertical: 14, paddingHorizontal: 40, alignItems: "center" },
  successTitle: { fontSize: 24, fontWeight: "800", color: "#111" },
  successSub: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 12 },
});

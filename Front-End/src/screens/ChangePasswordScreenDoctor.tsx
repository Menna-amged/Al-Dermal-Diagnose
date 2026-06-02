import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";
import { common } from "../config/theme";
import { doctorApi } from "../config/api";

export default function ChangePasswordScreen({ navigation }: any) {
  const [oldPassword,     setOldPassword]     = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld,         setShowOld]         = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields."); return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match."); return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      await doctorApi.patch("/profile/me/password", { currentPassword: oldPassword, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChange, show, setShow }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(v) => { onChange(v); setError(""); }}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={colors.darkGray}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[common.rowBetween, styles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color={colors.black} />
          </TouchableOpacity>
          <Text style={common.title}>Change Password</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={72} color="#16A34A" />
          <Text style={styles.successTitle}>Password Changed!</Text>
          <Text style={styles.successSub}>Your password has been updated successfully.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={[common.rowBetween, styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.black} />
        </TouchableOpacity>
        <Text style={common.title}>Change Password</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Field label="Current Password"     value={oldPassword}     onChange={setOldPassword}     show={showOld}     setShow={setShowOld} />
          <Field label="New Password"         value={newPassword}     onChange={setNewPassword}     show={showNew}     setShow={setShowNew} />
          <Field label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} setShow={setShowConfirm} />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Change Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  content:      { padding: 16, marginTop: 8 },
  card:         { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  fieldWrap:    { marginBottom: 16 },
  fieldLabel:   { fontSize: 13, fontWeight: "600", color: colors.darkGray, marginBottom: 8 },
  inputRow:     { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F4F8", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  input:        { flex: 1, fontSize: 15, color: colors.black },
  errorBox:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText:    { flex: 1, fontSize: 13, color: "#DC2626" },
  btn:          { backgroundColor: colors.main, borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  btnText:      { fontSize: 16, fontWeight: "700", color: colors.white },
  successBox:   { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  successTitle: { fontSize: 24, fontWeight: "800", color: colors.black },
  successSub:   { fontSize: 15, color: colors.darkGray, textAlign: "center", lineHeight: 22, marginBottom: 12 },
});

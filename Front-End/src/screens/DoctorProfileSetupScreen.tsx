import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doctorApi } from "../config/api";
import colors from "../config/colors";
import { CommonActions } from "@react-navigation/native";

interface Props {
  navigation: any;
  setIsProfileComplete: (v: boolean) => void;
}

const SPECIALTIES = [
  "Acne & Rosacea",
  "Chickenpox",
  "Monkeypox",
  "Eczema",
  "Vitiligo",
  "Actinic Keratosis",
  "Skin Cancer",
  "Nail Fungus",
];

export default function DoctorProfileSetupScreen({ navigation, setIsProfileComplete }: Props) {
  const [firstName, setFirstName]   = useState("");
  const [lastName,  setLastName]    = useState("");
  const [phone,     setPhone]       = useState("");
  const [specialty, setSpecialty]   = useState<string[]>([]);
  const [clinicName, setClinicName] = useState("");
  const [bio,       setBio]         = useState("");
  const [loading,   setLoading]     = useState(false);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || !phone.trim() || specialty.length === 0 || !clinicName.trim() || !bio.trim()) {
      const msg = "Please fill in all required fields.";
      if (Platform.OS === "web") { alert(msg); } else { Alert.alert("Missing Fields", msg); }
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await doctorApi.patch(
        "/profile/me/complete",
        { firstName: firstName.trim(), lastName: lastName.trim() || undefined, phone: phone.trim(), specialty: specialty.join(", "), clinicName: clinicName.trim(), bio: bio.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await AsyncStorage.setItem("isProfileComplete", JSON.stringify(true));
      await AsyncStorage.setItem("firstName", firstName.trim());
      setIsProfileComplete(true);
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Home" }] }));
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Could not save profile. Please try again.";
      if (Platform.OS === "web") { alert(msg); } else { Alert.alert("Error", msg); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add" size={36} color={colors.white} />
            </View>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Before you get started, tell us a bit about yourself. This helps patients know who they're working with.
            </Text>
          </View>

          <View style={styles.form}>
            <Field label="First Name *" icon="person">
              <TextInput
                style={styles.input}
                placeholder="e.g. Ahmed"
                placeholderTextColor={colors.gray}
                value={firstName}
                onChangeText={setFirstName}
              />
            </Field>

            <Field label="Last Name" icon="person-outline">
              <TextInput
                style={styles.input}
                placeholder="e.g. Hassan"
                placeholderTextColor={colors.gray}
                value={lastName}
                onChangeText={setLastName}
              />
            </Field>

            <Field label="Phone Number *" icon="call">
              <TextInput
                style={styles.input}
                placeholder="+20 XXX XXX XXXX"
                placeholderTextColor={colors.gray}
                value={phone}
                onChangeText={t => setPhone(t.replace(/[^0-9+]/g, ''))}
                keyboardType="phone-pad"
              />
            </Field>

            <Field label="Area of Expertise *" icon="medical">
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, specialty.length === 0 && { color: colors.gray }]} numberOfLines={2}>
                  {specialty.length === 0 ? "Select your area of expertise" : specialty.join(", ")}
                </Text>
                <Ionicons
                  name={showSpecialtyPicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.darkGray}
                />
              </TouchableOpacity>
              {showSpecialtyPicker && (
                <View style={styles.dropdown}>
                  {SPECIALTIES.map((s) => {
                    const selected = specialty.includes(s);
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.dropdownItem, selected && styles.dropdownItemActive]}
                        onPress={() => setSpecialty(prev =>
                          prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                        )}
                      >
                        <Text style={[styles.dropdownText, selected && styles.dropdownTextActive]}>{s}</Text>
                        {selected && <Ionicons name="checkmark" size={16} color={colors.main} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Field>

            <Field label="Clinic / Hospital *" icon="business">
              <TextInput
                style={styles.input}
                placeholder="e.g. Cairo University Hospital"
                placeholderTextColor={colors.gray}
                value={clinicName}
                onChangeText={setClinicName}
              />
            </Field>

            <Field label="Bio *" icon="document-text">
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Brief professional summary — patients will see this..."
                placeholderTextColor={colors.gray}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Field>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitText}>Save & Continue</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabel}>
        <Ionicons name={icon as any} size={16} color={colors.main} style={{ marginRight: 6 }} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.inputWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: colors.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  form: {
    gap: 20,
    marginBottom: 28,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  inputWrap: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1a1a2e",
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 13,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerText: {
    fontSize: 15,
    color: "#1a1a2e",
    flex: 1,
  },
  dropdown: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownItemActive: {
    backgroundColor: "#eef3ff",
  },
  dropdownText: {
    fontSize: 15,
    color: "#333",
  },
  dropdownTextActive: {
    color: colors.main,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: colors.main,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

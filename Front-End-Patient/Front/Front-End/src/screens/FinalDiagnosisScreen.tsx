import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import ScreenHeader from "../components/layout/ScreenHeader";
import DiagnosisToggle from "../components/diagnosis/DiagnosisToggle";
import DiseaseDropdown from "../components/diagnosis/DiseaseDropdown";
import Toast from "../components/common/Toast";

export default function FinalDiagnosisScreen({ navigation, route }: any) {
  const { patient } = route.params ?? {};
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string>(patient?.condition ?? "Eczema");
  const [notes, setNotes] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastText, setToastText] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const showToast = (text: string, type: "success" | "error") => {
    setToastText(text);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSubmit = () => {
    if (isCorrect === null) {
      showToast("Please confirm if the model prediction is correct or not.", "error");
      return;
    }

    showToast(`Notes sent successfully to ${patient?.name ?? "the patient"}.`, "success");
    setNotes("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScreenHeader title="Final Diagnosis" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Model Prediction Accuracy</Text>
        <DiagnosisToggle value={isCorrect} onChange={setIsCorrect} />

        <Text style={styles.sectionTitle}>Final Diagnosis</Text>
        <DiseaseDropdown value={selectedDisease} onChange={setSelectedDisease} />

        <Text style={styles.sectionTitle}>Doctor's Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Write your notes here... (these will be sent to the patient)"
          placeholderTextColor={colors.darkGray}
          multiline
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />

        {toastVisible && (
          <Toast type={toastType} message={toastText} onClose={() => setToastVisible(false)} />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.black, marginTop: 24, marginBottom: 14 },
  notesInput: { backgroundColor: "#F2F4F8", borderRadius: 14, padding: 14, fontSize: 14, color: colors.black, minHeight: 160, lineHeight: 22 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  submitBtn: { backgroundColor: colors.main, borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  submitText: { fontSize: 16, fontWeight: "700", color: colors.white },
});

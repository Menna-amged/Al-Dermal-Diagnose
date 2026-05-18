import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

const DISEASES = [
  "Skin Cancer", "Actinic Keratosis", "Monkeypox", "Chickenpox",
  "Eczema", "Vitiligo", "Nail Fungus", "Acne & Rosacea", "Normal",
];

const QUICK_TAGS = ["Eczema", "Psoriasis", "Melanoma", "Acne & Rosacea"];

type Props = {
  value: string;
  onChange: (disease: string) => void;
};

export default function DiseaseDropdown({ value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = DISEASES.filter((d) => d.toLowerCase().includes(query.toLowerCase()));

  const select = (disease: string) => {
    onChange(disease);
    setQuery(disease);
    setOpen(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.searchBox} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Ionicons name="search-outline" size={18} color={colors.darkGray} />
        <TextInput
          style={styles.input}
          placeholder="Search or select disease"
          placeholderTextColor={colors.darkGray}
          value={query}
          onChangeText={(t) => { setQuery(t); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.darkGray} />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {filtered.map((disease) => (
            <TouchableOpacity key={disease} style={styles.item} onPress={() => select(disease)}>
              <Text style={[styles.itemText, value === disease && styles.itemTextActive]}>{disease}</Text>
              {value === disease && <Ionicons name="checkmark" size={16} color={colors.main} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {QUICK_TAGS.map((tag) => (
          <TouchableOpacity key={tag} style={[styles.tag, value === tag && styles.tagActive]} onPress={() => select(tag)} activeOpacity={0.8}>
            <Text style={[styles.tagText, value === tag && styles.tagTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F4F8", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  input: { flex: 1, fontSize: 14, color: "#111" },
  dropdown: { backgroundColor: "white", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", marginTop: 4, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4, zIndex: 10 },
  item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemText: { fontSize: 14, color: "#111" },
  itemTextActive: { color: colors.main, fontWeight: "600" },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: "#F2F4F8", borderWidth: 1, borderColor: "#E5E7EB" },
  tagActive: { backgroundColor: colors.main, borderColor: colors.main },
  tagText: { fontSize: 13, color: colors.darkGray, fontWeight: "500" },
  tagTextActive: { color: "white", fontWeight: "600" },
});

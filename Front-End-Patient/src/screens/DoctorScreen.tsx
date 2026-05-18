import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Image, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NavBar from "../components/NavBar";

const doctors = [
  { id: 1, name: "Dr . Sarah Smith", title: "Senior Dermatologist . 15 years exp.", tag: "Acne Vulgaris", rating: 4.9, image: "https://randomuser.me/api/portraits/women/44.jpg", email: "sarah.smith@clinic.com" },
  { id: 2, name: "Dr . James Chen", title: "Dermatologist . 8 years exp.", tag: "Eczema", rating: 4.8, image: "https://randomuser.me/api/portraits/men/32.jpg", email: "james.chen@clinic.com" },
  { id: 3, name: "Dr . Emily Davis", title: "Dermatologist . 6 years exp.", tag: "Psoriasis", rating: 5.0, image: "https://randomuser.me/api/portraits/women/65.jpg", email: "emily.davis@clinic.com" },
  { id: 4, name: "Dr . Michael Brown", title: "Senior Dermatologist . 20 years exp.", tag: "Melanoma", rating: 5.2, image: "https://randomuser.me/api/portraits/men/75.jpg", email: "michael.brown@clinic.com" },
];

export default function DoctorScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const filtered = doctors.filter((doc) => {
    const q = query.toLowerCase();
    return doc.name.toLowerCase().includes(q) || doc.tag.toLowerCase().includes(q) || doc.title.toLowerCase().includes(q);
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certified Dermatologists</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search by name or clinic" placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} autoCorrect={false} />
        {query.length > 0 && <TouchableOpacity onPress={() => setQuery("")}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>}
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{query.length > 0 ? `Results (${filtered.length})` : "Recommended"}</Text>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No doctors found</Text>
          </View>
        ) : filtered.map((doc) => (
          <View key={doc.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Image source={{ uri: doc.image }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <View style={styles.tagBadge}><Text style={styles.tagText}>{doc.tag}</Text></View>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{doc.rating}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.profileBtn}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.profileBtnText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emailBtn}>
                <Ionicons name="mail" size={16} color="#fff" />
                <Text style={styles.emailBtnText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
      <NavBar navigation={navigation} activeTab="Doctor" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#E5E7EB", marginHorizontal: 16, marginBottom: 16, borderRadius: 12, paddingHorizontal: 12, borderWidth: 2, borderColor: "#2563EB" },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#111" },
  listContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 12 },
  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: "#9CA3AF" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  avatar: { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  info: { flex: 1 },
  docName: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 3 },
  docTitle: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  tagBadge: { alignSelf: "flex-start", backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: "#2563EB", fontWeight: "500" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 13, fontWeight: "600", color: "#F59E0B" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  cardActions: { flexDirection: "row", gap: 10 },
  profileBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#F3F4F6", borderRadius: 30, paddingVertical: 10 },
  profileBtnText: { color: "#6B7280", fontWeight: "600", fontSize: 14 },
  emailBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#2563EB", borderRadius: 30, paddingVertical: 10 },
  emailBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

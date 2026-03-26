import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Image, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NavBar from "../components/NavBar";

const reports = [
  { id: 1, condition: "Possible Eczema (92%)", date: "Oct 12,2023", confidence: "HIGH CONFIDENCE", confidenceColor: "#FEE2E2", confidenceTextColor: "#EF4444", image: "https://www.dermnetnz.org/assets/Uploads/eczema/atopic-dermatitis-005__FocusFillWzMwMCwzMDAsInkiLDQ0XQ.jpg", type: "Reports" },
  { id: 2, condition: "Contact Dermatitis (61%)", date: "Dec 20,2023", confidence: "MEDIUM CONFIDENCE", confidenceColor: "#FEF9C3", confidenceTextColor: "#CA8A04", image: "https://www.dermnetnz.org/assets/Uploads/contact-dermatitis/contact-dermatitis-hand-001__FocusFillWzMwMCwzMDAsInkiLDQ0XQ.jpg", type: "Reports" },
  { id: 3, condition: "Acne Vulgaris (55%)", date: "Jul 22,2023", confidence: "MEDIUM CONFIDENCE", confidenceColor: "#FEF9C3", confidenceTextColor: "#CA8A04", image: "https://www.dermnetnz.org/assets/Uploads/acne/acne-vulgaris-006__FocusFillWzMwMCwzMDAsInkiLDQ0XQ.jpg", type: "Photos" },
];

const tabs = ["All", "Reports", "Photos", "Doctors"];

export default function HistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [imgErrors, setImgErrors] = useState<{ [key: number]: boolean }>({});

  const filtered = reports.filter((r) => {
    const matchTab = activeTab === "All" || r.type === activeTab;
    const matchQuery = r.condition.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={22} color="#111" /></TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} />
        {query.length > 0 && <TouchableOpacity onPress={() => setQuery("")}><Ionicons name="close-circle" size={16} color="#9CA3AF" /></TouchableOpacity>}
      </View>

      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        ) : filtered.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.badge, { backgroundColor: item.confidenceColor }]}>
              <Text style={[styles.badgeText, { color: item.confidenceTextColor }]}>{item.confidence}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <Text style={styles.conditionText}>{item.condition}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <TouchableOpacity style={styles.viewRow}>
                  <Text style={styles.viewText}>View Analysis</Text>
                  <Ionicons name="arrow-forward" size={14} color="#2563EB" />
                </TouchableOpacity>
              </View>
              {imgErrors[item.id] ? (
                <View style={styles.imageFallback}><Ionicons name="image-outline" size={28} color="#D1D5DB" /></View>
              ) : (
                <Image source={{ uri: item.image }} style={styles.cardImage} onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))} />
              )}
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
      <NavBar navigation={navigation} activeTab="History" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#E5E7EB", marginHorizontal: 16, marginBottom: 14, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#111" },
  tabsRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: "#E5E7EB", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  tabTextActive: { color: "#111", fontWeight: "700" },
  list: { paddingHorizontal: 16 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  seeAll: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardInfo: { flex: 1, gap: 6 },
  conditionText: { fontSize: 15, fontWeight: "700", color: "#111" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 12, color: "#6B7280" },
  viewRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewText: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
  cardImage: { width: 70, height: 70, borderRadius: 10, marginLeft: 12, backgroundColor: "#F3F4F6" },
  imageFallback: { width: 70, height: 70, borderRadius: 10, marginLeft: 12, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: "#9CA3AF" },
});

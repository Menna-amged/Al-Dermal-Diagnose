import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Image, StatusBar,
  FlatList, ActivityIndicator, Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { patientApi } from "../config/api";
import NavBar from "../components/NavBar";
import colors from "../config/colors";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 2;

type ScanRecord = { id: string; uri: string; disease: string; confidence: number; date: string };
type Consultation = {
  id: string; disease: string; confidence: number; status: string; createdAt: string;
  doctor: { user: { firstName: string; lastName: string } };
};

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "#FEF9C3", text: "#CA8A04", label: "Pending" },
  OPEN:    { bg: "#DCFCE7", text: "#16A34A", label: "Active" },
  CLOSED:  { bg: "#F3F4F6", text: "#6B7280", label: "Closed" },
};

function confidenceLabel(conf: number): { label: string; bg: string; text: string } {
  if (conf >= 80) return { label: "High", bg: "#FEE2E2", text: "#EF4444" };
  if (conf >= 60) return { label: "Medium", bg: "#FEF9C3", text: "#CA8A04" };
  return { label: "Low", bg: "#DCFCE7", text: "#16A34A" };
}

const TABS = ["All", "Photos", "Doctors"];

export default function HistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab]         = useState("All");
  const [query, setQuery]                 = useState("");
  const [scans, setScans]                 = useState<ScanRecord[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading]             = useState(true);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [raw, { data }] = await Promise.all([
          AsyncStorage.getItem("skin_scan_history"),
          patientApi.get("/consultations"),
        ]);
        if (!cancelled) {
          setScans(raw ? JSON.parse(raw) : []);
          setConsultations(data);
        }
      } catch {
        const raw = await AsyncStorage.getItem("skin_scan_history").catch(() => null);
        if (!cancelled) setScans(raw ? JSON.parse(raw) : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []));

  const filteredScans = scans.filter((s) =>
    s.disease.toLowerCase().includes(query.toLowerCase())
  );
  const filteredConsults = consultations.filter((c) => {
    const name = `${c.doctor?.user?.firstName ?? ""} ${c.doctor?.user?.lastName ?? ""}`.toLowerCase();
    return c.disease.toLowerCase().includes(query.toLowerCase()) || name.includes(query.toLowerCase());
  });

  // ── Photos tab ─────────────────────────────────────────────────────────────
  const PhotosTab = () => (
    filteredScans.length === 0 ? (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="camera-outline" size={36} color={colors.main} />
        </View>
        <Text style={styles.emptyTitle}>No photos yet</Text>
        <Text style={styles.emptySub}>Scan your skin and your photos will appear here.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("Camera")} activeOpacity={0.85}>
          <Ionicons name="camera" size={16} color="#fff" />
          <Text style={styles.emptyBtnText}>Start a Scan</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={styles.photoGrid}>
        {filteredScans.map((item) => {
          const cl = confidenceLabel(item.confidence);
          return (
            <View key={item.id} style={styles.photoCard}>
              <View style={styles.photoImgWrap}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.photoImg}
                  resizeMode="cover"
                />
                <View style={[styles.confBadge, { backgroundColor: cl.bg }]}>
                  <Text style={[styles.confBadgeText, { color: cl.text }]}>{cl.label}</Text>
                </View>
              </View>
              <View style={styles.photoInfo}>
                <Text style={styles.photoDisease} numberOfLines={2}>{item.disease}</Text>
                <View style={styles.photoMeta}>
                  <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                  <Text style={styles.photoDate}>
                    {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <View style={[styles.confBar]}>
                  <View style={[styles.confFill, { width: `${item.confidence}%` as any, backgroundColor: cl.text }]} />
                </View>
                <Text style={[styles.confPct, { color: cl.text }]}>{item.confidence}% confidence</Text>
              </View>
            </View>
          );
        })}
      </View>
    )
  );

  // ── Doctors tab ────────────────────────────────────────────────────────────
  const DoctorsTab = () => (
    filteredConsults.length === 0 ? (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconCircle}>
          <MaterialCommunityIcons name="doctor" size={36} color={colors.main} />
        </View>
        <Text style={styles.emptyTitle}>No consultations yet</Text>
        <Text style={styles.emptySub}>After you consult a doctor it will appear here.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("Camera")} activeOpacity={0.85}>
          <Ionicons name="camera" size={16} color="#fff" />
          <Text style={styles.emptyBtnText}>Start a Scan</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={styles.consultList}>
        {filteredConsults.map((item) => {
          const firstName = item.doctor?.user?.firstName ?? "";
          const lastName  = item.doctor?.user?.lastName  ?? "";
          const doctorName = `Dr. ${firstName} ${lastName}`.trim();
          const initials   = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "DR";
          const st         = STATUS_COLOR[item.status] ?? STATUS_COLOR.CLOSED;
          const cl         = confidenceLabel(item.confidence);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.consultCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Chat", {
                consultationId: item.id,
                doctorName,
                disease: item.disease,
              })}
            >
              {/* Left accent */}
              <View style={[styles.consultAccent, { backgroundColor: st.text }]} />

              <View style={styles.consultAvatar}>
                <Text style={styles.consultAvatarText}>{initials}</Text>
              </View>

              <View style={styles.consultBody}>
                <View style={styles.consultTopRow}>
                  <Text style={styles.consultDoctorName}>{doctorName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>
                <View style={styles.consultDiseaseRow}>
                  <Ionicons name="medkit-outline" size={12} color={colors.main} />
                  <Text style={styles.consultDisease}>{item.disease}</Text>
                  <View style={[styles.confChip, { backgroundColor: cl.bg }]}>
                    <Text style={[styles.confChipText, { color: cl.text }]}>{item.confidence}%</Text>
                  </View>
                </View>
                <View style={styles.consultDateRow}>
                  <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                  <Text style={styles.consultDate}>
                    {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          );
        })}
      </View>
    )
  );

  // ── All tab ────────────────────────────────────────────────────────────────
  const AllTab = () => {
    const recentScans    = filteredScans.slice(0, 4);
    const recentConsults = filteredConsults.slice(0, 3);
    const hasAnything    = recentScans.length > 0 || recentConsults.length > 0;

    if (!hasAnything) {
      return (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="time-outline" size={36} color={colors.main} />
          </View>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySub}>Your scan photos and doctor consultations will appear here.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate("Camera")} activeOpacity={0.85}>
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={styles.emptyBtnText}>Start a Scan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {recentScans.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              {filteredScans.length > 4 && (
                <TouchableOpacity onPress={() => setActiveTab("Photos")}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {recentScans.map((item) => {
                const cl = confidenceLabel(item.confidence);
                return (
                  <View key={item.id} style={styles.hCard}>
                    <View style={styles.hImgWrap}>
                      <Image source={{ uri: item.uri }} style={styles.hImg} resizeMode="cover" />
                      <View style={[styles.confBadge, { backgroundColor: cl.bg }]}>
                        <Text style={[styles.confBadgeText, { color: cl.text }]}>{cl.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.hDisease} numberOfLines={2}>{item.disease}</Text>
                    <Text style={styles.hDate}>
                      {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {recentConsults.length > 0 && (
          <>
            <View style={[styles.sectionRow, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Recent Consultations</Text>
              {filteredConsults.length > 3 && (
                <TouchableOpacity onPress={() => setActiveTab("Doctors")}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.consultList}>
              {recentConsults.map((item) => {
                const firstName  = item.doctor?.user?.firstName ?? "";
                const lastName   = item.doctor?.user?.lastName  ?? "";
                const doctorName = `Dr. ${firstName} ${lastName}`.trim();
                const initials   = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "DR";
                const st         = STATUS_COLOR[item.status] ?? STATUS_COLOR.CLOSED;
                const cl         = confidenceLabel(item.confidence);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.consultCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("Chat", {
                      consultationId: item.id, doctorName, disease: item.disease,
                    })}
                  >
                    <View style={[styles.consultAccent, { backgroundColor: st.text }]} />
                    <View style={styles.consultAvatar}>
                      <Text style={styles.consultAvatarText}>{initials}</Text>
                    </View>
                    <View style={styles.consultBody}>
                      <View style={styles.consultTopRow}>
                        <Text style={styles.consultDoctorName}>{doctorName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                        </View>
                      </View>
                      <View style={styles.consultDiseaseRow}>
                        <Ionicons name="medkit-outline" size={12} color={colors.main} />
                        <Text style={styles.consultDisease}>{item.disease}</Text>
                        <View style={[styles.confChip, { backgroundColor: cl.bg }]}>
                          <Text style={[styles.confChipText, { color: cl.text }]}>{item.confidence}%</Text>
                        </View>
                      </View>
                      <View style={styles.consultDateRow}>
                        <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                        <Text style={styles.consultDate}>
                          {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.headerCountRow}>
          {scans.length > 0 && (
            <View style={styles.headerBadge}>
              <Ionicons name="camera-outline" size={12} color={colors.main} />
              <Text style={styles.headerBadgeText}>{scans.length}</Text>
            </View>
          )}
          {consultations.length > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: "#DCFCE7" }]}>
              <MaterialCommunityIcons name="doctor" size={12} color="#16A34A" />
              <Text style={[styles.headerBadgeText, { color: "#16A34A" }]}>{consultations.length}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scans or doctors…"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.main} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "All"    && <AllTab />}
          {activeTab === "Photos" && <PhotosTab />}
          {activeTab === "Doctors" && <DoctorsTab />}
        </ScrollView>
      )}

      <NavBar navigation={navigation} activeTab="History" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  headerCountRow: { flexDirection: "row", gap: 8 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, fontWeight: "700", color: colors.main },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#E5E7EB", marginHorizontal: 16, marginBottom: 14, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#111" },

  tabsRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: "#E5E7EB", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  tabTextActive: { color: "#111", fontWeight: "700" },

  scroll: { paddingHorizontal: 16 },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },

  // ── Section headers ──
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  seeAll: { fontSize: 13, color: colors.main, fontWeight: "600" },

  // ── Empty states ──
  emptyBox: { alignItems: "center", marginTop: 48, gap: 10, paddingHorizontal: 24 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 21 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.main, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // ── Photos grid ──
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  photoCard: { width: PHOTO_SIZE, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  photoImgWrap: { width: "100%", height: PHOTO_SIZE * 0.85, position: "relative" },
  photoImg: { width: "100%", height: "100%", backgroundColor: "#E5E7EB" },
  confBadge: { position: "absolute", top: 8, right: 8, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  confBadgeText: { fontSize: 10, fontWeight: "700" },
  photoInfo: { padding: 10, gap: 4 },
  photoDisease: { fontSize: 13, fontWeight: "700", color: "#111", lineHeight: 18 },
  photoMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  photoDate: { fontSize: 10, color: "#9CA3AF" },
  confBar: { height: 4, backgroundColor: "#F3F4F6", borderRadius: 2, overflow: "hidden", marginTop: 4 },
  confFill: { height: "100%", borderRadius: 2 },
  confPct: { fontSize: 10, fontWeight: "600" },

  // ── Horizontal scroll (All tab scans) ──
  hScroll: { paddingBottom: 4, gap: 12 },
  hCard: { width: 130, backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  hImgWrap: { width: "100%", height: 110, position: "relative" },
  hImg: { width: "100%", height: "100%", backgroundColor: "#E5E7EB" },
  hDisease: { fontSize: 12, fontWeight: "700", color: "#111", padding: 8, paddingBottom: 2, lineHeight: 16 },
  hDate: { fontSize: 10, color: "#9CA3AF", paddingHorizontal: 8, paddingBottom: 8 },

  // ── Consultation cards ──
  consultList: { gap: 10 },
  consultCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, overflow: "hidden" },
  consultAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  consultAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.main, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  consultAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  consultBody: { flex: 1, gap: 4 },
  consultTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  consultDoctorName: { fontSize: 14, fontWeight: "700", color: "#111", flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  consultDiseaseRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  consultDisease: { fontSize: 12, color: colors.main, fontWeight: "600", flex: 1 },
  confChip: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  confChipText: { fontSize: 10, fontWeight: "700" },
  consultDateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  consultDate: { fontSize: 11, color: "#9CA3AF" },
});

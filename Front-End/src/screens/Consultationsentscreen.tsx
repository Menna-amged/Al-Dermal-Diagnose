import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConsultationSentScreen({ navigation, route }: any) {
  const { consultation } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        </View>

        <Text style={styles.title}>Consultation Sent!</Text>
        <Text style={styles.subtitle}>
          Your case has been sent to a doctor. You'll be notified when they reply.
        </Text>

        {/* Details card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Condition</Text>
            <Text style={styles.cardValue}>{consultation.disease}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Status</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardValue}>
              {new Date(consultation.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("History")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>View My Consultations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  iconCircle: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#111", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  cardLabel: { fontSize: 13, color: "#9CA3AF" },
  cardValue: { fontSize: 14, fontWeight: "600", color: "#111" },
  divider: { height: 1, backgroundColor: "#F3F4F6" },
  pendingBadge: { backgroundColor: "#FEF9C3", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pendingText: { fontSize: 12, fontWeight: "600", color: "#CA8A04" },
  primaryBtn: { width: "100%", backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginBottom: 12 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: { paddingVertical: 10 },
  secondaryBtnText: { fontSize: 14, color: "#9CA3AF" },
});
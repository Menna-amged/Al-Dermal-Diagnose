import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, Easing,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { patientApi } from "../config/api";
import colors from "../config/colors";

type Status = "PENDING" | "OPEN" | "CLOSED";

const MAX_POLL_ATTEMPTS = 120;

export default function ConsultationSentScreen({ navigation, route }: any) {
  const { consultation } = route.params;
  const [status, setStatus]     = useState<Status>(consultation.status ?? "PENDING");
  const [denyReason, setDenyReason] = useState<string | null>(consultation.denyReason ?? null);
  const [countdown, setCountdown] = useState(3);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttemptsRef = useRef(0);

  const doctorName = consultation.doctorName ?? consultation.doctor?.user?.firstName ?? "Doctor";

  // ── Pulse animation rings ──────────────────────────────────────────────
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  const pulseLoop = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0, duration: 0, useNativeDriver: true,
        }),
      ])
    );

  useEffect(() => {
    const a1 = pulseLoop(ring1, 0);
    const a2 = pulseLoop(ring2, 500);
    const a3 = pulseLoop(ring3, 1000);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  // ── Accepted scale-in animation ────────────────────────────────────────
  const acceptedScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (status === "OPEN") {
      Animated.spring(acceptedScale, {
        toValue: 1, bounciness: 12, useNativeDriver: true,
      }).start();
    }
  }, [status]);

  // ── Polling ────────────────────────────────────────────────────────────
  const poll = async () => {
    pollAttemptsRef.current += 1;
    if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
      clearInterval(intervalRef.current!);
      return;
    }
    try {
      const { data } = await patientApi.get(`/consultations/${consultation.id}`);
      setStatus(data.status);
      if (data.status !== "PENDING") {
        clearInterval(intervalRef.current!);
        if (data.status === "CLOSED") {
          if (data.denyReason) setDenyReason(data.denyReason);
          // Refund reflected in DB — pull fresh token balance into AsyncStorage
          patientApi.get("/users/me").then(({ data: me }) => {
            if (me.tokens !== undefined) {
              AsyncStorage.setItem("user_tokens", String(me.tokens));
            }
          }).catch(() => {});
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (status === "PENDING") {
      intervalRef.current = setInterval(poll, 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  // ── Auto-navigate to chat when accepted ───────────────────────────────
  useEffect(() => {
    if (status !== "OPEN") return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          navigation.replace("Chat", {
            consultationId: consultation.id,
            doctorName,
            disease: consultation.disease,
          });
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // ── Choose another doctor ─────────────────────────────────────────────
  const handleChooseAnother = async () => {
    const val = await AsyncStorage.getItem("user_tokens");
    const tokens = val ? parseInt(val) : 0;
    navigation.navigate("ConsultDoctorSelect", {
      imageUri:   null,
      disease:    consultation.disease,
      confidence: consultation.confidence ?? 0,
      tokens,
    });
  };

  // ─────────────────────────────────────────────────────────────────────
  // PENDING
  // ─────────────────────────────────────────────────────────────────────
  if (status === "PENDING") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

        <View style={styles.centered}>

          {/* Pulsing rings */}
          <View style={styles.pulseWrapper}>
            {[ring1, ring2, ring3].map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.pulseRing,
                  {
                    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.35, 0] }),
                    transform: [{
                      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }),
                    }],
                  },
                ]}
              />
            ))}

            {/* Center circle */}
            <View style={styles.centerCircle}>
              <MaterialCommunityIcons name="clock-outline" size={40} color={colors.main} />
            </View>
          </View>

          <Text style={styles.pendingTitle}>Waiting for Doctor</Text>
          <Text style={styles.pendingSubtitle}>
            Your request has been sent to{"\n"}
            <Text style={styles.bold}>{doctorName}</Text>
          </Text>

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="medkit-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>{consultation.disease}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="doctor" size={16} color="#9CA3AF" />
              <Text style={styles.infoLabel}>Doctor</Text>
              <Text style={styles.infoValue}>{doctorName}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="ellipse" size={10} color="#F59E0B" style={{ marginHorizontal: 3 }} />
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            </View>
          </View>

          <Text style={styles.hintText}>
            You'll be notified as soon as the doctor responds
          </Text>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("MyConsultations")}>
            <Ionicons name="list-outline" size={16} color={colors.main} />
            <Text style={styles.secondaryBtnText}>View My Consultations</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.ghostBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // OPEN — accepted, auto-navigating to chat
  // ─────────────────────────────────────────────────────────────────────
  if (status === "OPEN") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

        <View style={styles.centered}>
          <Animated.View style={[styles.acceptedCircle, { transform: [{ scale: acceptedScale }] }]}>
            <Ionicons name="checkmark-circle" size={90} color="#16A34A" />
          </Animated.View>

          <Text style={styles.acceptedTitle}>Consultation Accepted!</Text>
          <Text style={styles.acceptedSubtitle}>
            <Text style={styles.bold}>{doctorName}</Text>
            {" "}is ready to chat with you.
          </Text>

          <View style={[styles.infoCard, { marginTop: 24 }]}>
            <View style={styles.infoRow}>
              <Ionicons name="medkit-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>{consultation.disease}</Text>
            </View>
          </View>

          {/* Countdown */}
          <View style={styles.countdownBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.main} />
            <Text style={styles.countdownText}>
              Opening chat in <Text style={styles.countdownNum}>{countdown}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace("Chat", {
              consultationId: consultation.id,
              doctorName,
              disease: consultation.disease,
            })}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Open Chat Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // CLOSED — declined
  // ─────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

      <View style={styles.centered}>
        <View style={styles.declinedCircle}>
          <Ionicons name="close-circle" size={90} color="#DC2626" />
        </View>

        <Text style={styles.declinedTitle}>Request Declined</Text>
        <Text style={styles.declinedSubtitle}>
          {doctorName} was unable to take your case.
        </Text>

        {denyReason ? (
          <View style={styles.reasonCard}>
            <View style={styles.reasonCardHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={15} color="#DC2626" />
              <Text style={styles.reasonCardLabel}>Doctor's reason</Text>
            </View>
            <Text style={styles.reasonCardText}>{denyReason}</Text>
          </View>
        ) : null}

        <Text style={styles.refundNote}>
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" /> Your token has been refunded.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleChooseAnother} activeOpacity={0.85}>
          <MaterialCommunityIcons name="doctor" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Choose Another Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.ghostBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#F8FAFF" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },

  // ── Pulse ──
  pulseWrapper: { width: 120, height: 120, alignItems: "center", justifyContent: "center", marginBottom: 32 },
  pulseRing: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.main,
  },
  centerCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.main, shadowOpacity: 0.18, shadowRadius: 12, elevation: 4,
  },

  pendingTitle:    { fontSize: 24, fontWeight: "800", color: "#111", marginBottom: 8, textAlign: "center" },
  pendingSubtitle: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 24, marginBottom: 28 },

  // ── Info card ──
  infoCard: {
    width: "100%", backgroundColor: "#fff", borderRadius: 18,
    paddingHorizontal: 20, paddingVertical: 6,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 20,
  },
  infoRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 10 },
  infoDivider: { height: 1, backgroundColor: "#F3F4F6" },
  infoLabel:  { fontSize: 13, color: "#9CA3AF", flex: 1 },
  infoValue:  { fontSize: 14, fontWeight: "700", color: "#111" },
  pendingBadge: {
    backgroundColor: "#FEF9C3", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  pendingBadgeText: { fontSize: 12, fontWeight: "700", color: "#CA8A04" },

  hintText: { fontSize: 12, color: "#9CA3AF", textAlign: "center", marginBottom: 24 },

  // ── Accepted ──
  acceptedCircle:   { marginBottom: 24 },
  acceptedTitle:    { fontSize: 26, fontWeight: "800", color: "#16A34A", marginBottom: 8, textAlign: "center" },
  acceptedSubtitle: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 24 },

  countdownBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#EFF6FF", borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 12,
    marginTop: 4, marginBottom: 20,
  },
  countdownText: { fontSize: 14, color: "#374151" },
  countdownNum:  { fontSize: 18, fontWeight: "800", color: colors.main },

  // ── Declined ──
  declinedCircle:   { marginBottom: 24 },
  declinedTitle:    { fontSize: 24, fontWeight: "800", color: "#DC2626", marginBottom: 8, textAlign: "center" },
  declinedSubtitle: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 24, marginBottom: 16 },
  reasonCard:       { width: "100%", backgroundColor: "#FEF2F2", borderRadius: 14, padding: 14, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: "#DC2626" },
  reasonCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  reasonCardLabel:  { fontSize: 12, fontWeight: "700", color: "#DC2626", textTransform: "uppercase", letterSpacing: 0.4 },
  reasonCardText:   { fontSize: 14, color: "#374151", lineHeight: 20 },
  refundNote:       { fontSize: 13, color: "#16A34A", fontWeight: "600", marginBottom: 24 },

  // ── Buttons ──
  primaryBtn: {
    width: "100%", backgroundColor: colors.main, borderRadius: 16, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 12, paddingHorizontal: 20,
    backgroundColor: "#EFF6FF", borderRadius: 14, marginBottom: 12,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600", color: colors.main },
  ghostBtn:     { paddingVertical: 10 },
  ghostBtnText: { fontSize: 14, color: "#9CA3AF" },

  bold: { fontWeight: "700", color: "#111" },
});

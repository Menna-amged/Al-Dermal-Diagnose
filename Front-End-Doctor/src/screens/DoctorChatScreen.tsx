import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../config/api";
import colors from "../config/colors";

const CLOSE_MIN_MS = 24 * 60 * 60 * 1000;

type Message = {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: string;
  text: string;
  createdAt: string;
};

function formatCountdown(acceptedAt: string): string {
  const elapsed   = Date.now() - new Date(acceptedAt).getTime();
  const remaining = CLOSE_MIN_MS - elapsed;
  if (remaining <= 0) return "";
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function DoctorChatScreen({ route, navigation }: any) {
  const { consultationId, patientName, disease } = route.params;

  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState<string>("PENDING");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [accepting, setAccepting]   = useState(false);
  const [tick, setTick]             = useState(0);        // forces re-render every minute
  const flatListRef                 = useRef<FlatList>(null);

  // Tick every minute so the countdown refreshes
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const canClose = acceptedAt
    ? Date.now() - new Date(acceptedAt).getTime() >= CLOSE_MIN_MS
    : false;

  const countdown = acceptedAt && !canClose ? formatCountdown(acceptedAt) : null;

  const loadConsultation = async () => {
    try {
      const { data } = await api.get(`/consultations/${consultationId}`);
      setStatus(data.status);
      if (data.acceptedAt) setAcceptedAt(data.acceptedAt);
      return data.status as string;
    } catch {
      return null;
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/consultations/${consultationId}/messages`);
      setMessages(data);
    } catch {}
    setLoading(false);
  };

  const accept = async () => {
    setAccepting(true);
    try {
      await api.patch(`/consultations/${consultationId}/accept`);
      setStatus("OPEN");
      await loadConsultation(); // refresh acceptedAt immediately
      fetchMessages();
    } catch {
      Alert.alert("Error", "Could not accept consultation.");
    }
    setAccepting(false);
  };

  const deny = () => {
    Alert.alert("Decline Consultation", "Are you sure you want to decline this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline", style: "destructive",
        onPress: async () => {
          try {
            await api.patch(`/consultations/${consultationId}/deny`);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Could not decline consultation.");
          }
        },
      },
    ]);
  };

  const closeChat = () => {
    Alert.alert(
      "Close Consultation",
      "Are you sure you want to close this chat? The patient will no longer be able to send messages.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Chat", style: "destructive",
          onPress: async () => {
            try {
              await api.patch(`/consultations/${consultationId}/close`);
              setStatus("CLOSED");
            } catch (err: any) {
              const msg = err?.response?.data?.message;
              if (msg === "TOO_EARLY") {
                const min = err?.response?.data?.minutesLeft ?? 0;
                const h   = Math.floor(min / 60);
                const m   = min % 60;
                Alert.alert("Too early", `You can close this chat in ${h > 0 ? `${h}h ` : ""}${m}m.`);
              } else {
                Alert.alert("Error", "Could not close consultation.");
              }
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const init = async () => {
      const s = await loadConsultation();
      if (s === "OPEN") fetchMessages();
      else setLoading(false);
    };
    init();
    const interval = setInterval(async () => {
      const s = await loadConsultation();
      if (s === "OPEN") fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post(`/consultations/${consultationId}/messages`, { text });
      setMessages((prev) => [...prev, data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setInput(text);
      Alert.alert("Failed to send", "Your message could not be delivered. Please try again.");
    }
    setSending(false);
  };

  const patientInitials = patientName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderRole === "DOCTOR";
    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMine && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{patientInitials}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
            {new Date(item.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{patientInitials}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{patientName}</Text>
            <Text style={styles.headerSub}>{disease}</Text>
          </View>
        </View>

        {/* Close button or countdown — only shown when chat is OPEN */}
        {status === "OPEN" && (
          canClose ? (
            <TouchableOpacity style={styles.closeBtn} onPress={closeChat} activeOpacity={0.8}>
              <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          ) : countdown ? (
            <View style={styles.countdownPill}>
              <Ionicons name="lock-closed-outline" size={11} color="#6B7280" />
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          ) : <View style={{ width: 26 }} />
        )}
        {status !== "OPEN" && <View style={{ width: 26 }} />}
      </View>

      {/* Unlock hint strip — shows when chat is open but not yet closeable */}
      {status === "OPEN" && !canClose && countdown && (
        <View style={styles.hintStrip}>
          <Ionicons name="information-circle-outline" size={14} color="#1E40AF" />
          <Text style={styles.hintStripText}>
            You can close this consultation in <Text style={{ fontWeight: "700" }}>{countdown}</Text>
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.main} />
        </View>
      ) : status === "PENDING" ? (
        <View style={styles.pendingBox}>
          <View style={styles.pendingIconCircle}>
            <Ionicons name="time-outline" size={40} color="#F59E0B" />
          </View>
          <Text style={styles.pendingTitle}>New Consultation Request</Text>
          <Text style={styles.pendingSubtitle}>
            {patientName} is waiting for your response about{"\n"}
            <Text style={{ fontWeight: "700", color: "#111" }}>{disease}</Text>
          </Text>
          <TouchableOpacity
            style={styles.acceptBigBtn}
            onPress={accept}
            disabled={accepting}
            activeOpacity={0.85}
          >
            {accepting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.acceptBigBtnText}>Accept & Open Chat</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={deny} style={styles.declineLink}>
            <Text style={styles.declineLinkText}>Decline Request</Text>
          </TouchableOpacity>
        </View>
      ) : status === "CLOSED" ? (
        <View style={styles.pendingBox}>
          <Ionicons name="lock-closed-outline" size={48} color="#9CA3AF" />
          <Text style={styles.pendingTitle}>Consultation Closed</Text>
          <Text style={styles.pendingSubtitle}>This consultation has ended.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubbles-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySub}>Reply to the patient below.</Text>
              </View>
            }
          />

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a reply…"
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginLeft: 4 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.main, alignItems: "center", justifyContent: "center" },
  headerAvatarText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  headerName: { fontSize: 15, fontWeight: "700", color: "#111" },
  headerSub: { fontSize: 11, color: "#9CA3AF" },

  closeBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEE2E2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  closeBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
  countdownPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  countdownText: { fontSize: 11, fontWeight: "600", color: "#6B7280" },

  hintStrip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 8 },
  hintStripText: { fontSize: 12, color: "#1E40AF" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 10, flexGrow: 1 },

  pendingBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  pendingIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center" },
  pendingTitle: { fontSize: 20, fontWeight: "800", color: "#111", textAlign: "center" },
  pendingSubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  acceptBigBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#16A34A", borderRadius: 16, paddingVertical: 15, paddingHorizontal: 32, marginTop: 8 },
  acceptBigBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  declineLink: { paddingVertical: 8 },
  declineLinkText: { fontSize: 14, color: "#9CA3AF" },

  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#9CA3AF" },
  emptySub: { fontSize: 13, color: "#C4C4C4" },

  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowRight: { justifyContent: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarSmallText: { color: "#6B7280", fontSize: 9, fontWeight: "700" },
  bubble: { maxWidth: "72%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMine: { backgroundColor: colors.main, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: "#fff", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 14, color: "#111", lineHeight: 20 },
  bubbleTextMine: { color: "#fff" },
  bubbleTime: { fontSize: 10, color: "#9CA3AF", alignSelf: "flex-end" },
  bubbleTimeMine: { color: "rgba(255,255,255,0.7)" },

  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  input: { flex: 1, backgroundColor: "#F3F4F6", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#111", maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.main, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.5 },
});

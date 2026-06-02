import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { patientApi } from "../config/api";
import colors from "../config/colors";

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  text: string;
  createdAt: string;
};

type ChatState = "loading" | "active" | "expired" | "error";

const CHAT_TTL_MS  = 3 * 24 * 60 * 60 * 1000;

function timeLeft(acceptedAt: string): string {
  const remaining = CHAT_TTL_MS - (Date.now() - new Date(acceptedAt).getTime());
  if (remaining <= 0) return "0h";
  const h = Math.floor(remaining / 3_600_000);
  const d = Math.floor(h / 24);
  return d > 0 ? `${d}d ${h % 24}h` : `${h}h`;
}

export default function DoctorChatScreen({ route, navigation }: any) {
  const { consultationId, patientName, patientInitials, disease } = route.params;

  const [chatState, setChatState]   = useState<ChatState>("loading");
  const [messages, setMessages]     = useState<Message[]>([]);
  const [consultation, setConsult]  = useState<any>(null);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [closing, setClosing]       = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const flatListRef                 = useRef<FlatList>(null);

  const loadChat = async () => {
    try {
      const { data } = await patientApi.get(`/consultations/${consultationId}`);
      setConsult(data);

      const expired = data.acceptedAt &&
        Date.now() - new Date(data.acceptedAt).getTime() > CHAT_TTL_MS;

      if (data.status === "CLOSED" || expired) {
        setChatState("expired");
        return;
      }

      const { data: msgs } = await patientApi.get(`/consultations/${consultationId}/messages`);
      setMessages(msgs);
      setChatState("active");
    } catch {
      setChatState("error");
    }
  };

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    if (chatState !== "active") return;
    const interval = setInterval(async () => {
      try {
        const { data: consultData } = await patientApi.get(`/consultations/${consultationId}`);
        if (consultData.status === "CLOSED") {
          setChatState("expired");
          return;
        }
        const { data } = await patientApi.get(`/consultations/${consultationId}/messages`);
        setMessages(data);
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [chatState]);

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
      const { data } = await patientApi.post(`/consultations/${consultationId}/messages`, { text });
      setMessages((prev) => [...prev, data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setInput(text);
    }
    setSending(false);
  };

  const handleClose = async () => {
    if (!confirmClose) {
      setConfirmClose(true);
      setTimeout(() => setConfirmClose(false), 3000);
      return;
    }
    setConfirmClose(false);
    setClosing(true);
    try {
      await patientApi.patch(`/consultations/${consultationId}/close`);
      setChatState("expired");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to close");
    }
    setClosing(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderRole === "DOCTOR";
    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMine && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{(patientInitials ?? "P").slice(0, 2)}</Text>
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

  // ── EXPIRED ────────────────────────────────────────────────────────────────
  if (chatState === "expired") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={[styles.headerAvatar, { backgroundColor: "#9CA3AF" }]}>
              <Text style={styles.headerAvatarText}>{(patientInitials ?? "P").slice(0, 2)}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{patientName}</Text>
              <Text style={styles.headerSub}>{disease}</Text>
            </View>
          </View>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.stateBox}>
          <View style={[styles.stateIconCircle, { backgroundColor: "#F3F4F6" }]}>
            <MaterialCommunityIcons name="lock-clock" size={40} color="#9CA3AF" />
          </View>
          <Text style={styles.stateTitle}>Chat Closed</Text>
          <Text style={styles.stateSub}>
            This consultation chat has been closed.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back-outline" size={18} color={colors.main} />
            <Text style={styles.backBtnText}>Back to Consultations</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── ERROR ──────────────────────────────────────────────────────────────────
  if (chatState === "error") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerName}>{patientName}</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="wifi-off" size={48} color="#E5E7EB" />
          <Text style={styles.stateTitle}>Connection error</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadChat}>
            <Ionicons name="refresh-outline" size={16} color={colors.main} />
            <Text style={styles.refreshBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (chatState === "loading") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={colors.main} />
        </View>
      </SafeAreaView>
    );
  }

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  const ttlDisplay = consultation?.acceptedAt ? timeLeft(consultation.acceptedAt) : null;
  const hoursLeft  = consultation?.acceptedAt
    ? Math.max(0, Math.floor((CHAT_TTL_MS - (Date.now() - new Date(consultation.acceptedAt).getTime())) / 3_600_000))
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{(patientInitials ?? "P").slice(0, 2)}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{patientName}</Text>
            <Text style={styles.headerSub}>{disease}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.closeBtn, confirmClose && styles.closeBtnConfirm]}
          onPress={handleClose}
          disabled={closing}
          activeOpacity={0.8}
        >
          {closing
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={[styles.closeBtnText, confirmClose && styles.closeBtnTextConfirm]}>
                {confirmClose ? "Confirm?" : "End Chat"}
              </Text>
          }
        </TouchableOpacity>
      </View>

      {hoursLeft !== null && hoursLeft <= 12 && (
        <View style={styles.expiryStrip}>
          <Ionicons name="warning-outline" size={14} color="#92400E" />
          <Text style={styles.expiryStripText}>Chat expires in {ttlDisplay}</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
              <Text style={styles.emptySub}>Introduce yourself to the patient!</Text>
            </View>
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
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
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },

  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerCenter:     { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginLeft: 8 },
  headerAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.main, alignItems: "center", justifyContent: "center" },
  headerAvatarText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  headerName:       { fontSize: 15, fontWeight: "700", color: "#111" },
  headerSub:        { fontSize: 11, color: "#9CA3AF" },
  closeBtn:             { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  closeBtnConfirm:      { backgroundColor: "#DC2626", borderColor: "#DC2626" },
  closeBtnText:         { fontSize: 12, fontWeight: "700", color: "#DC2626" },
  closeBtnTextConfirm:  { color: "#fff" },

  expiryStrip:     { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF3C7", paddingHorizontal: 16, paddingVertical: 8 },
  expiryStripText: { fontSize: 12, color: "#92400E", fontWeight: "600" },

  list: { padding: 16, gap: 10, flexGrow: 1 },

  stateBox:        { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  stateIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  stateTitle:      { fontSize: 20, fontWeight: "800", color: "#111" },
  stateSub:        { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  refreshBtn:      { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "#EFF6FF", borderRadius: 20 },
  refreshBtnText:  { fontSize: 14, fontWeight: "600", color: colors.main },
  backBtn:         { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: "#EFF6FF", borderRadius: 20, marginTop: 8 },
  backBtnText:     { fontSize: 14, fontWeight: "600", color: colors.main },

  emptyBox:  { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#9CA3AF" },
  emptySub:  { fontSize: 13, color: "#C4C4C4" },

  msgRow:      { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowRight: { justifyContent: "flex-end" },
  msgRowLeft:  { justifyContent: "flex-start" },
  avatarSmall:     { width: 28, height: 28, borderRadius: 14, backgroundColor: "#6B7280", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarSmallText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  bubble:          { maxWidth: "72%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMine:      { backgroundColor: colors.main, borderBottomRightRadius: 4 },
  bubbleTheirs:    { backgroundColor: "#fff", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleText:      { fontSize: 14, color: "#111", lineHeight: 20 },
  bubbleTextMine:  { color: "#fff" },
  bubbleTime:      { fontSize: 10, color: "#9CA3AF", alignSelf: "flex-end" },
  bubbleTimeMine:  { color: "rgba(255,255,255,0.7)" },

  inputBar:        { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  input:           { flex: 1, backgroundColor: "#F3F4F6", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#111", maxHeight: 100 },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.main, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.5 },
});

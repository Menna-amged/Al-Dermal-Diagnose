import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../config/colors";
import { common } from "../config/theme";
import BottomTabBar from "../components/layout/BottomTabBar";
import { doctorApi } from "../config/api";

type AlertItem = { id: string; title: string; message: string; time: string; type: "urgent" | "info" | "warning"; isRead: boolean; };

const ALERT_STYLES = {
  urgent:  { bg: "#FDECEA", iconBg: "#E8524A", icon: "alert-circle"         as const, titleColor: "#C0392B" },
  warning: { bg: "#FFF4E0", iconBg: "#F5A623", icon: "warning"              as const, titleColor: "#E67E22" },
  info:    { bg: "#EAF0FF", iconBg: colors.main, icon: "information-circle" as const, titleColor: colors.main },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function navigateForAlert(navigation: any, type: string) {
  if (type === "urgent") {
    navigation.navigate("DoctorConsultations");
  } else {
    navigation.navigate("Home");
  }
}

export default function AlertsScreen({ navigation }: any) {
  const [alerts, setAlerts]   = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await doctorApi.get("/alerts");
      setAlerts(
        (data as any[]).map((a) => ({
          id:      a.id,
          title:   a.title,
          message: a.message,
          time:    a.createdAt ? timeAgo(a.createdAt) : "",
          type:    (a.type?.toLowerCase() as "urgent" | "info" | "warning") ?? "info",
          isRead:  a.isRead ?? false,
        }))
      );
    } catch {
      setError("Could not load alerts.");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await doctorApi.patch(`/alerts/${id}/read`);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isRead: true } : a));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await doctorApi.patch("/alerts/read-all");
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch {}
  };

  const deleteAlert = async (id: string) => {
    try {
      await doctorApi.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  const handleTap = async (item: AlertItem) => {
    if (!item.isRead) await markRead(item.id);
    navigateForAlert(navigation, item.type);
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alerts</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done-outline" size={16} color={colors.main} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.main} size="large" /></View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.lightGray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const s = ALERT_STYLES[item.type] ?? ALERT_STYLES.info;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: s.bg }, item.isRead && styles.cardRead]}
                onPress={() => handleTap(item)}
                activeOpacity={0.85}
              >
                <View style={[common.row, { alignItems: "flex-start", gap: 12 }]}>
                  <View style={[styles.iconCircle, { backgroundColor: s.iconBg }]}>
                    <Ionicons name={s.icon} size={20} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[common.rowBetween, { marginBottom: 3 }]}>
                      <Text style={[styles.cardTitle, { color: s.titleColor }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={common.subtitle}>{item.time}</Text>
                    </View>
                    <Text style={[common.subtitle, { lineHeight: 18 }]}>{item.message}</Text>
                    {!item.isRead && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteAlert(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ marginTop: 2 }}
                  >
                    <Ionicons name="close" size={16} color={colors.darkGray} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={common.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.lightGray} />
              <Text style={common.emptyText}>No alerts</Text>
            </View>
          }
        />
      )}
      <BottomTabBar activeTab="Alerts" unreadAlerts={unreadCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle:  { fontSize: 22, fontWeight: "700", color: colors.black },
  headerSub:    { fontSize: 12, color: colors.darkGray, marginTop: 2 },
  markAllBtn:   { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#EEF2FF", borderRadius: 20 },
  markAllText:  { fontSize: 13, fontWeight: "600", color: colors.main },
  listContent:  { paddingHorizontal: 16, paddingTop: 12, gap: 10, paddingBottom: 12 },
  card:         { borderRadius: 16, padding: 14 },
  cardRead:     { opacity: 0.6 },
  iconCircle:   { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  cardTitle:    { fontSize: 14, fontWeight: "700", flex: 1 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.main, marginTop: 6 },
  centered:     { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText:    { fontSize: 14, color: colors.darkGray },
  retryBtn:     { backgroundColor: colors.main, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:    { color: colors.white, fontWeight: "700", fontSize: 14 },
});

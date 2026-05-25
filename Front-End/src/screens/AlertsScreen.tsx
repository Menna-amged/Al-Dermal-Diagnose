import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common } from "../config/theme";
import BottomTabBar from "../components/layout/BottomTabBar";
import ScreenHeader from "../components/layout/ScreenHeader";

type Alert = { id: string; title: string; message: string; time: string; type: "urgent" | "info" | "warning"; action?: string; };

const ALERTS: Alert[] = [
  { id: "1", title: "Urgent Case Submission", message: "Review lab results immediately: John Doe Chest pain symptoms.", time: "10m ago", type: "urgent", action: "Review Now" },
];

const ALERT_STYLES = {
  urgent:  { bg: "#FDECEA", iconBg: "#E8524A", icon: "alert-circle"         as const, titleColor: "#C0392B" },
  warning: { bg: "#FFF4E0", iconBg: "#F5A623", icon: "warning"              as const, titleColor: "#E67E22" },
  info:    { bg: "#EAF0FF", iconBg: colors.main, icon: "information-circle" as const, titleColor: colors.main },
};

export default function AlertsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="Alerts" onBack={() => navigation.goBack()} />
      <Text style={[common.label, { marginHorizontal: 16, marginBottom: 10 }]}>TODAY</Text>
      <FlatList
        data={ALERTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const s = ALERT_STYLES[item.type];
          return (
            <View style={[styles.card, { backgroundColor: s.bg }]}>
              <View style={[common.row, { alignItems: "flex-start", gap: 12, marginBottom: 10 }]}>
                <View style={[styles.iconCircle, { backgroundColor: s.iconBg }]}>
                  <Ionicons name={s.icon} size={20} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[common.rowBetween, { marginBottom: 4 }]}>
                    <Text style={[styles.cardTitle, { color: s.titleColor }]}>{item.title}</Text>
                    <Text style={common.subtitle}>{item.time}</Text>
                  </View>
                  <Text style={common.subtitle}>{item.message}</Text>
                </View>
              </View>
              {item.action && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: s.iconBg }]}>
                  <Text style={styles.actionText}>{item.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={common.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.lightGray} />
            <Text style={common.emptyText}>No alerts</Text>
          </View>
        }
      />
      <BottomTabBar activeTab="Alerts" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, gap: 12, paddingBottom: 12 },
  card: { borderRadius: 16, padding: 14 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  actionBtn: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, marginTop: 4 },
  actionText: { fontSize: 13, fontWeight: "700", color: colors.white },
});
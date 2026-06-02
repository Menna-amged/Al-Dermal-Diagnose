import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doctorApi } from "../../config/api";

type Tab = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  screen: string;
};

const TABS: Tab[] = [
  { name: "Home",          icon: "home-outline",          activeIcon: "home",          screen: "Home" },
  { name: "Consults",      icon: "chatbubbles-outline",   activeIcon: "chatbubbles",   screen: "DoctorConsultations" },
  { name: "Schedule",      icon: "calendar-outline",      activeIcon: "calendar",      screen: "Schedule" },
  { name: "Alerts",        icon: "notifications-outline", activeIcon: "notifications", screen: "Alerts" },
  { name: "Settings",      icon: "settings-outline",      activeIcon: "settings",      screen: "Settings" },
];

type Props = {
  activeTab?: string;
  unreadAlerts?: number;
};

export default function BottomTabBar({ activeTab, unreadAlerts }: Props) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const currentTab = activeTab ?? route.name;
  const [fetchedUnread, setFetchedUnread] = useState(0);

  // Only fetch when we don't already have it passed as prop (i.e. non-Alerts screens)
  useEffect(() => {
    if (unreadAlerts !== undefined) return;
    doctorApi.get("/alerts").then(({ data }) => {
      const count = (data as any[]).filter((a) => !a.isRead).length;
      setFetchedUnread(count);
    }).catch(() => {});
  }, [currentTab]);

  // "DoctorConsultations" screen maps to the "Consults" tab label
  const resolvedTab = currentTab === "DoctorConsultations" ? "Consults" : currentTab;
  const badge = unreadAlerts ?? fetchedUnread;

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = resolvedTab === tab.name;
        const showBadge = tab.name === "Alerts" && badge > 0;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? colors.main : colors.darkGray}
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? "9+" : String(badge)}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.lightGray, paddingBottom: 20, paddingTop: 10, paddingHorizontal: 10 },
  tab:         { flex: 1, alignItems: "center", gap: 3 },
  iconWrap:    { position: "relative" },
  badge:       { position: "absolute", top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText:   { fontSize: 9, fontWeight: "700", color: "#fff" },
  label:       { fontSize: 11, color: colors.darkGray },
  labelActive: { color: colors.main, fontWeight: "600" },
});

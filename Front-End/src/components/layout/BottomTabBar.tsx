import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";
import { useNavigation, useRoute } from "@react-navigation/native";

type Tab = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  screen: string;
};

const TABS: Tab[] = [
  { name: "Home",     icon: "home-outline",          activeIcon: "home",          screen: "Home" },
  { name: "Schedule", icon: "calendar-outline",      activeIcon: "calendar",      screen: "Schedule" },
  { name: "Alerts",   icon: "notifications-outline", activeIcon: "notifications", screen: "Alerts" },
  { name: "Settings", icon: "settings-outline",      activeIcon: "settings",      screen: "Settings" },
];

type Props = {
  activeTab?: string;
};

export default function BottomTabBar({ activeTab }: Props) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const currentTab = activeTab ?? route.name;

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.screen)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? colors.main : colors.darkGray}
            />
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
  container: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.lightGray, paddingBottom: 20, paddingTop: 10, paddingHorizontal: 10 },
  tab: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 11, color: colors.darkGray },
  labelActive: { color: colors.main, fontWeight: "600" },
});
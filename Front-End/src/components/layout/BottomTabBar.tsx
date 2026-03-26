import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../config/colors";

type Tab = {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const TABS: Tab[] = [
  { name: "Home", icon: "home-outline" },
  { name: "Schedule", icon: "calendar-outline" },
  { name: "Alerts", icon: "notifications-outline" },
  { name: "Settings", icon: "settings-outline" },
];

export default function BottomTabBar() {
  const [active, setActive] = useState("Home");

  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => (
        <React.Fragment key={tab.name}>
          {index === 2 && (
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
              <Ionicons name="add" size={28} color={colors.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActive(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={active === tab.name ? colors.main : colors.darkGray}
            />
            <Text
              style={[
                styles.label,
                active === tab.name && { color: colors.main },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    color: colors.darkGray,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.main,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

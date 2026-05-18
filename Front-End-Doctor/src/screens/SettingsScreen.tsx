import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common } from "../config/theme";
import ScreenHeader from "../components/layout/ScreenHeader";
import BottomTabBar from "../components/layout/BottomTabBar";
import SettingSection from "../components/settings/SettingSection";

export default function SettingsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => navigation.replace("Auth") },
    ]);
  };

  const sections = [
    {
      title: "Account",
      rows: [
        { icon: "person-circle-outline" as const, label: "My Profile",       type: "navigate" as const, onPress: () => navigation.navigate("Profile") },
        { icon: "lock-closed-outline"   as const, label: "Change Password",  type: "navigate" as const, onPress: () => navigation.navigate("ChangePassword") },
      ],
    },
    {
      title: "Preferences",
      rows: [
        { icon: "notifications-outline" as const, label: "Push Notifications", type: "toggle" as const, value: notifications, onToggle: setNotifications },
        { icon: "mail-outline"          as const, label: "Email Alerts",       type: "toggle" as const, value: emailAlerts,   onToggle: setEmailAlerts },
      ],
    },
    {
      title: "Support",
      rows: [
        { icon: "help-circle-outline"         as const, label: "Help & FAQ",             type: "navigate" as const, onPress: () => navigation.navigate("HelpFAQ") },
        { icon: "document-text-outline"       as const, label: "Terms & Privacy Policy", type: "navigate" as const, onPress: () => navigation.navigate("TermsPrivacy") },
        { icon: "information-circle-outline"  as const, label: "App Version 1.0.0",      type: "navigate" as const, onPress: () => {} },
      ],
    },
    {
      title: "",
      rows: [
        { icon: "log-out-outline" as const, label: "Logout", type: "danger" as const, onPress: handleLogout },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sections.map((s, i) => <SettingSection key={i} title={s.title} rows={s.rows} />)}
        <View style={{ height: 24 }} />
      </ScrollView>
      <BottomTabBar activeTab="Settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
});

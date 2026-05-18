import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import colors from "../config/colors";

type Tab = "Home" | "Doctor" | "Camera" | "History" | "Profile";

type Props = {
  navigation: any;
  activeTab?: Tab;
};

function goToTab(navigation: any, tab: Tab) {
  if (tab === "Home") {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Home" }] }));
  } else {
    navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "Home" }, { name: tab }] }));
  }
}

export default function NavBar({ navigation, activeTab = "Home" }: Props) {
  const color = (tab: string) => activeTab === tab ? "#2563EB" : "#9CA3AF";

  return (
    <View style={styles.wrapper}>
      <View style={styles.navbar}>

        <TouchableOpacity style={styles.navItem} onPress={() => goToTab(navigation, "Home")}>
          <Ionicons name="home" size={24} color={color("Home")} />
          <Text style={[styles.navLabel, { color: color("Home") }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => goToTab(navigation, "Doctor")}>
          <Ionicons name="medkit-outline" size={24} color={color("Doctor")} />
          <Text style={[styles.navLabel, { color: color("Doctor") }]}>Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCenter} onPress={() => goToTab(navigation, "Camera")}>
          <Ionicons name="camera" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => goToTab(navigation, "History")}>
          <Ionicons name="time-outline" size={24} color={color("History")} />
          <Text style={[styles.navLabel, { color: color("History") }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => goToTab(navigation, "Profile")}>
          <Ionicons name="person-outline" size={24} color={color("Profile")} />
          <Text style={[styles.navLabel, { color: color("Profile") }]}>Profile</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.lightGray,
  },
  navbar: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 13,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  navCenter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -24,
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

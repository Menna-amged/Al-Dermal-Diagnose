import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";

type Props = {
  navigation: any;
  activeTab?: "Home" | "Doctor" | "Camera" | "History" | "Profile";
};

export default function NavBar({ navigation, activeTab = "Home" }: Props) {
  const color = (tab: string) =>
    activeTab === tab ? "#2563EB" : "#9CA3AF";

  return (
    <View style={styles.wrapper}>
      <View style={styles.navbar}>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={24} color={color("Home")} />
          <Text style={[styles.navLabel, { color: color("Home") }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Doctor")}>
          <Ionicons name="medkit-outline" size={24} color={color("Doctor")} />
          <Text style={[styles.navLabel, { color: color("Doctor") }]}>Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCenter} onPress={() => navigation.navigate("Camera")}>
          <Ionicons name="camera" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("History")}>
          <Ionicons name="time-outline" size={24} color={color("History")} />
          <Text style={[styles.navLabel, { color: color("History") }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
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

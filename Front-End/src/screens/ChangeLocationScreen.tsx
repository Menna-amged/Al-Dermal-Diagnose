import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../config/colors";

const LOCATION_KEY = "user_location";

const suggestedLocations = [
  { id: 1, name: "Current Location", sub: "Obour, Qalyubia", current: true },
  { id: 2, name: "Nasr City",        sub: "Cairo, Egypt",    current: false },
  { id: 3, name: "6 of October",     sub: "Cairo, Egypt",    current: false },
  { id: 4, name: "New Cairo",        sub: "Cairo, Egypt",    current: false },
  
];

export default function ChangeLocationScreen({ navigation }: any) {
  const [governorate, setGovernorate] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_KEY).then((data) => {
      if (data) {
        const saved = JSON.parse(data);
        setGovernorate(saved.governorate ?? "");
        setSelectedId(saved.selectedId ?? null);
      }
    });
  }, []);

  const handleSelect = (item: (typeof suggestedLocations)[0]) => {
    setSelectedId(item.id);
    setGovernorate(item.sub.split(", ")[1] ?? item.sub);
  };

  const handleSave = async () => {
    if (!governorate.trim() && selectedId === null) {
      Alert.alert("Required", "Please enter or select a location.");
      return;
    }
    await AsyncStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ governorate, selectedId })
    );
    Alert.alert("Saved", "Your location has been updated.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Location</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Governorate Input */}
        <Text style={styles.sectionLabel}>GOVERNORATE</Text>
        <TextInput
          style={styles.input}
          value={governorate}
          onChangeText={(t) => { setGovernorate(t); setSelectedId(null); }}
          placeholder="Enter governorate"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.hint}>
          selecting your correct governorate helps us tailor clinical
          recommendations and connect you with local specialists it needed.
        </Text>

        {/* Suggested Locations Header */}
        <View style={styles.suggestedHeader}>
          <Text style={styles.sectionLabel}>SUGGESTED LOCATIONS</Text>
          <TouchableOpacity>
            <Text style={styles.recentText}>Recent</Text>
          </TouchableOpacity>
        </View>

        {/* Locations Card */}
        <View style={styles.locationCard}>
          {suggestedLocations.map((item, index) => {
            const isSelected = item.id === selectedId;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.locationRow}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                >
                  {/* Icon */}
                  <View style={[styles.iconWrapper, isSelected && item.current && styles.iconWrapperBlue]}>
                    {item.current ? (
                      <MaterialCommunityIcons
                        name="crosshairs-gps"
                        size={20}
                        color={isSelected ? colors.main : "#9CA3AF"}
                      />
                    ) : (
                      <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                    )}
                  </View>

                  {/* Text */}
                  <View style={styles.locationText}>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationSub}>{item.sub}</Text>
                  </View>

                  {/* Right side */}
                  {isSelected ? (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  )}
                </TouchableOpacity>

                {index < suggestedLocations.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.main,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  hint: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 28,
  },
  suggestedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recentText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.main,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperBlue: {
    backgroundColor: "#EEF3FE",
  },
  locationText: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  locationSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
});

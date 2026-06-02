import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../config/colors";
import { common } from "../config/theme";
import BottomTabBar from "../components/layout/BottomTabBar";
import ScreenHeader from "../components/layout/ScreenHeader";
import AppointmentCard from "../components/lists/AppointmentCard";
import { doctorApi } from "../config/api";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function buildCalendar(year: number, month: number) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ScheduleScreen({ navigation }: any) {
  const today = new Date();
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const cells     = buildCalendar(year, month);
  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });
  const isToday   = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  useFocusEffect(useCallback(() => {
    loadAppointments(year, month, selected);
  }, []));

  const loadAppointments = async (y: number, m: number, d: number) => {
    setLoading(true);
    setError(null);
    try {
      const date = toDateStr(y, m, d);
      const { data } = await doctorApi.get(`/appointments?date=${date}`);
      setAppointments(data as any[]);
    } catch {
      setError("Could not load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const selectDay = (day: number) => {
    setSelected(day);
    loadAppointments(year, month, day);
  };

  const selectedDate = new Date(year, month, selected).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="Schedule" onBack={() => navigation.goBack()} />

      <View style={styles.calendar}>
        <View style={[common.rowBetween, { marginBottom: 14 }]}>
          <TouchableOpacity onPress={prevMonth}><Ionicons name="chevron-back" size={20} color={colors.black} /></TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName} {year}</Text>
          <TouchableOpacity onPress={nextMonth}><Ionicons name="chevron-forward" size={20} color={colors.black} /></TouchableOpacity>
        </View>
        <View style={[common.row, { marginBottom: 6 }]}>
          {DAYS.map((d, i) => <Text key={i} style={styles.dayHeader}>{d}</Text>)}
        </View>
        <View style={styles.grid}>
          {cells.map((day, i) => (
            <TouchableOpacity key={i} style={styles.cell} onPress={() => day && selectDay(day)} activeOpacity={day ? 0.7 : 1}>
              {day ? (
                <View style={[styles.dateCircle, selected === day && styles.selectedCircle, isToday(day) && selected !== day && styles.todayCircle]}>
                  <Text style={[styles.dateText, selected === day && styles.selectedText, isToday(day) && selected !== day && styles.todayText]}>{day}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[common.rowBetween, styles.apptHeader]}>
        <View>
          <Text style={styles.apptTitle}>Appointments</Text>
          <Text style={styles.apptDate}>{selectedDate}</Text>
        </View>
        {!loading && (
          <View style={common.badge}>
            <Text style={common.badgeText}>{appointments.length} Total</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.main} /></View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadAppointments(year, month, selected)} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AppointmentCard
              name={item.patientName}
              initials={(item.patientName ?? "?").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
              type={item.type ?? "Appointment"}
              time={item.time ?? ""}
            />
          )}
          ListEmptyComponent={
            <View style={common.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.lightGray} />
              <Text style={common.emptyText}>No appointments on this day</Text>
            </View>
          }
        />
      )}
      <BottomTabBar activeTab="Schedule" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendar:     { paddingHorizontal: 16, paddingBottom: 12 },
  monthTitle:   { fontSize: 16, fontWeight: "700", color: colors.black },
  dayHeader:    { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600", color: colors.darkGray },
  grid:         { flexDirection: "row", flexWrap: "wrap" },
  cell:         { width: "14.28%", alignItems: "center", marginVertical: 2 },
  dateCircle:   { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  selectedCircle: { backgroundColor: colors.main },
  todayCircle:  { borderWidth: 1.5, borderColor: colors.main },
  dateText:     { fontSize: 13, color: colors.black },
  selectedText: { color: colors.white, fontWeight: "700" },
  todayText:    { color: colors.main, fontWeight: "700" },
  apptHeader:   { paddingHorizontal: 16, marginTop: 4, marginBottom: 10 },
  apptTitle:    { fontSize: 16, fontWeight: "700", color: colors.black },
  apptDate:     { fontSize: 12, color: colors.darkGray, marginTop: 2 },
  listContent:  { paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
  centered:     { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingBottom: 60 },
  errorText:    { fontSize: 14, color: colors.darkGray },
  retryBtn:     { backgroundColor: colors.main, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:    { color: colors.white, fontWeight: "700", fontSize: 14 },
});

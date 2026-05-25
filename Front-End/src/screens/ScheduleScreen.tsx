import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../config/colors";
import { common } from "../config/theme";
import BottomTabBar from "../components/layout/BottomTabBar";
import ScreenHeader from "../components/layout/ScreenHeader";
import AppointmentCard from "../components/lists/AppointmentCard";

const DAYS = ["S", "S", "M", "T", "W", "T", "F"];

type Appointment = { id: string; name: string; initials: string; type: string; time: string; };

const APPOINTMENTS: Appointment[] = [
  { id: "1", name: "John Doe",    initials: "JD", type: "Routine Checkup", time: "09:00 AM" },
  { id: "2", name: "Emma Wilson", initials: "EW", type: "Consultation",    time: "10:30 AM" },
  { id: "3", name: "Sarah Ross",  initials: "SR", type: "Follow-up",       time: "1:30 PM"  },
  { id: "4", name: "David Kim",   initials: "DK", type: "Vaccination",     time: "3:45 PM"  },
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function ScheduleScreen({ navigation }: any) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());

  const cells     = buildCalendar(year, month);
  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const isToday   = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

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
            <TouchableOpacity key={i} style={styles.cell} onPress={() => day && setSelected(day)} activeOpacity={day ? 0.7 : 1}>
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
        <Text style={styles.apptTitle}>Today's Appointments</Text>
        <View style={common.badge}>
          <Text style={common.badgeText}>{APPOINTMENTS.length} Total</Text>
        </View>
      </View>

      <FlatList
        data={APPOINTMENTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <AppointmentCard name={item.name} initials={item.initials} type={item.type} time={item.time} />}
      />
      <BottomTabBar activeTab="Schedule" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendar: { paddingHorizontal: 16, paddingBottom: 12 },
  monthTitle: { fontSize: 16, fontWeight: "700", color: colors.black },
  dayHeader: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600", color: colors.darkGray },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", alignItems: "center", marginVertical: 2 },
  dateCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  selectedCircle: { backgroundColor: colors.main },
  todayCircle: { borderWidth: 1.5, borderColor: colors.main },
  dateText: { fontSize: 13, color: colors.black },
  selectedText: { color: colors.white, fontWeight: "700" },
  todayText: { color: colors.main, fontWeight: "700" },
  apptHeader: { paddingHorizontal: 16, marginTop: 4, marginBottom: 10 },
  apptTitle: { fontSize: 16, fontWeight: "700", color: colors.black },
  listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
});
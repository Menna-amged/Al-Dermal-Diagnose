import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PatientDetailsScreen from "../screens/PatientDetailsScreen";
import DiagnosisReportScreen from "../screens/DiagnosisReportScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import AlertsScreen from "../screens/AlertsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
      <Stack.Screen name="DiagnosisReport" component={DiagnosisReportScreen} />
    </Stack.Navigator>
  );
}
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorHomescreen from "../screens/DoctorHomescreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import AlertsScreen from "../screens/AlertsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChangePasswordScreenDoctor from "../screens/ChangePasswordScreenDoctor";
import HelpFAQScreen from "../screens/HelpFAQScreen";
import TermsPrivacyScreen from "../screens/TermsPrivacyScreen";
import DiagnosisReportScreen from "../screens/DiagnosisReportScreen";
import PatientDetailsScreen from "../screens/PatientDetailsScreen";
import FinalDiagnosisScreen from "../screens/FinalDiagnosisScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function DoctorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={DoctorHomescreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreenDoctor} />
      <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
      <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
      <Stack.Screen name="DiagnosisReport" component={DiagnosisReportScreen} />
      <Stack.Screen name="FinalDiagnosis" component={FinalDiagnosisScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
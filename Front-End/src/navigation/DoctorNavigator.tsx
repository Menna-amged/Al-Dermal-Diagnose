import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorHomescreen from "../screens/DoctorHomescreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import AlertsScreen from "../screens/AlertsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChangePasswordScreenDoctor from "../screens/ChangePasswordScreenDoctor";
import HelpFAQScreen from "../screens/HelpFAQScreen";
import TermsPrivacyScreen from "../screens/TermsPrivacyScreen";
import PatientDetailsScreen from "../screens/PatientDetailsScreen";
import DiagnosisReportScreen from "../screens/DiagnosisReportScreen";
import FinalDiagnosisScreen from "../screens/FinalDiagnosisScreen";
import DoctorProfileScreen from "../screens/DoctorProfileScreen";
import DoctorProfileSetupScreen from "../screens/DoctorProfileSetupScreen";
import DoctorConsultationsScreen from "../screens/DoctorConsultationsScreen";
import DoctorChatScreen from "../screens/DoctorChatScreen";

const Stack = createNativeStackNavigator();

interface Props {
  setIsLoggedIn: (v: boolean) => void;
  isProfileComplete: boolean;
  setIsProfileComplete: (v: boolean) => void;
}

export default function DoctorNavigator({ setIsLoggedIn, isProfileComplete, setIsProfileComplete }: Props) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isProfileComplete ? "Home" : "ProfileSetup"}
    >
      <Stack.Screen
        name="ProfileSetup"
        children={(props) => (
          <DoctorProfileSetupScreen {...props} setIsProfileComplete={setIsProfileComplete} />
        )}
      />
      <Stack.Screen name="Home" component={DoctorHomescreen} options={{ animation: "none" }} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ animation: "none" }} />
      <Stack.Screen name="Alerts" component={AlertsScreen} options={{ animation: "none" }} />
      <Stack.Screen name="Settings" options={{ animation: "none" }}>
        {(props) => <SettingsScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreenDoctor} />
      <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
      <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
      <Stack.Screen name="DiagnosisReport" component={DiagnosisReportScreen} />
      <Stack.Screen name="FinalDiagnosis" component={FinalDiagnosisScreen} />
      <Stack.Screen name="Profile" component={DoctorProfileScreen} />
      <Stack.Screen name="DoctorConsultations" component={DoctorConsultationsScreen} options={{ animation: "none" }} />
      <Stack.Screen name="DoctorChat" component={DoctorChatScreen} />
    </Stack.Navigator>
  );
}

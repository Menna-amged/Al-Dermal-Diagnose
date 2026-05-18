import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import DoctorScreen from "../screens/DoctorScreen";
import ResultScreen from "../screens/ResultScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DoctorHomescreen from "../screens/DoctorHomescreen";
import AuthLoginForm from "../components/auth/AuthLoginForm";
import EditProfile from "../screens/EditProfile";
import ChangepasswordSettingScreen from "../screens/ChangepasswordSettingScreen";
import ChangeLocationScreen from "../screens/ChangeLocationScreen";
import TermsAndConditionsScreen from "../screens/TermsAndConditionsScreen";
import PrivacyPolicyScreen from "../screens/Privacypolicyscreen";
import HelpAndSupportScreen from "../screens/Helpandsupportscreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import AboutScreen from "../screens/AboutScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import PredictionScreen from "../screens/PredictionScreen";
import ConsultationSentScreen from "../screens/Consultationsentscreen";
import BuyTokensScreen from "../screens/BuyTokensScreen";
import PatientDoctorProfileScreen from "../screens/PatientDoctorProfileScreen";
import ConsultDoctorSelectScreen from "../screens/ConsultDoctorSelectScreen";
import ConsultDoctorProfileScreen from "../screens/ConsultDoctorProfileScreen";

const Stack = createNativeStackNavigator();

export default function PatientNavigator({ setIsLoggedIn }: { setIsLoggedIn: (v: boolean) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"    component={HomeScreen}   options={{ animation: 'none' }} />
      <Stack.Screen name="Camera"  component={CameraScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Doctor"  component={DoctorScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Result"  component={ResultScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Profile" options={{ animation: 'none' }}>
        {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="DoctorHome" component={DoctorHomescreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePassword" component={ChangepasswordSettingScreen} />
      <Stack.Screen name="Location" component={ChangeLocationScreen} />
      <Stack.Screen name="Terms" component={TermsAndConditionsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="HelpSupport" component={HelpAndSupportScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="Prediction" component={PredictionScreen} />
      <Stack.Screen name="ConsultationSent" component={ConsultationSentScreen} />
      <Stack.Screen name="BuyTokens" component={BuyTokensScreen} />
      <Stack.Screen name="PatientDoctorProfile" component={PatientDoctorProfileScreen} />
      <Stack.Screen name="ConsultDoctorSelect" component={ConsultDoctorSelectScreen} />
      <Stack.Screen name="ConsultDoctorProfile" component={ConsultDoctorProfileScreen} />
      <Stack.Screen name="Login" component={AuthLoginForm} />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserTypeScreen from "../screens/UserTypeScreen";
import PatientLoginScreen from "../screens/PatientLoginScreen";
import DoctorLoginScreen from "../screens/DoctorLoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import CreatePasswordScreen from "../screens/CreatePasswordScreen";
import OTPCheckScreen from "../screens/OTPCheckScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import VerificationScreen from "../screens/VerificationScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ setIsLoggedIn }: { setIsLoggedIn: (loggedIn: boolean) => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserType" component={UserTypeScreen} />

      {/* Patient Login */}
      <Stack.Screen
        name="PatientLogin"
        children={(props) => (
          <PatientLoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      />

      {/* Doctor Login */}
      <Stack.Screen
        name="DoctorLogin"
        children={(props) => (
          <DoctorLoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
<Stack.Screen
  name="CreatePassword"
  children={(props) => (
    <CreatePasswordScreen {...props} setIsLoggedIn={setIsLoggedIn} />
  )}
/>

      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
  name="OTPCheck"
  children={(props) => (
    <OTPCheckScreen {...props} setIsLoggedIn={setIsLoggedIn} />
  )}
/>
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
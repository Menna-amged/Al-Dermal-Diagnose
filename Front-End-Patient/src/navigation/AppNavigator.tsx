import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AuthLoginForm from "../components/auth/AuthLoginForm";
import CameraScreen from "../screens/CameraScreen";
import DoctorScreen from "../screens/DoctorScreen";
import ResultScreen from "../screens/ResultScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DoctorHomescreen from "../screens/DoctorHomescreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ setIsLoggedIn }: { setIsLoggedIn: (v: boolean) => void }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Doctor" component={DoctorScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="DoctorHome" component={DoctorHomescreen} />
      <Stack.Screen name="Login" component={AuthLoginForm} />
    </Stack.Navigator>
  );
}

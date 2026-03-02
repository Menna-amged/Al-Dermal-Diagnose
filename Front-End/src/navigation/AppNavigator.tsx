import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AuthLoginForm from "../components/auth/AuthLoginForm";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />  
      <Stack.Screen name="Login" component={AuthLoginForm} />
    </Stack.Navigator>
  );
}

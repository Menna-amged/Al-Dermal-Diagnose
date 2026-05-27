import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import DoctorNavigator from "./DoctorNavigator";
import SplashScreen from "../screens/SplashScreen";

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const type  = await AsyncStorage.getItem("userType");
        if (token) {
          setIsLoggedIn(true);
          setUserType(type);
        }
      } catch (_) {}
      finally { setIsLoading(false); }
    };

    const splashTimer = setTimeout(() => init(), 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  if (isLoading) return <SplashScreen />;

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
  };

  return isLoggedIn ? (
    userType === "doctor"
      ? <DoctorNavigator onLogout={handleLogout} />
      : <AppNavigator onLogout={handleLogout} />
  ) : (
    <AuthNavigator setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />
  );
}
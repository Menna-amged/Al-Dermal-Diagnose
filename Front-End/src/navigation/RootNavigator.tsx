import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import PatientNavigator from "./PatientNavigator";
import DoctorNavigator from "./DoctorNavigator";
import SplashScreen from "../screens/SplashScreen";
import api from "../config/api";

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/users/me");
          await AsyncStorage.setItem("firstName", data.firstName ?? "");
          const type = await AsyncStorage.getItem("userType");
          setUserType(type);
          if (type === "doctor") {
            const stored = await AsyncStorage.getItem("isProfileComplete");
            setIsProfileComplete(stored === null ? true : JSON.parse(stored));
          }
          setIsLoggedIn(true);
        } catch {
          await AsyncStorage.multiRemove(["token", "isPremium", "firstName", "userType", "isProfileComplete"]);
        }
      }
      setTimeout(() => setIsLoading(false), 3000);
    };
    init();
  }, []);

  if (isLoading) return <SplashScreen />;

  if (!isLoggedIn) {
    return (
      <AuthNavigator
        setIsLoggedIn={setIsLoggedIn}
        setUserType={setUserType}
        setIsProfileComplete={setIsProfileComplete}
      />
    );
  }

  return userType === "doctor" ? (
    <DoctorNavigator
      setIsLoggedIn={setIsLoggedIn}
      isProfileComplete={isProfileComplete}
      setIsProfileComplete={setIsProfileComplete}
    />
  ) : (
    <PatientNavigator setIsLoggedIn={setIsLoggedIn} />
  );
}

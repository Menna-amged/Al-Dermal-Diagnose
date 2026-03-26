import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import SplashScreen from "../screens/SplashScreen";
import api from "../config/api";

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/users/me");
          await AsyncStorage.setItem("firstName", data.firstName ?? "");
          setIsLoggedIn(true);
        } catch {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("isPremium");
          await AsyncStorage.removeItem("firstName");
        }
      }
      setTimeout(() => setIsLoading(false), 3000);
    };
    init();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }


  return isLoggedIn ? (
    <AppNavigator setIsLoggedIn={setIsLoggedIn} />
  ) : (
    <AuthNavigator setIsLoggedIn={setIsLoggedIn} />
  );
}

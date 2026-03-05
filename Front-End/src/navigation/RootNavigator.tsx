import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import SplashScreen from "../screens/SplashScreen";


export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setIsLoggedIn(true);
      setTimeout(() => setIsLoading(false), 3000);
    };
    init();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }


  return isLoggedIn ? (
    <AppNavigator />
  ) : (
    <AuthNavigator setIsLoggedIn={setIsLoggedIn} />
  );
}

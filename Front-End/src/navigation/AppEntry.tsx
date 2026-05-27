import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./RootNavigator";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert:  true,
      shouldShowBanner: true,
      shouldShowList:   true,
      shouldPlaySound:  true,
      shouldSetBadge:   true,
    }),
  });
} catch {}

async function requestNotificationPermission() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    await Notifications.requestPermissionsAsync();
  } catch {}
}

export default function AppEntry() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Font.loadAsync(Ionicons.font).catch(() => {});
      setReady(true);
      await SplashScreen.hideAsync().catch(() => {});
      // Ask for notifications after the app is visible
      await requestNotificationPermission();
    }
    prepare();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

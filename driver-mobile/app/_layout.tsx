import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { RegistrationProvider } from "../contexts/RegistrationContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RegistrationProvider>
        <SafeScreen>
          <Stack 
            screenOptions={{ headerShown: false }}
            initialRouteName="landing"
          >
            <Stack.Screen name="landing" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="home" />
            <Stack.Screen name="password-reset" />
          </Stack>
          <StatusBar style="dark" />
        </SafeScreen>
      </RegistrationProvider>
    </SafeAreaProvider>
  );
}

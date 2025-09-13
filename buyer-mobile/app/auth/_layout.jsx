import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { BuyerRegistrationProvider } from "../../contexts/BuyerRegistrationContext";

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <BuyerRegistrationProvider>
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
          </Stack>
          <StatusBar style="dark" />
        </SafeScreen>
      </BuyerRegistrationProvider>
    </SafeAreaProvider>
  );
}

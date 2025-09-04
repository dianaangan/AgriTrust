import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../../components/SafeScreen";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register1" />
          <Stack.Screen name="register2" />
          <Stack.Screen name="register3" />
          <Stack.Screen name="register4" />
        </Stack>
        <StatusBar style="dark" />
      </SafeScreen>
    </SafeAreaProvider>
  );
}


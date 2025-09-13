import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../../components/SafeScreen";
import { StatusBar } from "expo-status-bar";

export default function PasswordResetLayout() {
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack 
          screenOptions={{ 
            headerShown: false
          }}
        >
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="verify-code" />
          <Stack.Screen name="new-password" />
        </Stack>
        <StatusBar style="dark" />
      </SafeScreen>
    </SafeAreaProvider>
  );
}

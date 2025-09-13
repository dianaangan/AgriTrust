import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeScreen from '../../components/SafeScreen';
import { StatusBar } from 'expo-status-bar';
import getColors from '../../constants/colors';

const colors = getColors('light');

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.primary },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="register1" />
          <Stack.Screen name="register2" />
          <Stack.Screen name="register3" />
          <Stack.Screen name="register4" />
          <Stack.Screen name="register5" />
          <Stack.Screen name="register6" />
        </Stack>
        <StatusBar style="dark" />
      </SafeScreen>
    </SafeAreaProvider>
  );
}

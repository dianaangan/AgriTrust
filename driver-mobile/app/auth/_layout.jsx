import { Stack } from 'expo-router';
import getColors from '../../constants/colors';

const colors = getColors('light');

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register1" />
      <Stack.Screen name="register2" />
      <Stack.Screen name="register3" />
      <Stack.Screen name="register4" />
    </Stack>
  );
}

import { Stack } from "expo-router";
import getColors from "../constants/colors";

const colors = getColors('light');

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="landing" />
      <Stack.Screen name="home" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

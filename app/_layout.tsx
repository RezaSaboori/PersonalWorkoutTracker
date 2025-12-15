import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="workout-session" />
        <Stack.Screen name="workout-preview" />
        <Stack.Screen name="workout-history" />
        <Stack.Screen name="customize-workout" />
        <Stack.Screen name="custom-workout-creator" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="achievement-detail" />
        <Stack.Screen name="plans" />
      </Stack>
    </>
  );
}
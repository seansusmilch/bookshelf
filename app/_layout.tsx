import '../global.css';

import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'var(--color-surface)',
        },
        headerTintColor: 'var(--color-on-surface)',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: '400',
        },
        contentStyle: {
          backgroundColor: 'var(--color-background)',
        },
      }}>
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerStyle: {
            backgroundColor: 'var(--color-surface-container-low)',
          },
        }}
      />
    </Stack>
  );
}

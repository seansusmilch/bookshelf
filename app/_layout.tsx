import '../global.css';

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { SignOutButton } from '~/components/SignOutButton';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [isSignedIn, isLoaded]);

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
        headerRight: () => <SignOutButton />,
      }}>
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local');
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
}

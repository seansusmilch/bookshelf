import '../global.css';

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexClientProvider } from '~/components/ConvexClientProvider';

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
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        } as any,
        headerTintColor: 'var(--color-on-surface)',
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: '700',
        } as any,
        contentStyle: {
          backgroundColor: 'var(--color-background)',
        },
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
      <ConvexClientProvider>
        <InitialLayout />
      </ConvexClientProvider>
    </ClerkProvider>
  );
}

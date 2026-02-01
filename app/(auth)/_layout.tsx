import { Redirect, Stack } from 'expo-router';
import { useConvexAuth, AuthLoading } from 'convex/react';

export default function AuthRoutesLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <AuthLoading>{null}</AuthLoading>;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/shelf" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

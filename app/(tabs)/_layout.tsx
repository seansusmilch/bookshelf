import { Redirect, Tabs } from 'expo-router';
import { useConvexAuth, AuthLoading } from 'convex/react';

import { M3TabBar } from '@/components/m3-tab-bar';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <AuthLoading>{null}</AuthLoading>;
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <M3TabBar {...props} />}>
      <Tabs.Screen
        name="shelf"
        options={{
          title: 'Shelf',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
        }}
      />
    </Tabs>
  );
}

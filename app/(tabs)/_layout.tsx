import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'var(--color-on-surface)',
        tabBarInactiveTintColor: 'var(--color-on-surface-variant)',
        tabBarStyle: {
          backgroundColor: 'var(--color-surface)',
          borderTopWidth: 1,
          borderTopColor: 'var(--color-surface-variant)',
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: 'var(--color-surface)',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'var(--color-outline-variant)',
        },
        headerTintColor: 'var(--color-on-surface)',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: '400',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} size={focused ? 28 : 24} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="book" color={color} size={focused ? 28 : 24} />
          ),
        }}
      />
    </Tabs>
  );
}

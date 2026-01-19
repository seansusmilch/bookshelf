import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SignOutButton } from '~/components/SignOutButton';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'var(--color-primary)',
        tabBarInactiveTintColor: 'var(--color-on-surface-variant)',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 0.05)',
          height: 85,
          paddingBottom: 24,
          paddingTop: 12,
          paddingHorizontal: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: 'var(--color-surface)',
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        },
        headerTintColor: 'var(--color-on-surface)',
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: '700',
          letterSpacing: -0.5,
        },
        headerRight: () => <SignOutButton />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="home" size={focused ? 26 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="book" size={focused ? 26 : 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

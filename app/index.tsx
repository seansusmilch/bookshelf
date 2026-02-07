import '@/assets/globals.css';
import { FontAwesome } from '@expo/vector-icons';
import { useConvexAuth } from 'convex/react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/components/material3-provider';

export default function Index() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <FontAwesome name="book" size={80} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onSurface }]}>Bookshelf</Text>
          <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/shelf" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: 16,
  },
});

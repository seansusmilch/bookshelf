import '@/assets/globals.css';
import { FontAwesome } from '@expo/vector-icons';
import { useConvexAuth } from 'convex/react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <FontAwesome name="book" size={80} color="#3B82F6" />
          <Text style={styles.title}>Bookshelf</Text>
          <ActivityIndicator size="large" color="#3B82F6" style={styles.spinner} />
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
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: 16,
  },
});

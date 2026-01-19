import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex-1 bg-gradient-to-b from-[--color-primary-container] to-[--color-background] px-6 py-12">
        <View className="mb-8">
          <View className="mx-auto mb-6 overflow-hidden rounded-full bg-white shadow-2xl">
            <View className="h-32 w-32 items-center justify-center bg-gradient-to-br from-[--color-primary] to-[--color-tertiary]">
              <Text className="text-6xl">📚</Text>
            </View>
          </View>
          <View className="text-center">
            <Text className="mb-2 text-3xl font-bold text-[--color-on-surface]">
              Welcome to Bookshelf!
            </Text>
            <Text className="text-lg text-[--color-on-surface-variant]">
              {user?.emailAddresses[0]?.emailAddress
                ? `Signed in as ${user.emailAddresses[0].emailAddress}`
                : 'Successfully signed in'}
            </Text>
          </View>
        </View>

        <View className="rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          <Text className="mb-4 text-2xl font-bold text-[--color-on-surface]">Getting Started</Text>
          <Text className="mb-6 text-base leading-relaxed text-[--color-on-surface-variant]">
            You&apos;re all set! Start exploring your personal book collection, add new books, and
            organize your reading list.
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center gap-3 rounded-2xl bg-[--color-surface-container-low] p-4">
              <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-primary]">
                <Text className="text-xl">📖</Text>
              </View>
              <Text className="flex-1 text-base font-medium text-[--color-on-surface]">
                Add your first book
              </Text>
            </View>
            <View className="flex-row items-center gap-3 rounded-2xl bg-[--color-surface-container-low] p-4">
              <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-secondary]">
                <Text className="text-xl">⭐</Text>
              </View>
              <Text className="flex-1 text-base font-medium text-[--color-on-surface]">
                Rate and review
              </Text>
            </View>
            <View className="flex-row items-center gap-3 rounded-2xl bg-[--color-surface-container-low] p-4">
              <View className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-tertiary]">
                <Text className="text-xl">📋</Text>
              </View>
              <Text className="flex-1 text-base font-medium text-[--color-on-surface]">
                Create reading lists
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

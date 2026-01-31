import { View, Text, Pressable, ScrollView } from '@/tw';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <Pressable onPress={handleSignOut} className="bg-red-500 p-4 rounded-xl items-center">
      <Text className="text-white font-semibold">Sign out</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 min-h-screen px-6 py-12">
        <View className="max-w-sm mx-auto w-full">
          <SignedOut>
            <View className="bg-white rounded-2xl p-8 shadow-sm">
              <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome!</Text>
              <Text className="text-base text-gray-600 mb-8 text-center">
                Get started with your personal bookshelf
              </Text>
              <Pressable
                onPress={() => router.push('/(auth)/sign-in')}
                className="bg-blue-600 p-4 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Get started</Text>
              </Pressable>
            </View>
          </SignedOut>

          <SignedIn>
            <View className="bg-white rounded-2xl p-8 shadow-sm">
              <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</Text>
              <Text className="text-base text-gray-600 mb-6">
                {user?.emailAddresses[0]?.emailAddress || 'User'}
              </Text>
              <View className="bg-blue-50 rounded-xl p-6 mb-6">
                <Text className="text-lg font-semibold text-blue-900 mb-2">Your Bookshelf</Text>
                <Text className="text-blue-700">
                  Track your reading progress, discover new books, and build your personal library.
                </Text>
              </View>
              <SignOutButton />
            </View>
          </SignedIn>
        </View>
      </View>
    </ScrollView>
  );
}

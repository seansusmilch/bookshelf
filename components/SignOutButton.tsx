import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="flex-row items-center gap-2 rounded-full bg-[--color-error-container] px-4 py-2 pr-6">
      <Ionicons name="log-out-outline" size={20} color="var(--color-on-error-container)" />
      <Text className="text-sm font-semibold text-[--color-on-error-container]">Sign Out</Text>
    </TouchableOpacity>
  );
};

import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Modal() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-[--color-surface-container-low]">
      <Text className="mb-4 text-2xl text-[--color-on-surface]">Modal Screen</Text>
      <Text onPress={() => router.back()} className="text-lg text-[--color-primary]">
        Close
      </Text>
    </View>
  );
}

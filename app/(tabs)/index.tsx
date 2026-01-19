import { Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex-1 items-center justify-center bg-[--color-background]">
        <Text className="text-2xl text-[--color-on-surface]">Hello World!</Text>
      </View>
    </>
  );
}

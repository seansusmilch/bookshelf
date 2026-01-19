import { Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function Library() {
  return (
    <>
      <Stack.Screen options={{ title: 'Library' }} />
      <View className="flex-1 items-center justify-center bg-[--color-background]">
        <Text className="text-2xl text-[--color-on-surface]">Library Tab</Text>
      </View>
    </>
  );
}

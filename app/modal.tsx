import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, View } from 'react-native';

import { Button } from '~/components/Button';

export default function Modal() {
  return (
    <>
      <ScrollView className="flex-1 bg-[--color-surface-container-low]">
        <View className="p-6">
          <View className="mb-6 rounded-3xl bg-[--color-surface] p-6">
            <View className="mb-4 text-2xl font-medium text-[--color-on-surface]">
              About Bookshelf
            </View>
            <View className="mb-6 text-base text-[--color-on-surface-variant]">
              Your personal reading companion. Track your reading progress, discover new books, and
              build your library.
            </View>
            <View className="mb-6 rounded-2xl bg-[--color-surface-container-highest] p-4">
              <View className="mb-2 text-base font-medium text-[--color-on-surface]">
                Version 1.0.0
              </View>
              <View className="text-sm text-[--color-on-surface-variant]">
                Built with Expo and Material You
              </View>
            </View>
          </View>

          <View className="mb-6 rounded-3xl bg-[--color-surface] p-6">
            <View className="mb-4 text-xl font-medium text-[--color-on-surface]">Features</View>
            {[
              'Track reading progress',
              'Personal book library',
              'Reading statistics',
              'Book recommendations',
            ].map((feature, index) => (
              <View key={index} className="mb-4 flex-row items-center">
                <View className="mr-3 h-2 w-2 rounded-full bg-[--color-primary]" />
                <View className="text-base text-[--color-on-surface]">{feature}</View>
              </View>
            ))}
          </View>

          <Button title="Close" variant="filled" />
        </View>
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

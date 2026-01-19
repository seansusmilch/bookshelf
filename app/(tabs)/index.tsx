import { Stack } from 'expo-router';

import { ScrollView, View } from 'react-native';

import { Button } from '~/components/Button';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView className="flex-1 bg-[--color-background]">
        <View className="p-6">
          <View className="mb-6">
            <View className="text-22 mb-1 font-medium text-[--color-on-surface]">Good morning</View>
            <View className="text-base text-[--color-on-surface-variant]">
              Discover your next great read
            </View>
          </View>

          <View className="mb-6 rounded-3xl bg-[--color-primary-container] p-6">
            <View className="mb-2 text-xl font-medium text-[--color-on-primary-container]">
              Continue Reading
            </View>
            <View className="mb-4 text-sm text-[--color-on-primary-container]">
              The Great Gatsby - Chapter 5
            </View>
            <View className="mb-2 h-2 rounded-full bg-[--color-on-primary-container]/20">
              <View className="h-2 w-3/5 rounded-full bg-[--color-primary]" />
            </View>
            <View className="text-xs text-[--color-on-primary-container]">60% complete</View>
          </View>

          <View className="mb-6">
            <View className="mb-4 text-lg font-medium text-[--color-on-surface]">
              Featured Books
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { title: '1984', author: 'George Orwell' },
                { title: 'Pride and Prejudice', author: 'Jane Austen' },
                { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
              ].map((book, index) => (
                <View
                  key={index}
                  className="mr-4 w-40 rounded-2xl bg-[--color-surface-container-low] p-4">
                  <View className="mb-3 h-48 rounded-xl bg-[--color-primary-container]" />
                  <View className="mb-1 text-sm font-medium text-[--color-on-surface]">
                    {book.title}
                  </View>
                  <View className="text-xs text-[--color-on-surface-variant]">{book.author}</View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View className="mb-6">
            <View className="mb-4 text-lg font-medium text-[--color-on-surface]">
              Recent Activity
            </View>
            {[
              { action: 'Finished', book: 'The Hobbit', time: '2 days ago' },
              { action: 'Started', book: 'Brave New World', time: '5 days ago' },
              { action: 'Added', book: 'Dune', time: '1 week ago' },
            ].map((activity, index) => (
              <View key={index} className="mb-3 rounded-2xl bg-[--color-surface-container] p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="mb-1 text-sm font-medium text-[--color-on-surface]">
                      {activity.action} {activity.book}
                    </View>
                    <View className="text-xs text-[--color-on-surface-variant]">
                      {activity.time}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Button title="Browse All Books" variant="outlined" className="mb-6" />
        </View>
      </ScrollView>
    </>
  );
}

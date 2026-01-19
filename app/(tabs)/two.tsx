import { Stack } from 'expo-router';

import { ScrollView, View } from 'react-native';

export default function LibraryScreen() {
  const books = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic' },
    { title: '1984', author: 'George Orwell', genre: 'Dystopian' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Classic' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', genre: 'Classic' },
    { title: 'Brave New World', author: 'Aldous Huxley', genre: 'Sci-Fi' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Library' }} />
      <ScrollView className="flex-1 bg-[--color-background]">
        <View className="p-6">
          <View className="mb-6">
            <View className="mb-6 rounded-2xl bg-[--color-surface-container-highest] p-4">
              <View className="mb-1 text-sm text-[--color-on-surface-variant]">
                Search your library
              </View>
              <View className="text-base font-medium text-[--color-on-surface]">
                Find a book...
              </View>
            </View>
          </View>

          <View className="mb-4">
            <View className="mb-4 text-lg font-medium text-[--color-on-surface]">All Books</View>
            {books.map((book, index) => (
              <View key={index} className="mb-3 rounded-2xl bg-[--color-surface-container-low] p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="mb-1 text-base font-medium text-[--color-on-surface]">
                      {book.title}
                    </View>
                    <View className="mb-2 text-sm text-[--color-on-surface-variant]">
                      {book.author}
                    </View>
                    <View className="self-start rounded-full bg-[--color-secondary-container] px-3 py-1">
                      <View className="text-xs font-medium text-[--color-on-secondary-container]">
                        {book.genre}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

import { View, Text, ScrollView } from '@/tw';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BookCard } from '@/components/ui/BookCard';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { useBooks } from '@/hooks/useBooks';
import { BookCardSkeleton } from '@/components/ui/Skeleton';

export default function MyBooksScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const books = useBooks(selectedStatus === 'all' ? undefined : selectedStatus);

  console.log('📚 [ShelfScreen] Component rendered');
  console.log('📚 [ShelfScreen] books:', books);
  console.log('📚 [ShelfScreen] books is undefined?:', books === undefined);
  console.log('📚 [ShelfScreen] books length:', books?.length);
  console.log('📚 [ShelfScreen] selectedStatus:', selectedStatus);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleBookPress = (bookId: string) => {
    console.log('📚 [ShelfScreen] handleBookPress called with bookId:', bookId);
    console.log('📚 [ShelfScreen] bookId type:', typeof bookId);
    console.log('📚 [ShelfScreen] bookId value:', JSON.stringify(bookId));
    router.push(`/book/${bookId}` as any);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="bg-white border-b border-gray-200" edges={['top']}>
        <FilterTabs selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
      </SafeAreaView>

      {books === undefined ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          className="flex-1 px-4 pt-4"
        >
          <BookCardSkeleton />
          <BookCardSkeleton />
          <BookCardSkeleton />
        </ScrollView>
      ) : books.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">📚</Text>
          <Text className="text-xl font-semibold text-gray-900 mb-2">No books yet</Text>
          <Text className="text-center text-gray-600 mb-6">
            Search for books in the Search tab to start building your library.
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          className="flex-1"
          contentContainerClassName="px-4 pt-4 pb-4"
        >
          <Text className="text-xl font-bold mb-4">Books ({books.length})</Text>
          {books.map((book: any, index: number) => {
            console.log(`📚 [ShelfScreen] Rendering book ${index}:`, book);
            console.log(`📚 [ShelfScreen] Book ${index} _id:`, book._id);
            console.log(`📚 [ShelfScreen] Book ${index} _id type:`, typeof book._id);
            return (
              <BookCard
                key={book._id}
                book={book}
                onPress={() => handleBookPress(book._id)}
                onMenuPress={() => handleBookPress(book._id)}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

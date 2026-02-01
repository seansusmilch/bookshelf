import { View, Text, ScrollView } from '@/tw';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { BookCard } from '@/components/ui/BookCard';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { BookDetailModal } from '@/components/book/BookDetailModal';
import { useBooks } from '@/hooks/useBooks';
import { BookCardSkeleton } from '@/components/ui/Skeleton';

export default function MyBooksScreen() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const books = useBooks(selectedStatus === 'all' ? undefined : selectedStatus);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleBookPress = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleModalClose = () => {
    setSelectedBookId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FilterTabs selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />

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
          className="flex-1 px-4 pt-4"
        >
          {books.map((book: any) => (
            <BookCard
              key={book._id}
              book={book}
              onPress={() => handleBookPress(book._id)}
              onMenuPress={() => handleBookPress(book._id)}
            />
          ))}
        </ScrollView>
      )}

      <BookDetailModal
        visible={!!selectedBookId}
        bookId={selectedBookId}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

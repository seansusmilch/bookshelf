import { View, Text, ScrollView, TextInput, Pressable } from '@/tw';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Image } from 'expo-image';
import { useSearchBooks, GoogleBook } from '@/hooks/useSearchBooks';
import { useAddBook } from '@/hooks/useAddBook';
import { AddBookSheet } from '@/components/book/AddBookSheet';

type SearchResult = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  googleBooksId?: string;
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const { data: searchResults, isLoading } = useSearchBooks(debouncedQuery);
  const addBook = useAddBook();

  const handleSearch = (text: string) => {
    setQuery(text);
    setTimeout(() => setDebouncedQuery(text), 300);
  };

  const handleBookPress = (book: GoogleBook) => {
    const result: SearchResult = {
      id: book.id,
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors?.join(', ') || 'Unknown Author',
      coverUrl: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
      description: book.volumeInfo.description,
      pageCount: book.volumeInfo.pageCount,
      publishedDate: book.volumeInfo.publishedDate,
      isbn10: book.volumeInfo.industryIdentifiers?.find((i) => i.type === 'ISBN_10')?.identifier,
      isbn13: book.volumeInfo.industryIdentifiers?.find((i) => i.type === 'ISBN_13')?.identifier,
      googleBooksId: book.id,
    };
    setSelectedBook(result);
  };

  const handleAdd = (status: string) => {
    if (selectedBook) {
      addBook({
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description,
        coverUrl: selectedBook.coverUrl,
        isbn10: selectedBook.isbn10,
        isbn13: selectedBook.isbn13,
        totalPages: selectedBook.pageCount || 0,
        status,
        googleBooksId: selectedBook.googleBooksId,
      });
      setShowAddSheet(false);
      setSelectedBook(null);
    }
  };

  const handleCloseSheet = () => {
    setShowAddSheet(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Search for books..."
          className="px-4 py-3 bg-gray-100 rounded-xl text-base text-gray-900"
        />
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {query.length < 2 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-xl font-semibold text-gray-900 mb-2">Search for books</Text>
            <Text className="text-center text-gray-600">
              Enter a title, author, or keyword to find books from Google Books.
            </Text>
          </View>
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-600">Searching...</Text>
          </View>
        ) : !searchResults || searchResults.items?.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-4xl mb-4">📚</Text>
            <Text className="text-xl font-semibold text-gray-900 mb-2">No results found</Text>
            <Text className="text-center text-gray-600">
              Try a different search term or check your spelling.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {searchResults.items?.map((book) => (
              <Pressable
                key={book.id}
                onPress={() => handleBookPress(book)}
                className="bg-white rounded-xl shadow-sm p-3"
              >
                <View className="flex-row gap-3">
                  <View className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail ? (
                      <Image
                        source={{
                          uri:
                            book.volumeInfo.imageLinks?.thumbnail ||
                            book.volumeInfo.imageLinks?.smallThumbnail,
                        }}
                        className="w-full h-full"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-gray-100">
                        <Text className="text-gray-400 text-xs">No cover</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-1 justify-between py-1">
                    <View>
                      <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
                        {book.volumeInfo.title}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                        {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                      </Text>
                      {book.volumeInfo.pageCount && (
                        <Text className="text-xs text-gray-400 mt-1">
                          {book.volumeInfo.pageCount} pages
                        </Text>
                      )}
                    </View>

                    {selectedBook?.id === book.id && (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setShowAddSheet(true);
                        }}
                        className="py-2 px-4 bg-blue-500 rounded-lg self-start mt-2"
                      >
                        <Text className="text-white text-sm font-semibold">Add</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <AddBookSheet visible={showAddSheet} onClose={handleCloseSheet} onAdd={handleAdd} />
    </SafeAreaView>
  );
}

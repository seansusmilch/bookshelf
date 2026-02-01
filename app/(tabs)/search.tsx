import { AddBookSheet } from '@/components/book/AddBookSheet';
import { useAddBook } from '@/hooks/useAddBook';
import { OpenLibraryBook, OpenLibraryResponse, useSearchBooks } from '@/hooks/useSearchBooks';
import { useAppTheme } from '@/components/material3-provider';
import { Image, Pressable, ScrollView, Text, View } from '@/tw';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { api } from 'convex/_generated/api';
import { useAction } from 'convex/react';

type SearchResult = {
  id: string;
  workId: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  openLibraryId?: string;
};

function extractOLID(key: string): string {
  const match = key.match(/\/(?:books|works|authors)\/([A-Za-z0-9]+)/);
  return match ? match[1] : key;
}

function getBookCoverURL(
  coverId: number | undefined,
  olid: string,
  isbn?: string[]
): string | undefined {
  if (isbn && isbn.length > 0) {
    return `https://covers.openlibrary.org/b/isbn/${isbn[0]}-M.jpg?default=false`;
  }
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;
  }
  if (olid) {
    return `https://covers.openlibrary.org/b/olid/${olid}-M.jpg?default=false`;
  }
  console.log('No cover source available');
  return undefined;
}

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [searchResults, setSearchResults] = useState<OpenLibraryResponse | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isFetchingEdition, setIsFetchingEdition] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  const { isLoading, searchBooks: executeSearch } = useSearchBooks();
  const addBook = useAddBook();
  const getBestEditionForWork = useAction(api.openLibrarySearch.getBestEditionForWork);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      console.log('Executing search for:', text);
      const results = await executeSearch(text);
      setSearchResults(results);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleBookPress = async (book: OpenLibraryBook) => {
    const olid = extractOLID(book.key);
    setIsFetchingEdition(true);

    try {
      const edition = await getBestEditionForWork({ openLibraryId: olid });
      const editionOLID = extractOLID(edition.key);
      const result: SearchResult = {
        id: editionOLID,
        workId: olid,
        title: book.title,
        author: book.author_name?.join(', ') || 'Unknown Author',
        coverUrl: getBookCoverURL(book.cover_i, olid, book.isbn),
        description: undefined,
        pageCount: edition.number_of_pages || 0,
        publishedDate: book.first_publish_year?.toString(),
        isbn10: edition.isbn_10?.[0],
        isbn13: edition.isbn_13?.[0],
        openLibraryId: editionOLID,
      };
      setSelectedBook(result);
    } catch (error) {
      console.error('Failed to fetch edition:', error);
      const result: SearchResult = {
        id: olid,
        workId: olid,
        title: book.title,
        author: book.author_name?.join(', ') || 'Unknown Author',
        coverUrl: getBookCoverURL(book.cover_i, olid, book.isbn),
        description: undefined,
        pageCount: 0,
        publishedDate: book.first_publish_year?.toString(),
        isbn10: book.isbn?.find(isbn => isbn.length === 10),
        isbn13: book.isbn?.find(isbn => isbn.length === 13),
        openLibraryId: olid,
      };
      setSelectedBook(result);
    } finally {
      setIsFetchingEdition(false);
    }
  };

  const handleAdd = async (status: string) => {
    if (selectedBook) {
      await addBook.mutate({
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description,
        coverUrl: selectedBook.coverUrl,
        isbn10: selectedBook.isbn10,
        isbn13: selectedBook.isbn13,
        totalPages: selectedBook.pageCount || 0,
        status,
        openLibraryId: selectedBook.openLibraryId,
      });
      setShowAddSheet(false);
      setSelectedBook(null);
    }
  };

  const handleCloseSheet = () => {
    setShowAddSheet(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="bg-white py-4 border-b border-gray-200" edges={['top']}>
        <Searchbar
          placeholder="Search for books..."
          onChangeText={handleSearch}
          value={query}
          mode="bar"
          elevation={2}
          loading={isLoading}
          icon={() => <MaterialIcons name="search" size={24} color={colors.onSurfaceVariant} />}
          style={{ marginHorizontal: 20 }}
        />
      </SafeAreaView>

      <ScrollView className="flex-1 px-4 pt-4">
        {query.length < 2 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="search" size={64} color={colors.onSurfaceVariant} />
            <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">Search for books</Text>
            <Text className="text-center text-gray-600 px-8">
              Enter a title, author, or keyword to find books from Open Library.
            </Text>
          </View>
        ) : isLoading ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="hourglass-empty" size={48} color={colors.primary} />
            <Text className="text-gray-600 mt-4">Searching...</Text>
          </View>
        ) : !searchResults || searchResults.docs?.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="menu-book" size={64} color={colors.onSurfaceVariant} />
            <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">No results found</Text>
            <Text className="text-center text-gray-600 px-8">
              Try a different search term or check your spelling.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {searchResults.docs?.map((book: OpenLibraryBook) => {
              const olid = extractOLID(book.key);
              const coverUrl = getBookCoverURL(book.cover_i, olid, book.isbn);
              return (
                <Pressable
                  key={book.key}
                  onPress={() => handleBookPress(book)}
                  className="bg-white rounded-xl shadow-sm p-3"
                >
                  <View className="flex-row gap-3">
                    <View className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {coverUrl && !failedImages.has(coverUrl) ? (
                        <Image
                          source={{ uri: coverUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                          onError={() => {
                            console.log('Image load error:', coverUrl);
                            setFailedImages(prev => new Set(prev).add(coverUrl));
                          }}
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
                          {book.title}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                          {book.author_name?.join(', ') || 'Unknown Author'}
                        </Text>
                        {book.edition_count && (
                          <Text className="text-xs text-gray-400 mt-1">
                            {book.edition_count} {book.edition_count === 1 ? 'edition' : 'editions'}
                          </Text>
                        )}
                      </View>

                      {selectedBook?.workId === olid ? (
                        isFetchingEdition ? (
                          <View className="py-2 px-4 bg-gray-200 rounded-lg self-start mt-2">
                            <Text className="text-gray-600 text-sm font-semibold">Loading...</Text>
                          </View>
                        ) : (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              setShowAddSheet(true);
                            }}
                            style={{ backgroundColor: colors.primary }}
                            className="py-2 px-4 rounded-lg self-start mt-2"
                          >
                            <Text className="text-white text-sm font-semibold">Add</Text>
                          </Pressable>
                        )
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddBookSheet visible={showAddSheet} onClose={handleCloseSheet} onAdd={handleAdd} pageCount={selectedBook?.pageCount} />
    </View>
  );
}

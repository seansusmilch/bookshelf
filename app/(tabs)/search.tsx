import { OpenLibraryBook, OpenLibraryResponse, useSearchBooks } from '@/hooks/useSearchBooks';
import { usePreviousSearches } from '@/hooks/usePreviousSearches';
import { useAppTheme } from '@/components/material3-provider';
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

function extractOLID(key: string): string {
  const match = key.match(/\/(?:books|works|authors)\/([A-Za-z0-9]+)/);
  return match ? match[1] : key;
}

function getBookCoverURL(
  coverId: number | undefined,
  olid: string,
  isbn?: string[],
  editionKey?: string
): string | undefined {
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  }
  if (isbn && isbn.length > 0) {
    return `https://covers.openlibrary.org/b/isbn/${isbn[0]}-M.jpg`;
  }
  if (olid) {
    return `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
  }
  if (editionKey) {
    const editionOlid = extractOLID(editionKey);
    return `https://covers.openlibrary.org/b/olid/${editionOlid}-M.jpg`;
  }
  console.log('No cover source available');
  return undefined;
}

function getTopEdition(book: OpenLibraryBook) {
  return book.editions?.docs?.[0];
}

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenLibraryResponse | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<number | null>(null);

  const { isLoading, searchBooks: executeSearch } = useSearchBooks();
  const { searches, saveSearch, deleteSearch } = usePreviousSearches();

  const executeSearchAndSave = async (searchQuery: string) => {
    const results = await executeSearch(searchQuery);
    setSearchResults(results);
    if (results && results.docs && results.docs.length > 0) {
      saveSearch(searchQuery);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (text.length >= 2) {
        console.log('Executing search for:', text);
        await executeSearchAndSave(text);
      }
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleBookPress = (book: OpenLibraryBook) => {
    const topEdition = getTopEdition(book);
    const editionOlid = topEdition?.key ? extractOLID(topEdition.key) : extractOLID(book.key);
    const authorName = book.author_name?.[0] || 'Unknown Author';
    console.log('🔍 [SearchScreen] handleBookPress called');
    console.log('🔍 [SearchScreen] book.key:', book.key);
    console.log('🔍 [SearchScreen] topEdition:', topEdition);
    console.log('🔍 [SearchScreen] extracted edition olid:', editionOlid);
    console.log('🔍 [SearchScreen] authorName from search:', authorName);
    console.log('🔍 [SearchScreen] Navigating to: /add-book/', editionOlid);
    router.push(`/add-book/${editionOlid}?author=${encodeURIComponent(authorName)}` as any);
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
          searches.length > 0 ? (
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-3">Previous searches</Text>
              <View className="gap-2">
                {searches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setQuery(search);
                      executeSearchAndSave(search);
                    }}
                    className="bg-white rounded-xl shadow-sm p-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1 flex-row items-center gap-3">
                      <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
                      <Text className="text-base text-gray-900 flex-1" numberOfLines={1}>
                        {search}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteSearch(search)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="ml-2"
                    >
                      <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="search" size={64} color={colors.onSurfaceVariant} />
              <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">Search for books</Text>
              <Text className="text-center text-gray-600 px-8">
                Enter a title, author, or keyword to find books from Open Library.
              </Text>
            </View>
          )
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
              const workOlid = extractOLID(book.key);
              const coverUrl = getBookCoverURL(book.cover_i, workOlid, book.isbn, book.cover_edition_key);
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
                            {book.edition_count} {book.edition_count ===1 ? 'edition' : 'editions'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

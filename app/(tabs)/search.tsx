import { useAppTheme } from '@/components/material3-provider';
import { usePreviousSearches } from '@/hooks/usePreviousSearches';
import { OpenLibraryBook, OpenLibraryResponse, useSearchBooks } from '@/hooks/useSearchBooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

function extractOLID(key: string): string {
  const match = key.match(/\/(?:books|works|authors)\/([A-Za-z0-9]+)/);
  return match ? match[1] : key;
}

function getEditionOlid(book: OpenLibraryBook): string | undefined {
  const editionKey = book.editions?.docs?.[0]?.key;
  if (editionKey) return extractOLID(editionKey);
  if (book.cover_edition_key) return extractOLID(book.cover_edition_key);
  return undefined;
}

function getCoverUrl(olid: string): string {
  return `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
}

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const searchbarRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenLibraryResponse | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<number | null>(null);

  const { isLoading, searchBooks: executeSearch } = useSearchBooks();
  const { searches, saveSearch, deleteSearch } = usePreviousSearches();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const executeSearchAndSave = async (searchQuery: string, options?: { skipCache?: boolean }) => {
    const results = await executeSearch(searchQuery, options);
    setSearchResults(results);
    if (results && results.docs && results.docs.length > 0) {
      saveSearch(searchQuery);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (query.length < 2) return;
    setIsRefreshing(true);
    await executeSearchAndSave(query, { skipCache: true });
    setIsRefreshing(false);
  }, [query, executeSearch]);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      // Blur first so that focus() always triggers the keyboard,
      // even if the input already had logical focus.
      searchbarRef.current?.blur();
      setTimeout(() => {
        searchbarRef.current?.focus();
      }, 50);
    });
    return unsubscribe;
  }, [navigation]);

  const handleBookPress = (book: OpenLibraryBook) => {
    const editionOlid = getEditionOlid(book) || extractOLID(book.key);
    const authorName = book.author_name?.[0] || 'Unknown Author';
    const coverUrl = getCoverUrl(editionOlid);
    router.push(`/add-book/${editionOlid}?author=${encodeURIComponent(authorName)}&coverUrl=${encodeURIComponent(coverUrl)}&title=${encodeURIComponent(book.title)}`);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView style={{ backgroundColor: colors.surface }} edges={['top']}>
        <View className="py-4">
          <Searchbar
            ref={searchbarRef}
            placeholder="Search for books..."
            onChangeText={handleSearch}
            value={query}
            mode="bar"
            elevation={2}
            loading={isLoading}
            icon={() => <MaterialIcons name="search" size={24} color={colors.onSurfaceVariant} />}
            style={{ marginHorizontal: 20, backgroundColor: colors.surfaceContainerHighest }}
            placeholderTextColor={colors.onSurfaceVariant}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            enabled={query.length >= 2}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {query.length < 2 ? (
          searches.length > 0 ? (
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: colors.onSurfaceVariant }}>
                Previous searches
              </Text>
              <View className="gap-2">
                {searches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setQuery(search);
                      executeSearchAndSave(search);
                    }}
                    className="rounded-xl shadow-sm p-3 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-1 flex-row items-center gap-3">
                      <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
                      <Text className="text-base flex-1" numberOfLines={1} style={{ color: colors.onSurface }}>
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
              <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: colors.onSurface }}>
                Search for books
              </Text>
              <Text className="text-center px-8" style={{ color: colors.onSurfaceVariant }}>
                Enter a title, author, or keyword to find books from Open Library.
              </Text>
            </View>
          )
        ) : isLoading ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="hourglass-empty" size={48} color={colors.primary} />
            <Text style={{ color: colors.onSurfaceVariant, marginTop: 16 }}>Searching...</Text>
          </View>
        ) : !searchResults || searchResults.docs?.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="menu-book" size={64} color={colors.onSurfaceVariant} />
            <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: colors.onSurface }}>
              No results found
            </Text>
            <Text className="text-center px-8" style={{ color: colors.onSurfaceVariant }}>
              Try a different search term or check your spelling.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {searchResults.docs?.map((book: OpenLibraryBook) => {
              const editionOlid = getEditionOlid(book);
              const coverUrl = editionOlid ? getCoverUrl(editionOlid) : undefined;
              return (
                <Pressable
                  key={book.key}
                  onPress={() => handleBookPress(book)}
                  className="rounded-xl shadow-sm p-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row gap-3">
                    <View className="w-32 h-44 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                        <View className="w-full h-full items-center justify-center" style={{ backgroundColor: colors.surfaceContainerHighest }}>
                          <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>No cover</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-1 justify-between py-1">
                      <View>
                        <Text className="text-lg font-semibold" numberOfLines={2} style={{ color: colors.onSurface }}>
                          {book.title}
                        </Text>
                        <Text className="text-base mt-1" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                          {book.author_name?.join(', ') || 'Unknown Author'}
                        </Text>
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

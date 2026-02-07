import { useAppTheme } from '@/components/material3-provider';
import { AnimatedBookItem } from '@/components/ui/AnimatedBookItem';
import { EmptySearchState, NoResultsState } from '@/components/ui/SearchLoadingState';
import { SearchSkeletonList } from '@/components/ui/SkeletonLoader';
import { usePreviousSearches } from '@/hooks/usePreviousSearches';
import { OpenLibraryBook, OpenLibraryResponse, useSearchBooks } from '@/hooks/useSearchBooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation , useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const unsubscribe = navigation.addListener('focus', () => {
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

  const handleImageError = (coverUrl: string) => {
    setFailedImages(prev => new Set(prev).add(coverUrl));
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
                      <MaterialIcons name="history" size={20} color={colors.onSurfaceVariant} />
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
            <EmptySearchState />
          )
        ) : isLoading ? (
          <SearchSkeletonList count={5} />
        ) : !searchResults || searchResults.docs?.length === 0 ? (
          <NoResultsState />
        ) : (
          <View className="gap-3">
            {searchResults.docs?.map((book: OpenLibraryBook, index: number) => (
              <AnimatedBookItem
                key={book.key}
                book={book}
                index={index}
                onPress={handleBookPress}
                failedImages={failedImages}
                onImageError={handleImageError}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

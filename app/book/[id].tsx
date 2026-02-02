import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCompleteBook } from '@/hooks/useCompleteBook';
import { useUncompleteBook } from '@/hooks/useUncompleteBook';
import { useRateBook } from '@/hooks/useRateBook';
import { useUpdateProgress } from '@/hooks/useUpdateProgress';
import { Id } from 'convex/_generated/dataModel';
import { BookHeader } from '@/components/book/BookHeader';
import { BookDescription } from '@/components/book/BookDescription';
import { BookMetaInfo } from '@/components/book/BookMetaInfo';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Section, Spacer } from '@/components/ui/Section';
import { ProgressSlider, ProgressCard } from '@/components/ui/ProgressSlider';
import { RatingChips, RatingDisplay } from '@/components/ui/RatingPicker';
import { Checkbox } from '@/components/ui/Chips';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useAppTheme } from '@/components/material3-provider';
import { PageLoading } from '@/components/ui/StateComponents';

type BookDetail = {
  _id: Id<'books'>;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  currentPage: number;
  totalPages: number;
  status: string;
  rating?: { rating: number };
};

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { colors } = useAppTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  console.log('🔍 [BookDetailScreen] Component rendered');
  console.log('🔍 [BookDetailScreen] id from params:', id);
  console.log('🔍 [BookDetailScreen] id type:', typeof id);
  console.log('🔍 [BookDetailScreen] id value (JSON):', JSON.stringify(id));

  const bookDetail = useQuery(
    api.books.getBookById,
    id ? { bookId: id as any } : 'skip'
  );

  console.log('🔍 [BookDetailScreen] bookDetail result:', bookDetail);
  console.log('🔍 [BookDetailScreen] bookDetail type:', typeof bookDetail);
  console.log('🔍 [BookDetailScreen] bookDetail is undefined?:', bookDetail === undefined);

  const lists = useQuery(api.lists.getUserLists, {});
  const updateProgress = useUpdateProgress();
  const rateBook = useRateBook();
  const completeBook = useCompleteBook();
  const uncompleteBook = useUncompleteBook();

  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [showProgressSlider, setShowProgressSlider] = useState(false);
  const [showRatingPicker, setShowRatingPicker] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const book = bookDetail as BookDetail | null | undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
    });
  }, [colorScheme, navigation]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [50, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        elevation: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, 4],
          extrapolate: 'clamp',
        }) as any,
      },
      headerTitle: () => (
        <Animated.Text
          style={{
            color: colors.onSurface,
            opacity: titleOpacity,
            fontSize: 17,
            fontWeight: '600',
          }}
          numberOfLines={1}
        >
          {book?.title || ''}
        </Animated.Text>
      ),
      headerTransparent: true,
      headerBackground: () => (
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            opacity: headerOpacity,
          }}
        />
      ),
    });
  }, [navigation, colors, scrollY, book?.title, headerOpacity, titleOpacity]);

  useEffect(() => {
    console.log('🔍 [BookDetailScreen] useEffect triggered');
    console.log('🔍 [BookDetailScreen] id param:', id);
    console.log('🔍 [BookDetailScreen] id type:', typeof id);
    console.log('🔍 [BookDetailScreen] id value:', JSON.stringify(id));
    console.log('🔍 [BookDetailScreen] bookDetail:', bookDetail);
    console.log('🔍 [BookDetailScreen] bookDetail type:', typeof bookDetail);
    console.log('🔍 [BookDetailScreen] bookDetail is undefined?:', bookDetail === undefined);

    if (id === undefined || id === null || id === '') {
      console.log('🔍 [BookDetailScreen] ID is invalid, setting isLoading false');
      setIsLoading(false);
    } else if (bookDetail !== undefined) {
      console.log('🔍 [BookDetailScreen] bookDetail is resolved, setting isLoading false');
      setIsLoading(false);
    } else {
      console.log('🔍 [BookDetailScreen] Still waiting for bookDetail...');
    }
  }, [id, bookDetail]);

  const handleProgressUpdate = (newPage: number) => {
    if (!book) return;
    updateProgress.mutate({ bookId: book._id, currentPage: newPage });
    setShowProgressSlider(false);
  };

  const handleRatingUpdate = (rating: number) => {
    if (!book) return;
    rateBook.mutate({ bookId: book._id, rating });
    setShowRatingPicker(false);
  };

  const handleComplete = () => {
    if (!book) return;
    completeBook.mutate(book._id);
  };

  const handleUncomplete = () => {
    if (!book) return;
    uncompleteBook.mutate(book._id);
  };

  const toggleList = (listId: string) => {
    if (selectedListIds.includes(listId)) {
      setSelectedListIds(selectedListIds.filter((id) => id !== listId));
    } else {
      setSelectedListIds([...selectedListIds, listId]);
    }
  };

  if (isLoading) {
    console.log('🔍 [BookDetailScreen] Rendering loading state');
    return <PageLoading message="Loading book details..." />;
  }

  if (!book) {
    console.log('🔍 [BookDetailScreen] Rendering not found state');
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
        <Text className="text-center" style={{ color: colors.onSurface }}>
          Book not found
        </Text>
        <Text className="text-center text-sm mt-2" style={{ color: colors.onSurfaceVariant }}>
          This book may have been deleted or you don&apos;t have access to it.
        </Text>
        <Text className="text-center text-xs mt-4" style={{ color: colors.onSurfaceVariant }}>
          Debug: id = {id}
        </Text>
      </View>
    );
  }

  const isCompleted = book.status === 'completed';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <BookHeader
          title={book.title}
          author={book.author}
          coverUrl={book.coverUrl}
        />

        <View className="px-4 -mt-4 pb-32">
          <Section className="mb-6">
            <BookDescription description={book.description} />
          </Section>

          <Section title="Reading Progress" className="mb-6">
            <Card variant="elevated">
              <CardContent className="p-4">
                <ProgressCard
                  label="Pages Read"
                  value={book.currentPage}
                  max={book.totalPages}
                  onEdit={() => setShowProgressSlider(true)}
                />

                {showProgressSlider && (
                  <View className="mt-4">
                    <ProgressSlider
                      value={book.currentPage}
                      max={book.totalPages}
                      onChange={handleProgressUpdate}
                    />
                  </View>
                )}

                <Spacer size={16} />

                <View className="flex-row gap-3">
                  <Button
                    onPress={() => setShowProgressSlider(!showProgressSlider)}
                    variant="outlined"
                    size="medium"
                    className="flex-1"
                  >
                    Update Progress
                  </Button>

                  {isCompleted ? (
                    <Button
                      onPress={handleUncomplete}
                      variant="outlined"
                      size="medium"
                      className="flex-1"
                    >
                      Mark as Reading
                    </Button>
                  ) : (
                    <Button
                      onPress={handleComplete}
                      variant="filled"
                      size="medium"
                      className="flex-1"
                    >
                      Mark Complete
                    </Button>
                  )}
                </View>
              </CardContent>
            </Card>
          </Section>

          <Section title="Rating" className="mb-6">
            <Card variant="elevated">
              <CardContent className="p-4">
                {book.rating && !showRatingPicker && (
                  <View className="items-center mb-4">
                    <RatingDisplay rating={book.rating.rating} />
                  </View>
                )}

                {showRatingPicker && (
                  <View className="mb-4">
                    <Text className="text-sm mb-3 text-center" style={{ color: colors.onSurfaceVariant }}>
                      Rate this book
                    </Text>
                    <RatingChips
                      value={book.rating?.rating}
                      onChange={handleRatingUpdate}
                    />
                  </View>
                )}

                <Button
                  onPress={() => setShowRatingPicker(!showRatingPicker)}
                  variant="outlined"
                  size="medium"
                  className="w-full"
                >
                  {showRatingPicker ? 'Cancel' : book.rating ? 'Change Rating' : 'Rate Book'}
                </Button>
              </CardContent>
            </Card>
          </Section>

          {lists && lists.length > 0 && (
            <Section title="Add to Lists" className="mb-6">
              <Card
                variant="outlined"
                onPress={() => setShowListSelector(true)}
              >
                <CardContent className="p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm" style={{ color: colors.onSurface }}>
                      {selectedListIds.length > 0
                        ? `${selectedListIds.length} list${selectedListIds.length > 1 ? 's' : ''} selected`
                        : 'Select lists'}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </Section>
          )}

          <Section title="Book Details" className="mb-6">
            <BookMetaInfo
              pageCount={book.totalPages}
            />
          </Section>
        </View>
      </ScrollView>

      <BottomSheet
        visible={showListSelector}
        onClose={() => setShowListSelector(false)}
        title="Add to Lists"
        subtitle="Select lists to add this book to"
        maxHeight={500}
      >
        <View className="gap-2">
          {lists?.map((list) => (
            <Checkbox
              key={list._id}
              label={list.name}
              checked={selectedListIds.includes(list._id)}
              onChange={() => toggleList(list._id)}
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

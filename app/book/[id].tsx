import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
import { BookDetailLoading } from '@/components/book/BookDetailLoading';
import { BookDetail } from '@/types/book';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBookDetailUI } from '@/hooks/useBookDetailUI';
import { useBookHandlers } from '@/hooks/useBookHandlers';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { colors } = useAppTheme();

  const bookDetail = useQuery(
    api.books.getBookById,
    id ? { bookId: id as any } : 'skip'
  );

  const lists = useQuery(api.lists.getUserLists, {});
  const [isLoading, setIsLoading] = useState(true);

  const book = bookDetail as BookDetail | null | undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
    });
  }, [colorScheme, navigation]);

  useEffect(() => {
    if (id === undefined || id === null || id === '') {
      setIsLoading(false);
    } else if (bookDetail !== undefined) {
      setIsLoading(false);
    }
  }, [id, bookDetail]);

  const { scrollY } = useScrollAnimation({
    title: book?.title || '',
    colors,
    navigation,
  });

  const {
    selectedListIds,
    showProgressSlider,
    setShowProgressSlider,
    showRatingPicker,
    setShowRatingPicker,
    showListSelector,
    setShowListSelector,
    showRemoveDialog,
    setShowRemoveDialog,
    toggleList,
  } = useBookDetailUI();

  const {
    handleProgressUpdate,
    handleRatingUpdate,
    handleComplete,
    handleUncomplete,
    handleRemove,
    removeBook,
  } = useBookHandlers(book);

  const handleRatingUpdateWithClose = (rating: number) => {
    handleRatingUpdate(rating);
    setShowRatingPicker(false);
  };

  const loadingState = <BookDetailLoading isLoading={isLoading} book={book} colors={colors} id={id || ''} />;

  if (isLoading || !book) {
    return loadingState;
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
                    {showProgressSlider ? 'Done' : 'Update Progress'}
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
                      onChange={handleRatingUpdateWithClose}
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

          <Section title="Manage Book" className="mb-6">
            <Card variant="outlined">
              <CardContent className="p-4">
                <Button
                  onPress={() => setShowRemoveDialog(true)}
                  variant="text"
                  className="w-full"
                >
                  Remove from Library
                </Button>
              </CardContent>
            </Card>
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

      <BottomSheet
        visible={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        title="Remove Book"
        subtitle="Are you sure you want to remove this book from your library?"
      >
        <View className="gap-3">
          <Text className="text-center" style={{ color: colors.onSurfaceVariant }}>
            This action cannot be undone. All reading progress, ratings, and list associations will be deleted.
          </Text>
          <View className="flex-row gap-3 mt-4">
            <Button
              onPress={() => setShowRemoveDialog(false)}
              variant="outlined"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleRemove}
              variant="filled"
              className="flex-1"
              loading={removeBook.isPending}
            >
              Remove
            </Button>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

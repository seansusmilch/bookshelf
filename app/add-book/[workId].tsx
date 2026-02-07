import { useState } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAddBook } from '@/hooks/useAddBook';
import { BookHeader } from '@/components/book/BookHeader';
import { BookDescription } from '@/components/book/BookDescription';
import { BookMetaInfo } from '@/components/book/BookMetaInfo';
import { StatusSelector } from '@/components/book/StatusSelector';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PageLoading, PageError } from '@/components/ui/StateComponents';
import { useAppTheme } from '@/components/material3-provider';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBookEditions } from '@/hooks/useBookEditions';

export default function AddBookScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const addBook = useAddBook();

  const { workId, author: authorFallback, coverUrl: coverUrlFallback, title: titleFallback } =
    useLocalSearchParams<{ workId: string; author?: string; coverUrl?: string; title?: string }>();

  const {
    bookDetails,
    isLoading,
    error,
    workTitle,
    initialCoverUrl,
    initialAuthor,
    reload,
  } = useBookEditions({
    workId,
    authorFallback,
    coverUrlFallback,
    titleFallback,
  });

  const { scrollY } = useScrollAnimation({
    title: workTitle,
    navigation,
    colors,
  });

  const [selectedStatus, setSelectedStatus] = useState('want_to_read');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddBook = async () => {
    if (!bookDetails) {
      return;
    }

    const authorToSave = initialAuthor || bookDetails.author;
    if (!authorToSave || typeof authorToSave !== 'string' || authorToSave.trim() === '') {
      return;
    }

    const titleToSave = workTitle || bookDetails.title;
    if (!titleToSave || titleToSave.trim() === '') {
      return;
    }

    try {
      setIsAdding(true);
      await addBook.mutate({
        title: titleToSave,
        author: authorToSave.trim(),
        description: bookDetails.description,
        coverUrl: initialCoverUrl || bookDetails.coverUrl,
        isbn10: bookDetails.isbn10?.[0],
        isbn13: bookDetails.isbn13?.[0],
        totalPages: bookDetails.pageCount || 0,
        status: selectedStatus,
        openLibraryId: bookDetails.key.split('/').pop(),
      });
      router.back();
    } catch {
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading book details..." />;
  }

  if (error || !bookDetails) {
    return (
      <PageError
        message={error || 'Failed to load book'}
        onRetry={reload}
      />
    );
  }

  const hasMetaInfo = bookDetails.pageCount || bookDetails.publishDate || bookDetails.publishers?.[0]?.name;

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
          title={workTitle || bookDetails.title}
          author={initialAuthor || bookDetails.author}
          coverUrl={initialCoverUrl}
        />

        <View className="px-4 pt-5 pb-24 gap-5">
          {/* Description */}
          {bookDetails.description && (
            <Card variant="elevated">
              <CardContent className="p-4">
                <BookDescription description={bookDetails.description} />
              </CardContent>
            </Card>
          )}

          {/* Details */}
          {hasMetaInfo && (
            <View className="gap-2">
              <Text
                className="text-xs font-medium uppercase px-1"
                style={{ color: colors.onSurfaceVariant, letterSpacing: 1 }}
              >
                Details
              </Text>
              <BookMetaInfo
                pageCount={bookDetails.pageCount}
                publishDate={bookDetails.publishDate}
                publisher={bookDetails.publishers?.[0]?.name}
              />
            </View>
          )}

          {/* Reading Status */}
          <View className="gap-2">
            <Text
              className="text-xs font-medium uppercase px-1"
              style={{ color: colors.onSurfaceVariant, letterSpacing: 1 }}
            >
              Reading Status
            </Text>
            <StatusSelector
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </View>

          {/* Add Button */}
          <Button
            onPress={handleAddBook}
            loading={isAdding}
            disabled={isAdding}
            variant="filled"
            size="large"
            className="w-full"
          >
            Add to Your Library
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

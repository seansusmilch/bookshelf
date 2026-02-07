import { useState } from 'react';
import { View, Animated, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAddBook } from '@/hooks/useAddBook';
import { BookHeader } from '@/components/book/BookHeader';
import { BookDescription } from '@/components/book/BookDescription';
import { BookMetaInfo } from '@/components/book/BookMetaInfo';
import { EditionSelector } from '@/components/book/EditionSelector';
import { StatusSelector } from '@/components/book/StatusSelector';
import { WorkDetailLoader } from '@/components/book/WorkDetailLoader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
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
    allEditions,
    selectedEdition,
    isEditionsLoading,
    editionError,
    workDetails,
    showWorkDetailsLoader,
    actualWorkId,
    actualEditionId,
    workTitle,
    initialCoverUrl,
    initialAuthor,
    setSelectedEdition,
    setWorkDetails,
    setShowWorkDetailsLoader,
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
    if (!selectedEdition || !workDetails) {
      return;
    }

    const authorToSave = initialAuthor || workDetails.author;
    if (!authorToSave || typeof authorToSave !== 'string' || authorToSave.trim() === '') {
      return;
    }

    const titleToSave = workTitle || selectedEdition.title;
    if (!titleToSave || titleToSave.trim() === '') {
      return;
    }

    try {
      setIsAdding(true);
      await addBook.mutate({
        title: titleToSave,
        author: authorToSave.trim(),
        description: workDetails.description,
        coverUrl: initialCoverUrl || selectedEdition.coverUrl,
        isbn10: selectedEdition.isbn10?.[0],
        isbn13: selectedEdition.isbn13?.[0],
        totalPages: selectedEdition.pageCount || 0,
        status: selectedStatus,
        openLibraryId: selectedEdition.key.split('/').pop(),
      });
      router.back();
    } catch {
    } finally {
      setIsAdding(false);
    }
  };

  if (isEditionsLoading) {
    return <PageLoading message="Loading book details..." />;
  }

  if (editionError || !selectedEdition) {
    return (
      <PageError
        message={editionError || 'Failed to load book'}
        onRetry={reload}
      />
    );
  }

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
          title={workTitle || selectedEdition.title}
          author={initialAuthor || workDetails?.author || 'Unknown Author'}
          coverUrl={initialCoverUrl}
        />

        <View className="px-4 -mt-4 pb-24">
          {showWorkDetailsLoader && actualWorkId && (
            <>
              <WorkDetailLoader
                workId={actualWorkId}
                editionId={actualEditionId || undefined}
                authorFallback={authorFallback ? decodeURIComponent(authorFallback) : undefined}
                onLoad={(data) => {
                  setWorkDetails(data);
                  setShowWorkDetailsLoader(false);
                }}
                onError={(error) => {
                  setWorkDetails({
                    author: authorFallback ? decodeURIComponent(authorFallback) : 'Unknown Author',
                    description: undefined
                  });
                  setShowWorkDetailsLoader(false);
                }}
              />
            </>
          )}

          {!showWorkDetailsLoader && workDetails && (
            <>
              <Section className="mb-6">
                  <BookDescription description={workDetails.description} />
                </Section>

              <Section title="Book Details" className="mb-6">
                <BookMetaInfo
                  pageCount={selectedEdition.pageCount}
                  publishDate={selectedEdition.publishDate}
                  publisher={selectedEdition.publishers?.[0]?.name}
                />
              </Section>

              <Section title="Select Edition" className="mb-6">
                <EditionSelector
                  currentEdition={selectedEdition}
                  allEditions={allEditions}
                  onEditionChange={setSelectedEdition}
                />
              </Section>

              <Section title="Reading Status" className="mb-6">
                <StatusSelector
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                />
              </Section>

              <Card variant="elevated">
                <CardContent className="p-4">
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
                </CardContent>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

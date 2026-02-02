import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
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

type Edition = {
  key: string;
  title: string;
  pageCount?: number;
  publishDate?: string;
  coverUrl?: string;
  isbn10?: string[];
  isbn13?: string[];
  publishers?: { name: string }[];
  languages?: { key: string }[];
  covers?: number[];
  authors?: any[];
};

export default function AddBookScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { workId: paramId, author: authorFallback } = useLocalSearchParams<{ workId: string; author?: string }>();
  const addBook = useAddBook();
  const getWorkEditions = useAction(api.openLibrarySearch.getWorkEditions);
  const getBookDetails = useAction(api.openLibrarySearch.getBookDetails);
  const scrollY = useRef(new Animated.Value(0)).current;

  console.log('🔍 [AddBookScreen] Component rendered');

  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [allEditions, setAllEditions] = useState<Edition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('want_to_read');
  const [isEditionsLoading, setIsEditionsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editionError, setEditionError] = useState<string | null>(null);
  const [workDetails, setWorkDetails] = useState<{ author: string; description: string | undefined } | null>(null);
  const [showWorkDetailsLoader, setShowWorkDetailsLoader] = useState(true);
  const [actualEditionId, setActualEditionId] = useState<string | undefined>(undefined);
  const [actualWorkId, setActualWorkId] = useState<string | undefined>(undefined);

  const loadEditions = useCallback(async () => {
    console.log('🔍 [AddBookScreen] loadEditions called');
    console.log('🔍 [AddBookScreen] paramId:', paramId);

    try {
      setIsEditionsLoading(true);
      setEditionError(null);

      if (!paramId) {
        throw new Error('workId parameter is missing');
      }

      let actualWorkId: string = paramId;
      let editionId: string | undefined = undefined;

      const isEditionParam = paramId.match(/^OL\d+M$/);

      if (isEditionParam) {
        console.log('🔍 [AddBookScreen] paramId is an edition, fetching edition details first');
        const olid = paramId.startsWith('/') ? paramId : `/books/${paramId}`;
        const edition = await getBookDetails({ openLibraryId: olid });

        if (edition.works && edition.works.length > 0) {
          actualWorkId = edition.works[0].key.split('/').pop() || paramId;
          editionId = paramId;
          console.log('🔍 [AddBookScreen] Extracted work ID from edition:', actualWorkId);
        } else {
          console.warn('🔍 [AddBookScreen] Edition has no works array, using paramId directly');
          actualWorkId = paramId;
          editionId = undefined;
        }
      } else {
        actualWorkId = paramId;
        editionId = undefined;
      }

      setActualEditionId(editionId);
      setActualWorkId(actualWorkId);

      console.log('🔍 [AddBookScreen] Calling getWorkEditions with workId:', actualWorkId);
      const editionsResponse = await getWorkEditions({ openLibraryId: `/works/${actualWorkId}`, limit: 50 });
      console.log('🔍 [AddBookScreen] getWorkEditions response:', editionsResponse);
      console.log('🔍 [AddBookScreen] editions count:', editionsResponse?.entries?.length);

      const editions = editionsResponse.entries.map((entry: any) => ({
        key: entry.key,
        title: entry.title,
        pageCount: entry.number_of_pages,
        publishDate: entry.publish_date,
        coverUrl: entry.covers?.[0] ? `https://covers.openlibrary.org/b/id/${entry.covers[0]}-M.jpg` : undefined,
        isbn10: entry.isbn_10,
        isbn13: entry.isbn_13,
        publishers: entry.publishers,
        languages: entry.languages,
        covers: entry.covers,
        authors: entry.authors,
      }));

      const editionsWithAuthors = editions.filter((edition: any) => {
        const hasAuthors = edition.authors && edition.authors.length > 0;
        if (!hasAuthors) {
          console.log('🔍 [AddBookScreen] Filtering out edition without authors:', edition.key);
        }
        return hasAuthors;
      });

      console.log('🔍 [AddBookScreen] Processed editions:', editions.length, 'with authors:', editionsWithAuthors.length);

      if (editionsWithAuthors.length === 0) {
        console.warn('🔍 [AddBookScreen] No editions found with author information out of', editions.length, 'total editions');
        throw new Error('This book has no author information available');
      }

      const scoreEdition = (edition: Edition) => {
        let score = 0;

        const hasPageCount = edition.pageCount && edition.pageCount > 0;
        const hasEnglish = edition.languages?.some((l: any) => l.key === '/languages/eng');
        const hasCover = edition.coverUrl || (edition.covers && edition.covers.length > 0);
        const hasAuthors = edition.authors && edition.authors.length > 0 && edition.authors[0]?.name;

        if (hasPageCount) {
          score += 100;
        }

        if (hasEnglish) {
          score += 50;
        }

        if (hasCover) {
          score += 75;
        }

        if (hasAuthors) {
          score += 60;
        }

        return score;
      };

      const scoredEditions = editionsWithAuthors.map((edition) => ({
        edition,
        score: scoreEdition(edition),
      }));

      const sortedEditions = scoredEditions.sort((a, b) => b.score - a.score);
      const selected = sortedEditions[0].edition;

      setAllEditions(editionsWithAuthors);
      setSelectedEdition(selected);
      console.log('🔍 [AddBookScreen] Selected edition:', selected.title, 'score:', sortedEditions[0].score);
    } catch (err) {
      console.error('🔍 [AddBookScreen] Error loading editions:', err);
      setEditionError('Failed to load book editions. Please try again.');
    } finally {
      console.log('🔍 [AddBookScreen] loadEditions finished, setting loading false');
      setIsEditionsLoading(false);
    }
  }, [paramId, getWorkEditions, getBookDetails]);

  useEffect(() => {
    console.log('🔍 [AddBookScreen] useEffect triggered');
    console.log('🔍 [AddBookScreen] Calling loadEditions...');
    loadEditions();
  }, [loadEditions]);

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
          {selectedEdition?.title || 'Add Book'}
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
  }, [navigation, colors, scrollY, selectedEdition?.title, headerOpacity, titleOpacity]);

  const handleAddBook = async () => {
    console.log('🔍 [AddBookScreen] handleAddBook called', { selectedEdition: !!selectedEdition, workDetails, showWorkDetailsLoader });

    if (!selectedEdition || !workDetails) {
      console.log('🔍 [AddBookScreen] Cannot add book - missing data');
      return;
    }

    if (!workDetails.author || typeof workDetails.author !== 'string' || workDetails.author.trim() === '') {
      console.error('🔍 [AddBookScreen] Author is invalid:', workDetails);
      return;
    }

    if (!selectedEdition.title || selectedEdition.title.trim() === '') {
      console.error('🔍 [AddBookScreen] Title is invalid:', selectedEdition);
      return;
    }

    try {
      setIsAdding(true);
      await addBook.mutate({
        title: selectedEdition.title,
        author: workDetails.author.trim(),
        description: workDetails.description,
        coverUrl: selectedEdition.coverUrl,
        isbn10: selectedEdition.isbn10?.[0],
        isbn13: selectedEdition.isbn13?.[0],
        totalPages: selectedEdition.pageCount || 0,
        status: selectedStatus,
        openLibraryId: selectedEdition.key.split('/').pop(),
      });
      router.back();
    } catch (err) {
      console.error('Error adding book:', err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isEditionsLoading) {
    console.log('🔍 [AddBookScreen] Rendering loading state');
    return <PageLoading message="Loading book details..." />;
  }

  if (editionError || !selectedEdition) {
    console.log('🔍 [AddBookScreen] Rendering error state');
    console.log('🔍 [AddBookScreen] editionError:', editionError);
    console.log('🔍 [AddBookScreen] selectedEdition:', selectedEdition);
    return (
      <PageError
        message={editionError || 'Failed to load book'}
        onRetry={loadEditions}
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
          title={selectedEdition.title}
          author={workDetails?.author || 'Unknown Author'}
          coverUrl={selectedEdition.coverUrl}
        />

        <View className="px-4 -mt-4 pb-24">
          {showWorkDetailsLoader && actualWorkId && (
            <>
              <WorkDetailLoader
                workId={actualWorkId}
                editionId={actualEditionId || undefined}
                authorFallback={authorFallback ? decodeURIComponent(authorFallback) : undefined}
                onLoad={(data) => {
                  console.log('🔍 [AddBookScreen] WorkDetailLoader loaded:', data);
                  setWorkDetails(data);
                  setShowWorkDetailsLoader(false);
                }}
                onError={(error) => {
                  console.error('🔍 [AddBookScreen] WorkDetailLoader error:', error, 'Using fallback author:', authorFallback);
                  setWorkDetails({ author: authorFallback ? decodeURIComponent(authorFallback) : 'Unknown Author', description: undefined });
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

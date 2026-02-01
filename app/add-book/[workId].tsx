import { View } from '@/tw';
import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { Animated, ScrollView } from 'react-native';
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
};

export default function AddBookScreen() {
  const { workId } = useLocalSearchParams<{ workId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const addBook = useAddBook();
  const getWorkEditions = useAction(api.openLibrarySearch.getWorkEditions);
  const getBestEditionForWork = useAction(api.openLibrarySearch.getBestEditionForWork);
  const scrollY = useRef(new Animated.Value(0)).current;

  console.log('🔍 [AddBookScreen] Component rendered');
  console.log('🔍 [AddBookScreen] workId from params:', workId);
  console.log('🔍 [AddBookScreen] workId type:', typeof workId);
  console.log('🔍 [AddBookScreen] workId value:', JSON.stringify(workId));

  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [allEditions, setAllEditions] = useState<Edition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('want_to_read');
  const [isEditionsLoading, setIsEditionsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editionError, setEditionError] = useState<string | null>(null);
  const [workDetails, setWorkDetails] = useState<{ author: string; description?: string } | null>(null);
  const [showWorkDetailsLoader, setShowWorkDetailsLoader] = useState(true);

  const loadEditions = useCallback(async () => {
    console.log('🔍 [AddBookScreen] loadEditions called');
    console.log('🔍 [AddBookScreen] workId:', workId);

    try {
      setIsEditionsLoading(true);
      setEditionError(null);

      console.log('🔍 [AddBookScreen] Calling getWorkEditions with workId:', workId);
      const editionsResponse = await getWorkEditions({ openLibraryId: workId!, limit: 50 });
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
      }));
      setAllEditions(editions);
      console.log('🔍 [AddBookScreen] Processed editions:', editions.length);

      console.log('🔍 [AddBookScreen] Calling getBestEditionForWork with workId:', workId);
      const bestEdition = await getBestEditionForWork({ openLibraryId: workId! });
      console.log('🔍 [AddBookScreen] bestEdition:', bestEdition);

      const formattedBestEdition = {
        key: bestEdition.key,
        title: bestEdition.title,
        pageCount: bestEdition.number_of_pages,
        publishDate: bestEdition.publish_date,
        coverUrl: bestEdition.covers?.[0] ? `https://covers.openlibrary.org/b/id/${bestEdition.covers[0]}-M.jpg` : undefined,
        isbn10: bestEdition.isbn_10,
        isbn13: bestEdition.isbn_13,
        publishers: bestEdition.publishers,
      };
      setSelectedEdition(formattedBestEdition);
      console.log('🔍 [AddBookScreen] Selected edition set:', formattedBestEdition.title);
    } catch (err) {
      console.error('🔍 [AddBookScreen] Error loading editions:', err);
      setEditionError('Failed to load book editions. Please try again.');
    } finally {
      console.log('🔍 [AddBookScreen] loadEditions finished, setting loading false');
      setIsEditionsLoading(false);
    }
  }, [workId, getWorkEditions, getBestEditionForWork]);

  useEffect(() => {
    console.log('🔍 [AddBookScreen] useEffect triggered');
    console.log('🔍 [AddBookScreen] Calling loadEditions...');
    loadEditions();
  }, [workId, loadEditions]);

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
    if (!selectedEdition || !workDetails) return;

    try {
      setIsAdding(true);
      await addBook.mutate({
        title: selectedEdition.title,
        author: workDetails.author,
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
          {showWorkDetailsLoader && (
            <>
              <WorkDetailLoader
                workId={workId!}
                onLoad={(data) => {
                  console.log('🔍 [AddBookScreen] WorkDetailLoader loaded:', data);
                  setWorkDetails(data);
                  setShowWorkDetailsLoader(false);
                }}
                onError={(error) => {
                  console.error('🔍 [AddBookScreen] WorkDetailLoader error:', error);
                  setWorkDetails({ author: 'Unknown Author' });
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

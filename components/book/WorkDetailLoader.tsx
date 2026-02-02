import { useEffect, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { InlineLoading } from '@/components/ui/StateComponents';
import { fetchOpenLibrary } from 'convex/lib/openlibrary/client';

type AuthorEntry = {
  type?: { key: string };
  author?: { key: string; name: string };
  name?: string;
};

type WorkDetailLoaderProps = {
  workId: string;
  editionId?: string;
  onLoad: (data: { author: string; description: string | undefined }) => void;
  onError: (error: string) => void;
};

export const WorkDetailLoader = ({ workId, editionId, onLoad, onError }: WorkDetailLoaderProps) => {
  const getBookDetails = useAction(api.openLibrarySearch.getBookDetails);
  const getWork = useAction(api.openLibrarySearch.getWork);
  const [hasLoaded, setHasLoaded] = useState(false);

  console.log('🔍 [WorkDetailLoader] Component rendered with workId:', workId, 'editionId:', editionId);

  const loadWorkDetails = useCallback(async () => {
    console.log('🔍 [WorkDetailLoader] loadWorkDetails called with workId:', workId, 'editionId:', editionId);
    try {
      let olidToFetch = workId;
      let isFetchingEdition = false;

      if (editionId) {
        const match = editionId.match(/^OL\d+M$/);
        if (match) {
          console.log('🔍 [WorkDetailLoader] Using editionId for fetch:', editionId);
          olidToFetch = editionId.startsWith('/') ? editionId : `/books/${editionId}`;
          isFetchingEdition = true;
        }
      }

      let author = 'Unknown Author';
      let description: string | undefined = undefined;

      if (isFetchingEdition) {
        console.log('🔍 [WorkDetailLoader] Fetching edition details:', olidToFetch);
        const book = await getBookDetails({ openLibraryId: olidToFetch });
        console.log('🔍 [WorkDetailLoader] getBookDetails response:', book);

        if (book.authors && book.authors.length > 0) {
          author = book.authors[0].name;
          console.log('🔍 [WorkDetailLoader] Author found:', author);
        }

        if (book.description) {
          description = typeof book.description === 'string' ? book.description : book.description.value;
          console.log('🔍 [WorkDetailLoader] Description found, length:', description?.length);
        }
      } else {
        console.log('🔍 [WorkDetailLoader] Fetching work details:', olidToFetch);
        const work = await getWork({ openLibraryId: olidToFetch });
        console.log('🔍 [WorkDetailLoader] getWork response:', work);

        if (work.authors && work.authors.length > 0) {
          const authorEntry: AuthorEntry = work.authors[0];
          const typeKey = authorEntry.type?.key;
          const authorKey = authorEntry.author?.key;
          const isAuthorRole = typeKey === '/type/author_role';

          if (isAuthorRole && authorKey) {
            const authorOlad = authorKey.startsWith('/') ? authorKey : authorKey;
            console.log('🔍 [WorkDetailLoader] Fetching author details from:', authorOlad);
            const authorData = await fetchOpenLibrary<{ name: string }>(`/authors/${authorOlad}.json`);
            if (authorData.name) {
              author = authorData.name;
            }
          } else if (typeKey) {
            author = typeKey;
          } else if (authorEntry.name) {
            author = authorEntry.name;
          }
          console.log('🔍 [WorkDetailLoader] Author found:', author);
        }

        if (work.description) {
          description = typeof work.description === 'string' ? work.description : work.description.value;
          console.log('🔍 [WorkDetailLoader] Description found, length:', description?.length);
        }
      }

      console.log('🔍 [WorkDetailLoader] Calling onLoad with data');
      onLoad({ author, description });
      setHasLoaded(true);
    } catch (error) {
      console.error('🔍 [WorkDetailLoader] Error:', error);
      onError('Failed to load book details. Please try again.');
    }
  }, [workId, editionId, getBookDetails, getWork, onLoad, onError]);

  useEffect(() => {
    console.log('🔍 [WorkDetailLoader] useEffect triggered');
    loadWorkDetails();
  }, [workId, loadWorkDetails]);

  if (hasLoaded) {
    console.log('🔍 [WorkDetailLoader] Already loaded, returning null');
    return null;
  }

  console.log('🔍 [WorkDetailLoader] Rendering loading state');
  return (
    <View className="py-8">
      <InlineLoading message="Loading book details..." />
    </View>
  );
};

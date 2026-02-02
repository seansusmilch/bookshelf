import { useEffect, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { InlineLoading } from '@/components/ui/StateComponents';
import { fetchOpenLibrary, extractOLID } from 'convex/lib/openlibrary/client';

type AuthorEntry = {
  type?: { key: string };
  author?: { key: string; name: string };
  name?: string;
};

type WorkDetailLoaderProps = {
  workId: string;
  editionId?: string;
  authorFallback?: string;
  onLoad: (data: { author: string; description: string | undefined }) => void;
  onError: (error: string) => void;
};

export const WorkDetailLoader = ({ workId, editionId, authorFallback, onLoad, onError }: WorkDetailLoaderProps) => {
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
        console.log('🔍 [WorkDetailLoader] book.authors:', book.authors);

        if (book.authors && book.authors.length > 0) {
          const firstAuthor = book.authors[0];
          console.log('🔍 [WorkDetailLoader] firstAuthor:', firstAuthor);

          if (firstAuthor.name) {
            author = firstAuthor.name;
            console.log('🔍 [WorkDetailLoader] Author found from name:', author);
          } else if (firstAuthor.key) {
            try {
              const authorOlad = extractOLID(firstAuthor.key, 'author');
              console.log('🔍 [WorkDetailLoader] Fetching author details from key:', authorOlad);
              const authorData = await fetchOpenLibrary<{ name: string }>(`/authors/${authorOlad}.json`);
              if (authorData.name) {
                author = authorData.name;
                console.log('🔍 [WorkDetailLoader] Author found from fetch:', author);
              } else {
                console.warn('🔍 [WorkDetailLoader] Author data has no name');
              }
            } catch (err) {
              console.error('🔍 [WorkDetailLoader] Error fetching author details:', err);
            }
          }
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

          try {
            if (isAuthorRole && authorKey) {
              const authorOlad = extractOLID(authorKey, 'author');
              console.log('🔍 [WorkDetailLoader] Fetching author details from:', authorOlad);
              const authorData = await fetchOpenLibrary<{ name: string }>(`/authors/${authorOlad}.json`);
              if (authorData.name) {
                author = authorData.name;
              } else {
                console.warn('🔍 [WorkDetailLoader] Author data has no name, falling back to Unknown Author');
              }
            } else if (typeKey) {
              author = typeKey;
            } else if (authorEntry.name) {
              author = authorEntry.name;
            }
            console.log('🔍 [WorkDetailLoader] Author found:', author);
          } catch (err) {
            console.error('🔍 [WorkDetailLoader] Error fetching author details:', err);
            author = 'Unknown Author';
          }
        }

        if (work.description) {
          description = typeof work.description === 'string' ? work.description : work.description.value;
          console.log('🔍 [WorkDetailLoader] Description found, length:', description?.length);
        }
      }

      const finalAuthor = (typeof author === 'string' && author.trim()) ? author.trim() : authorFallback || 'Unknown Author';
      console.log('🔍 [WorkDetailLoader] Calling onLoad with data', { author: finalAuthor, descriptionLength: description?.length, usedFallback: !author || author === 'Unknown Author' });
      onLoad({ author: finalAuthor, description });
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

import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useState, useCallback } from 'react';

export const useSearchBooks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const searchBooks = useAction(api.googleSearch.searchBooks);

  const executeSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        return { items: [], totalItems: 0 };
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await searchBooks({ query });
        return data;
      } catch (err) {
        setError(err as Error);
        return { items: [], totalItems: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    [searchBooks]
  );

  return { isLoading, error, searchBooks: executeSearch };
};

export interface GoogleBooksResponse {
  items?: Array<{
    id: string | null | undefined;
    volumeInfo: {
      title: string;
      authors: string[] | undefined;
      description: string | undefined;
      imageLinks?: {
        thumbnail: string | undefined;
        smallThumbnail: string | undefined;
      } | undefined;
      pageCount: number | undefined;
      publishedDate: string | undefined;
      industryIdentifiers: Array<{
        type: string;
        identifier: string;
      }> | undefined;
    };
  }>;
  totalItems: number;
}

export interface GoogleBook {
  id: string | null | undefined;
  volumeInfo: {
    title: string;
    authors: string[] | undefined;
    description: string | undefined;
    imageLinks?: {
      thumbnail: string | undefined;
      smallThumbnail: string | undefined;
    } | undefined;
    pageCount: number | undefined;
    publishedDate: string | undefined;
    industryIdentifiers: Array<{
      type: string;
      identifier: string;
    }> | undefined;
  };
}

import { useQuery } from '@tanstack/react-query';

type GoogleBook = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    publishedDate?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
};

type GoogleBooksResponse = {
  items?: GoogleBook[];
  totalItems: number;
};

export const useSearchBooks = (query: string) => {
  return useQuery({
    queryKey: ['searchBooks', query],
    queryFn: async (): Promise<GoogleBooksResponse> => {
      if (!query) {
        return { totalItems: 0 };
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
      );

      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      return response.json();
    },
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 60 * 10,
  });
};

export type { GoogleBook };

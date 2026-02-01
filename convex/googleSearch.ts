'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';
import { google } from 'googleapis';

interface GoogleBooksVolume {
  id: string | null | undefined;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    publishedDate?: string;
    industryIdentifiers?: Array<{
      type?: string;
      identifier?: string;
    }>;
  };
}

interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
  totalItems: number;
}

export const searchBooks = action({
  args: {
    query: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!args.query || args.query.trim().length < 2) {
      return { items: [], totalItems: 0 };
    }

    const googleBooksApi = google.books({
      version: 'v1',
    });

    try {
      const response = await googleBooksApi.volumes.list({
        q: args.query,
        maxResults: 20,
      });

      if (!response.data.items || !Array.isArray(response.data.items)) {
        return {
          items: [],
          totalItems: response.data.totalItems || 0,
        };
      }

      const formattedItems = response.data.items.map((item: any) => ({
        id: item.id,
        volumeInfo: item.volumeInfo,
      }));

      return {
        items: formattedItems,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books');
    }
  },
});

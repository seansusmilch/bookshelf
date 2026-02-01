'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';
import {
  searchBooks as searchBooksAPI,
  getBook as getBookAPI,
  getBookByISBN as getBookByISBNAPI,
  type SearchQuery,
  type Book,
  type SearchResponse,
} from './lib/openlibrary';

export const searchBooks = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<SearchResponse> => {
    if (!args.query || args.query.trim().length < 2) {
      return { docs: [], num_found: 0, start: 0, num_found_exact: false };
    }

    const cachedResults = await ctx.runQuery('cache:getCachedSearchResults' as any, {
      query: args.query,
    });

    if (cachedResults) {
      return cachedResults;
    }

    const searchQuery: SearchQuery = {
      q: args.query,
      limit: 20,
    };

    try {
      const response = await searchBooksAPI(searchQuery);

      await ctx.runMutation('cache:cacheSearchResults' as any, {
        query: args.query,
        results: response,
      });

      return response;
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books');
    }
  },
});

export const getBookDetails = action({
  args: {
    openLibraryId: v.string(),
  },
  handler: async (ctx, args): Promise<Book> => {
    const cachedBook = await ctx.runQuery('cache:getCachedBookDetails' as any, {
      openLibraryId: args.openLibraryId,
    });

    if (cachedBook) {
      return cachedBook;
    }

    try {
      const book = await getBookAPI(args.openLibraryId);

      await ctx.runMutation('cache:cacheBookDetails' as any, {
        openLibraryId: args.openLibraryId,
        bookData: book,
      });

      return book;
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw new Error('Failed to fetch book details');
    }
  },
});

export const getBookByISBN = action({
  args: {
    isbn: v.string(),
  },
  handler: async (ctx, args): Promise<Book> => {
    try {
      const book = await getBookByISBNAPI(args.isbn);

      const olid = book.key.split('/').pop();

      if (olid) {
        await ctx.runMutation('cache:cacheBookDetails' as any, {
          openLibraryId: olid,
          bookData: book,
        });
      }

      return book;
    } catch (error) {
      console.error('Error fetching book by ISBN:', error);
      throw new Error('Failed to fetch book by ISBN');
    }
  },
});

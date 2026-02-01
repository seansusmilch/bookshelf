'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';
import {
  searchBooks as searchBooksAPI,
  getBook as getBookAPI,
  getBookByISBN as getBookByISBNAPI,
  getWorkEditions,
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
      console.warn('[searchBooks] Query too short or empty:', args.query);
      return { docs: [], num_found: 0, start: 0, num_found_exact: false };
    }

    const cachedResults = await ctx.runQuery('cache:getCachedSearchResults' as any, {
      query: args.query,
    });

    if (cachedResults) {
      console.log('[searchBooks] Cache hit for query:', args.query);
      return cachedResults;
    }

    const searchQuery: SearchQuery = {
      q: args.query,
      limit: 20,
    };

    console.log('[searchBooks] Searching for query:', args.query);

    try {
      const response = await searchBooksAPI(searchQuery);

      await ctx.runMutation('cache:cacheSearchResults' as any, {
        query: args.query,
        results: response,
      });

      console.log('[searchBooks] Search successful:', {
        query: args.query,
        resultsCount: response.docs.length,
        totalFound: response.num_found,
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[searchBooks] Error searching books:', {
          query: args.query,
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
        });

        if (error.name === 'OpenLibraryError' && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          const endpoint = (error as any).endpoint;

          console.warn('[searchBooks] OpenLibrary API error:', {
            query: args.query,
            statusCode,
            endpoint,
            is422: statusCode === 422,
            is429: statusCode === 429,
            is5xx: statusCode && statusCode >= 500,
          });

          if (statusCode === 422) {
            console.warn('[searchBooks] Unprocessable entity - returning empty results gracefully');
            return { docs: [], num_found: 0, start: 0, num_found_exact: false };
          }
        }
      }

      console.error('[searchBooks] Unexpected error:', error);
      throw new Error('Failed to search books');
    }
  },
});

export const getBookDetails = action({
  args: {
    openLibraryId: v.string(),
  },
  handler: async (ctx, args): Promise<Book> => {
    console.log('[getBookDetails] Fetching book details for:', args.openLibraryId);

    const cachedBook = await ctx.runQuery('cache:getCachedBookDetails' as any, {
      openLibraryId: args.openLibraryId,
    });

    if (cachedBook) {
      console.log('[getBookDetails] Cache hit for book:', args.openLibraryId);
      return cachedBook;
    }

    try {
      const book = await getBookAPI(args.openLibraryId);

      await ctx.runMutation('cache:cacheBookDetails' as any, {
        openLibraryId: args.openLibraryId,
        bookData: book,
      });

      console.log('[getBookDetails] Successfully fetched book:', {
        openLibraryId: args.openLibraryId,
        title: book.title,
      });

      return book;
    } catch (error) {
      console.error('[getBookDetails] Error fetching book details:', {
        openLibraryId: args.openLibraryId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
      });
      throw new Error('Failed to fetch book details');
    }
  },
});

export const getBookByISBN = action({
  args: {
    isbn: v.string(),
  },
  handler: async (ctx, args): Promise<Book> => {
    console.log('[getBookByISBN] Fetching book by ISBN:', args.isbn);

    try {
      const book = await getBookByISBNAPI(args.isbn);

      const olid = book.key.split('/').pop();

      if (olid) {
        await ctx.runMutation('cache:cacheBookDetails' as any, {
          openLibraryId: olid,
          bookData: book,
        });
      }

      console.log('[getBookByISBN] Successfully fetched book:', {
        isbn: args.isbn,
        openLibraryId: olid,
        title: book.title,
      });

      return book;
    } catch (error) {
      console.error('[getBookByISBN] Error fetching book by ISBN:', {
        isbn: args.isbn,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
      });
      throw new Error('Failed to fetch book by ISBN');
    }
  },
});

export const getBestEditionForWork = action({
  args: {
    openLibraryId: v.string(),
  },
  handler: async (ctx, args): Promise<Book> => {
    console.log('[getBestEditionForWork] Finding best edition for work:', args.openLibraryId);

    try {
      const editionsResponse = await getWorkEditions(args.openLibraryId);
      const entries = editionsResponse.entries;

      if (!entries || entries.length === 0) {
        console.warn('[getBestEditionForWork] No editions found for work:', args.openLibraryId);
        throw new Error(`No editions found for work: ${args.openLibraryId}`);
      }

      const bestEdition = entries.find((edition) => {
        const pageCount = edition.number_of_pages;
        return pageCount !== undefined && pageCount > 0;
      });

      const selectedEdition = bestEdition || entries[0];

      console.log('[getBestEditionForWork] Selected edition:', {
        workId: args.openLibraryId,
        editionId: selectedEdition.key,
        title: selectedEdition.title,
        pageCount: selectedEdition.number_of_pages,
        hasValidPageCount: bestEdition !== undefined,
        totalEditions: entries.length,
      });

      return selectedEdition;
    } catch (error) {
      console.error('[getBestEditionForWork] Error finding best edition:', {
        workId: args.openLibraryId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
      });
      throw new Error(
        `Failed to find best edition for work: ${args.openLibraryId}`
      );
    }
  },
});

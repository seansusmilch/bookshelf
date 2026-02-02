import { v } from 'convex/values';
import { action } from './_generated/server';
import {
  extractOLID,
  getBook as getBookAPI,
  getBookByISBN as getBookByISBNAPI,
  getWork as getWorkAPI,
  getWorkEditions as getWorkEditionsAPI,
  searchBooks as searchBooksAPI,
  type Book,
  type SearchQuery,
  type SearchResponse,
  type Work,
} from './lib/openlibrary';
import type { EditionsResponse } from './lib/openlibrary/types';

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
      lang: 'eng',
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
      const book = await getBookAPI(extractOLID(args.openLibraryId, 'book'));

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

function scoreEdition(edition: Book): number {
  let score = 0;

  // Prefer editions with covers (highest priority)
  if (edition.covers && edition.covers.length > 0) {
    score += 100;
  }

  // Prefer English language
  const hasEnglish = edition.languages?.some(l => l.key === '/languages/eng');
  if (hasEnglish) {
    score += 50;
  }

  // Prefer more recent editions (within last 30 years)
  if (edition.publish_date) {
    const year = parseInt(edition.publish_date.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (!isNaN(year)) {
      if (year >= currentYear - 5) {
        score += 30;
      } else if (year >= currentYear - 15) {
        score += 20;
      } else if (year >= 1990) {
        score += 10;
      }
    }
  }

  // Prefer physical books over ebooks
  if (edition.physical_format && edition.physical_format !== 'ebook') {
    score += 15;
  }

  // Prefer editions with ISBN
  const hasISBN = (edition.isbn_13 && edition.isbn_13.length > 0) ||
                   (edition.isbn_10 && edition.isbn_10.length > 0);
  if (hasISBN) {
    score += 25;
  }

  // Prefer editions with page count
  if (edition.number_of_pages) {
    score += 10;
  }

  // Prefer editions with publishers (indicates more complete metadata)
  if (edition.publishers && edition.publishers.length > 0) {
    score += 5;
  }

  return score;
}

export const getBestEditionForWork = action({
  args: {
    openLibraryId: v.string(),
  },
  handler: async (ctx, args): Promise<Book> => {
    console.log('[getBestEditionForWork] Finding best edition for work:', args.openLibraryId);

    try {
      const editionsResponse = await getWorkEditionsAPI(extractOLID(args.openLibraryId, 'work'));
      const entries = editionsResponse.entries;

      if (!entries || entries.length === 0) {
        console.warn('[getBestEditionForWork] No editions found for work:', args.openLibraryId);
        throw new Error(`No editions found for work: ${args.openLibraryId}`);
      }

      // Score all editions and select the best one
      const scoredEditions = entries.map(edition => ({
        edition,
        score: scoreEdition(edition)
      }));

      const sortedEditions = scoredEditions.sort((a, b) => b.score - a.score);
      const selectedEdition = sortedEditions[0].edition;

      console.log('[getBestEditionForWork] Selected edition:', {
        workId: args.openLibraryId,
        editionId: selectedEdition.key,
        title: selectedEdition.title,
        score: sortedEditions[0].score,
        pageCount: selectedEdition.number_of_pages,
        totalEditions: entries.length,
        topScores: sortedEditions.slice(0, 3).map(s => ({
          key: s.edition.key,
          score: s.score
        }))
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

export const getWork = action({
  args: {
    openLibraryId: v.string(),
  },
  handler: async (ctx, args): Promise<Work> => {
    console.log('[getWork] Fetching work details for:', args.openLibraryId);

    try {
      const work = await getWorkAPI(extractOLID(args.openLibraryId, 'work'));

      console.log('[getWork] Successfully fetched work:', {
        openLibraryId: args.openLibraryId,
        title: work.title,
      });

      return work;
    } catch (error) {
      console.error('[getWork] Error fetching work details:', {
        openLibraryId: args.openLibraryId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
      });
      throw new Error('Failed to fetch work details');
    }
  },
});

export const getWorkEditions = action({
  args: {
    openLibraryId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<EditionsResponse> => {
    console.log('[getWorkEditions] Fetching editions for work:', args.openLibraryId);

    try {
      const editionsResponse = await getWorkEditionsAPI(extractOLID(args.openLibraryId, 'work'), args.limit || 50);

      console.log('[getWorkEditions] Successfully fetched editions:', {
        workId: args.openLibraryId,
        count: editionsResponse.entries.length,
      });

      return editionsResponse;
    } catch (error) {
      console.error('[getWorkEditions] Error:', {
        workId: args.openLibraryId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Failed to fetch editions for work: ${args.openLibraryId}`);
    }
  },
});

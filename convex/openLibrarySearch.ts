import {v} from 'convex/values'
import {action} from './_generated/server'
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
} from './lib/openlibrary'

export const searchBooks = action({
    args: {
        query: v.string(),
        skipCache: v.optional(v.boolean()),
    },
    handler: async (ctx, args): Promise<SearchResponse> => {
        const normalizedQuery = args.query.toLowerCase().trim()

        if (!normalizedQuery || normalizedQuery.length < 2) {
            console.warn('[searchBooks] Query too short or empty:', args.query)
            return {docs: [], num_found: 0, start: 0, num_found_exact: false}
        }

        if (!args.skipCache) {
            const cachedResults = await ctx.runQuery('cache:getCachedSearchResults' as any, {
                query: normalizedQuery,
            })

            if (cachedResults) {
                console.log('[searchBooks] Cache hit for query:', args.query)
                return cachedResults
            }
        }

        const searchQuery: SearchQuery = {
            q: normalizedQuery,
            lang: 'eng',
            limit: 20,
        }

        console.log('[searchBooks] Searching for query:', normalizedQuery)

        try {
            const response = await searchBooksAPI(searchQuery)

            // Create a minimal response to avoid Convex's 8KB argument/return value limit
            // Keep only essential fields that the client needs
            const minimalDocs = response.docs.map((doc) => ({
                key: doc.key,
                title: doc.title,
                author_name: (doc.author_name || []).slice(0, 3), // max 3 authors
                author_key: (doc.author_key || []).slice(0, 3),
                cover_i: doc.cover_i,
                cover_edition_key: doc.cover_edition_key, // Needed for getting edition OLID
            }))

            const minimalResponse: SearchResponse = {
                start: response.start,
                num_found: response.num_found,
                num_found_exact: response.num_found_exact,
                docs: minimalDocs,
            }

            // Cache the minimal results
            try {
                await ctx.runMutation('cache:cacheSearchResults' as any, {
                    query: normalizedQuery,
                    results: minimalResponse,
                })
            } catch (cacheError) {
                // Don't fail the search if caching fails - just log and continue
                console.warn('[searchBooks] Failed to cache results (continuing anyway):', {
                    query: normalizedQuery,
                    error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
                })
            }

            console.log('[searchBooks] Search successful:', {
                query: normalizedQuery,
                resultsCount: response.docs.length,
                totalFound: response.num_found,
            })

            return minimalResponse
        } catch (error) {
            if (error instanceof Error) {
                console.error('[searchBooks] Error searching books:', {
                    query: normalizedQuery,
                    errorMessage: error.message,
                    errorName: error.name,
                    errorStack: error.stack,
                })

                if (error.name === 'OpenLibraryError' && 'statusCode' in error) {
                    const statusCode = (error as any).statusCode
                    const endpoint = (error as any).endpoint

                    console.warn('[searchBooks] OpenLibrary API error:', {
                        query: normalizedQuery,
                        statusCode,
                        endpoint,
                        is422: statusCode === 422,
                        is429: statusCode === 429,
                        is5xx: statusCode && statusCode >= 500,
                    })

                    if (statusCode === 422) {
                        console.warn(
                            '[searchBooks] Unprocessable entity - returning empty results gracefully'
                        )
                        return {docs: [], num_found: 0, start: 0, num_found_exact: false}
                    }
                }
            }

            console.error('[searchBooks] Unexpected error:', error)
            throw new Error('Failed to search books')
        }
    },
})

export const getBookDetails = action({
    args: {
        openLibraryId: v.string(),
    },
    handler: async (ctx, args): Promise<Book> => {
        console.log('[getBookDetails] Fetching book details for:', args.openLibraryId)

        const cachedBook = await ctx.runQuery('cache:getCachedBookDetails' as any, {
            openLibraryId: args.openLibraryId,
        })

        if (cachedBook) {
            console.log('[getBookDetails] Cache hit for book:', args.openLibraryId)
            return cachedBook
        }

        try {
            const book = await getBookAPI(extractOLID(args.openLibraryId, 'book'))

            await ctx.runMutation('cache:cacheBookDetails' as any, {
                openLibraryId: args.openLibraryId,
                bookData: book,
            })

            console.log('[getBookDetails] Successfully fetched book:', {
                openLibraryId: args.openLibraryId,
                title: book.title,
            })

            return book
        } catch (error) {
            console.error('[getBookDetails] Error fetching book details:', {
                openLibraryId: args.openLibraryId,
                error: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
            })
            throw new Error('Failed to fetch book details')
        }
    },
})

export const getBookByISBN = action({
    args: {
        isbn: v.string(),
    },
    handler: async (ctx, args): Promise<Book> => {
        console.log('[getBookByISBN] Fetching book by ISBN:', args.isbn)

        try {
            const book = await getBookByISBNAPI(args.isbn)

            const olid = book.key.split('/').pop()

            if (olid) {
                await ctx.runMutation('cache:cacheBookDetails' as any, {
                    openLibraryId: olid,
                    bookData: book,
                })
            }

            console.log('[getBookByISBN] Successfully fetched book:', {
                isbn: args.isbn,
                openLibraryId: olid,
                title: book.title,
            })

            return book
        } catch (error) {
            console.error('[getBookByISBN] Error fetching book by ISBN:', {
                isbn: args.isbn,
                error: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
            })
            throw new Error('Failed to fetch book by ISBN')
        }
    },
})

export const getWork = action({
    args: {
        openLibraryId: v.string(),
    },
    handler: async (ctx, args): Promise<Work> => {
        console.log('[getWork] Fetching work details for:', args.openLibraryId)

        try {
            const work = await getWorkAPI(extractOLID(args.openLibraryId, 'work'))

            console.log('[getWork] Successfully fetched work:', {
                openLibraryId: args.openLibraryId,
                title: work.title,
            })

            return work
        } catch (error) {
            console.error('[getWork] Error fetching work details:', {
                openLibraryId: args.openLibraryId,
                error: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
            })
            throw new Error('Failed to fetch work details')
        }
    },
})

export const getWorkEditions = action({
    args: {
        openLibraryId: v.string(),
    },
    handler: async (ctx, args): Promise<Book[]> => {
        console.log('[getWorkEditions] Fetching editions for work:', args.openLibraryId)

        try {
            const editions = await getWorkEditionsAPI(extractOLID(args.openLibraryId, 'work'))

            console.log('[getWorkEditions] Successfully fetched editions:', {
                openLibraryId: args.openLibraryId,
                count: editions.length,
            })

            return editions
        } catch (error) {
            console.error('[getWorkEditions] Error fetching work editions:', {
                openLibraryId: args.openLibraryId,
                error: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
            })
            throw new Error('Failed to fetch work editions')
        }
    },
})

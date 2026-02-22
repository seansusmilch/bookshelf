import {v} from 'convex/values'
import {action} from './_generated/server'
import {
    extractOLID,
    getBook as getBookAPI,
    getBookByISBN as getBookByISBNAPI,
    getWork as getWorkAPI,
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

            // Check covers for each result
            const docsWithCoverInfo = await Promise.all(
                response.docs.map(async (doc) => {
                    const olid = extractOLID(doc.key, 'work')
                    const hasCover = olid
                        ? await ctx.runMutation('covers:checkCover' as any, {olid})
                        : false
                    return {...doc, hasCover}
                })
            )

            const responseWithCovers = {
                ...response,
                docs: docsWithCoverInfo,
            }

            await ctx.runMutation('cache:cacheSearchResults' as any, {
                query: normalizedQuery,
                results: responseWithCovers,
            })

            console.log('[searchBooks] Search successful:', {
                query: normalizedQuery,
                resultsCount: response.docs.length,
                totalFound: response.num_found,
            })

            return responseWithCovers
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

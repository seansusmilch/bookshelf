import {query, mutation} from './_generated/server'
import {v} from 'convex/values'
import type {SearchResponse, Book} from './lib/openlibrary'

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

function isCacheValid(cachedAt: number): boolean {
    return Date.now() - cachedAt < CACHE_TTL
}

export const getCachedSearchResults = query({
    args: {
        query: v.string(),
    },
    handler: async (ctx, args): Promise<SearchResponse | null> => {
        const cached = await ctx.db
            .query('searchCache')
            .withIndex('by_query', (q) => q.eq('query', args.query))
            .first()

        if (!cached) return null

        if (!isCacheValid(cached.cachedAt)) return null

        return cached.results as SearchResponse
    },
})

// Type for slimmed-down search results (kept under Convex's 8KB argument limit)
export type SlimSearchResultDoc = {
    key: string
    title: string
    author_name: string[]
    author_key: string[]
    cover_i?: number
    hasCover?: boolean
    first_publish_year?: number
    edition_count?: number
    isbn?: string[]
}

export type SlimSearchResponse = {
    start: number
    num_found: number
    num_found_exact: boolean
    docs: SlimSearchResultDoc[]
}

export const cacheSearchResults = mutation({
    args: {
        query: v.string(),
        results: v.any(), // SlimSearchResponse
    },
    handler: async (ctx, args): Promise<void> => {
        const existing = await ctx.db
            .query('searchCache')
            .withIndex('by_query', (q) => q.eq('query', args.query))
            .first()

        if (existing) {
            await ctx.db.patch(existing._id, {
                results: args.results,
                cachedAt: Date.now(),
            })
        } else {
            await ctx.db.insert('searchCache', {
                query: args.query,
                results: args.results,
                cachedAt: Date.now(),
            })
        }
    },
})

export const getCachedBookDetails = query({
    args: {
        openLibraryId: v.string(),
    },
    handler: async (ctx, args): Promise<Book | null> => {
        const cached = await ctx.db
            .query('bookCache')
            .withIndex('by_olid', (q) => q.eq('openLibraryId', args.openLibraryId))
            .first()

        if (!cached) return null

        if (!isCacheValid(cached.cachedAt)) return null

        return cached.bookData as Book
    },
})

export const cacheBookDetails = mutation({
    args: {
        openLibraryId: v.string(),
        bookData: v.any(),
    },
    handler: async (ctx, args): Promise<void> => {
        const existing = await ctx.db
            .query('bookCache')
            .withIndex('by_olid', (q) => q.eq('openLibraryId', args.openLibraryId))
            .first()

        if (existing) {
            await ctx.db.patch(existing._id, {
                bookData: args.bookData,
                cachedAt: Date.now(),
            })
        } else {
            await ctx.db.insert('bookCache', {
                openLibraryId: args.openLibraryId,
                bookData: args.bookData,
                cachedAt: Date.now(),
            })
        }
    },
})

// Clear cached books that don't have author information
// This is useful when the author fetching logic is improved
export const clearBooksWithoutAuthors = mutation({
    args: {},
    handler: async (ctx): Promise<{cleared: number}> => {
        const allCachedBooks = await ctx.db.query('bookCache').collect()
        let cleared = 0

        for (const cached of allCachedBooks) {
            const bookData = cached.bookData as any
            // Check if the book has no authors array or has an empty authors array
            const hasNoAuthors =
                !bookData.authors ||
                (Array.isArray(bookData.authors) && bookData.authors.length === 0)

            if (hasNoAuthors) {
                await ctx.db.delete(cached._id)
                cleared++
            }
        }

        console.log('[clearBooksWithoutAuthors] Cleared', cleared, 'cached books without authors')
        return {cleared}
    },
})

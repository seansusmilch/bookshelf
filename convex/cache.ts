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

export const cacheSearchResults = mutation({
    args: {
        query: v.string(),
        results: v.any(),
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

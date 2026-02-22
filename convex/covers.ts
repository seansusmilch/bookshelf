import {v} from 'convex/values'
import {mutation, query, action} from './_generated/server'
import {checkCoverExists} from './lib/openlibrary/covers'

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Action that can use fetch() to check if a cover exists
export const checkCover = action({
    args: {olid: v.string()},
    handler: async (ctx, args) => {
        // Check cache first via query
        const cached = await ctx.runQuery('covers:getCachedCover' as any, {
            olid: args.olid,
        })

        if (cached !== null) {
            return cached
        }

        // Fetch metadata from Open Library
        const hasCover = await checkCoverExists(args.olid)

        // Cache the result via mutation
        await ctx.runMutation('covers:updateCoverCache' as any, {
            olid: args.olid,
            hasCover,
        })

        return hasCover
    },
})

// Mutation to update the cover cache (called by the action)
export const updateCoverCache = mutation({
    args: {
        olid: v.string(),
        hasCover: v.boolean(),
    },
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query('covers')
            .withIndex('by_olid', (q) => q.eq('olid', args.olid))
            .first()

        const now = Date.now()

        if (cached) {
            await ctx.db.patch(cached._id, {
                hasCover: args.hasCover,
                checkedAt: now,
            })
        } else {
            await ctx.db.insert('covers', {
                olid: args.olid,
                hasCover: args.hasCover,
                checkedAt: now,
            })
        }
    },
})

export const getCachedCover = query({
    args: {olid: v.string()},
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query('covers')
            .withIndex('by_olid', (q) => q.eq('olid', args.olid))
            .first()

        if (!cached) {
            return null
        }

        // Return null if cache is expired
        const age = Date.now() - cached.checkedAt
        if (age >= CACHE_TTL) {
            return null
        }

        return cached.hasCover
    },
})

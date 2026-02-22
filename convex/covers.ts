import {v} from 'convex/values'
import {mutation, query} from './_generated/server'
import {checkCoverExists} from './lib/openlibrary/covers'

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export const checkCover = mutation({
    args: {olid: v.string()},
    handler: async (ctx, args) => {
        // Check cache first
        const cached = await ctx.db
            .query('covers')
            .withIndex('by_olid', (q) => q.eq('olid', args.olid))
            .first()

        if (cached) {
            // Refresh if cache is older than 7 days
            const age = Date.now() - cached.checkedAt
            if (age < CACHE_TTL) {
                return cached.hasCover
            }
        }

        // Fetch metadata from Open Library
        const hasCover = await checkCoverExists(args.olid)

        // Cache the result
        if (cached) {
            await ctx.db.patch(cached._id, {
                hasCover,
                checkedAt: Date.now(),
            })
        } else {
            await ctx.db.insert('covers', {
                olid: args.olid,
                hasCover,
                checkedAt: Date.now(),
            })
        }

        return hasCover
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

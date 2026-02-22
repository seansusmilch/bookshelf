# Search Page Book Covers Design

**Date**: 2025-02-22
**Status**: Approved

## Overview

Every book in search results displays either a valid cover image or a styled placeholder—no broken images and no Open Library default placeholders.

## Approach

Add a lightweight Convex function that queries Open Library's cover metadata API (the `.json` endpoint) to determine if a real cover exists before returning search results. This metadata check is faster than fetching the actual image and lets us make an upfront decision.

## Architecture

1. **New Convex function**: `convex/covers.ts` with a `checkCover(olid: string)` function that fetches the JSON metadata and returns a boolean
2. **Enhanced search flow**: The existing `convex/openLibrarySearch.ts` calls `checkCover` for each result and attaches a `hasCover` boolean
3. **Cache results**: Store cover validity in a new `covers` Convex table keyed by OLID, so we only check each cover once
4. **UI updates**: `AnimatedBookItem` uses the `hasCover` flag to choose between showing the image or the styled placeholder

The key insight is that Open Library's cover API has a metadata endpoint that tells us if a cover exists—no need to download images or handle errors on the client.

## Convex Schema

```typescript
covers: defineTable({
  olid: v.string(),
  hasCover: v.boolean(),
  checkedAt: v.number(),
})
  .index("by_olid", ["olid"])
```

This table caches cover checks so we don't repeatedly hit Open Library's API for the same book.

## Backend Functions

### `convex/covers.ts`

```typescript
import { v } from "convex/values"

export const checkCover = mutation({
  args: { olid: v.string() },
  handler: async (ctx, args) => {
    // Check cache first
    const cached = await ctx.db
      .query("covers")
      .withIndex("by_olid", (q) => q.eq("olid", args.olid))
      .first()

    if (cached) {
      // Refresh if cache is older than 7 days
      const age = Date.now() - cached.checkedAt
      if (age < 7 * 24 * 60 * 60 * 1000) {
        return cached.hasCover
      }
    }

    // Fetch metadata from Open Library
    const url = `https://covers.openlibrary.org/b/olid/${args.olid}.json`
    const response = await fetch(url)
    const data = await response.json()

    // Open Library returns { error: "Not Found" } if no cover
    const hasCover = !data.error

    // Cache the result
    if (cached) {
      await ctx.db.patch(cached._id, { hasCover, checkedAt: Date.now() })
    } else {
      await ctx.db.insert("covers", {
        olid: args.olid,
        hasCover,
        checkedAt: Date.now(),
      })
    }

    return hasCover
  }
})
```

### Search Flow Integration

Update `convex/openLibrarySearch.ts` to check covers during search:

```typescript
import { api } from "./_generated/api"

export const searchBooks = mutation({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // ... existing Open Library search logic ...

    // For each result, check if cover exists
    const resultsWithCovers = await Promise.all(
      results.docs.map(async (doc) => {
        const olid = getEditionOlid(doc)
        const hasCover = olid ? await ctx.runMutation(api.covers.checkCover, { olid }) : false
        return { ...doc, hasCover }
      })
    )

    return { ...results, docs: resultsWithCovers }
  }
})
```

## Frontend Updates

### Type Update

Add `hasCover?: boolean` to `OpenLibraryBook` type in `hooks/useSearchBooks.ts`.

### `AnimatedBookItem` Component

Remove `failedImages` and `onImageError` props. Use `hasCover` from book data:

```typescript
const { hasCover } = book

{hasCover ? (
  <Animated.Image
    source={{uri: coverUrl}}
    className="h-full w-full"
    resizeMode="cover"
  />
) : (
  <View
    className="h-full w-full items-center justify-center"
    style={{backgroundColor: colors.surfaceContainerHighest}}>
    <MaterialIcons
      name="book"
      size={40}
      color={colors.onSurfaceVariant}
    />
  </View>
)}
```

### `search.tsx` Updates

Remove `failedImages` state and `handleImageError` callback—no longer needed.

## Edge Cases

- **Missing OLID**: Treated as `hasCover: false`, shows placeholder
- **API failures**: Logged, cached as `hasCover: false`, shows placeholder
- **Cache invalidation**: 7-day TTL; can manually clear `covers` table for development
- **Rate limiting**: Graceful degradation to placeholders if Open Library rate limits

## Files Affected

- `convex/schema.ts` (new table)
- `convex/covers.ts` (new file)
- `convex/openLibrarySearch.ts` (enhance search)
- `hooks/useSearchBooks.ts` (update type)
- `components/ui/AnimatedBookItem.tsx` (simplify)
- `app/(tabs)/search.tsx` (remove error handling)

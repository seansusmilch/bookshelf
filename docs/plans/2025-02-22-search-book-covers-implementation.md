# Search Page Book Covers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Every book in search results displays either a valid cover image or a styled placeholder—no broken images and no Open Library default placeholders.

**Architecture:** Add a lightweight Convex function that queries Open Library's cover metadata API (the `.json` endpoint) to determine if a real cover exists before returning search results, with caching to avoid repeated checks.

**Tech Stack:** Convex (mutation, queries), Open Library Covers API, React Native, TypeScript, Material Design 3

---

## Task 1: Add `covers` table to Convex schema

**Files:**

- Modify: `convex/schema.ts`

**Step 1: Add the covers table definition**

Add this table definition to the schema object (after the existing tables, before the closing bracket of `defineSchema`):

```typescript
covers: defineTable({
    olid: v.string(),
    hasCover: v.boolean(),
    checkedAt: v.number(),
}).index('by_olid', ['olid'])
```

**Step 2: Verify the schema update**

Run: `npx convex dev`
Expected: Convex detects the new table and asks to update the schema. Confirm the update.

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add covers table to schema for caching cover validity"
```

---

## Task 2: Create cover checking library function

**Files:**

- Modify: `convex/lib/openlibrary/covers.ts`

**Step 1: Add the cover metadata check function**

Add this function to the end of `convex/lib/openlibrary/covers.ts`:

```typescript
export async function checkCoverExists(olid: string): Promise<boolean> {
    const url = `https://covers.openlibrary.org/b/olid/${olid}.json`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            return false
        }
        const data = await response.json()
        // Open Library returns { error: "Not Found" } if no cover
        return !data.error
    } catch (error) {
        console.error('Error checking cover for olid:', olid, error)
        return false
    }
}
```

**Step 2: Verify types are exported**

The file already exports `CoverSize` and `CoverKeyType` from types. No changes needed there.

**Step 3: Commit**

```bash
git add convex/lib/openlibrary/covers.ts
git commit -m "feat: add checkCoverExists function to query Open Library cover metadata"
```

---

## Task 3: Create Convex mutation for checking and caching covers

**Files:**

- Create: `convex/covers.ts`

**Step 1: Create the covers mutation file**

Create the new file with this content:

```typescript
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
```

**Step 2: Run Convex dev to generate types**

Run: `npx convex dev`
Expected: Convex generates the new API types for the covers functions.

**Step 3: Commit**

```bash
git add convex/covers.ts
git commit -m "feat: add checkCover mutation and getCachedCover query"
```

---

## Task 4: Update search to include cover validity

**Files:**

- Modify: `convex/openLibrarySearch.ts`

**Step 1: Update imports and add cover checking**

Modify the file to:

1. Add imports for the covers API
2. Update the `searchBooks` action to check covers for each result

Replace the entire `searchBooks` function with:

```typescript
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

            const responseWithCovers = {...response, docs: docsWithCoverInfo}

            await ctx.runMutation('cache:cacheSearchResults' as any, {
                query: normalizedQuery,
                results: responseWithCovers,
            })

            console.log('[searchBooks] Search successful:', {
                query: normalizedQuery,
                resultsCount: responseWithCovers.docs.length,
                totalFound: responseWithCovers.num_found,
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
```

Note: We need to import `extractOLID` which should already be imported from `./lib/openlibrary`.

**Step 2: Verify imports**

Make sure these imports are at the top of the file:

```typescript
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
```

**Step 3: Commit**

```bash
git add convex/openLibrarySearch.ts
git commit -m "feat: check cover validity for each search result"
```

---

## Task 5: Update OpenLibraryBook type to include hasCover

**Files:**

- Modify: `hooks/useSearchBooks.ts`

**Step 1: Add hasCover to the interface**

Update the `OpenLibraryBook` interface to include the `hasCover` property:

```typescript
export interface OpenLibraryBook {
    key: string
    title: string
    author_name: string[]
    author_key: string[]
    cover_i?: number
    cover_edition_key?: string
    first_publish_year?: number
    edition_count?: number
    isbn?: string[]
    language?: string[]
    publisher?: string[]
    publish_year?: number[]
    subject?: string[]
    hasCover?: boolean
    editions?: {
        num_found: number
        start: number
        num_found_exact: boolean
        docs: Array<{
            key: string
            title: string
            covers?: number[]
            publish_date?: string
            number_of_pages?: number
            languages?: Array<{key: string}>
        }>
    }
}
```

**Step 2: Run type check**

Run: `pnpm type-check`
Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add hooks/useSearchBooks.ts
git commit -m "feat: add hasCover property to OpenLibraryBook interface"
```

---

## Task 6: Update OpenLibrary types to include hasCover

**Files:**

- Modify: `convex/lib/openlibrary/types.ts`

**Step 1: Add hasCover to SearchResultDoc interface**

Update the `SearchResultDoc` interface to include the optional `hasCover` property:

```typescript
export interface SearchResultDoc {
    key: string
    title: string
    author_name: string[]
    author_key: string[]
    cover_i?: number
    first_publish_year?: number
    edition_count?: number
    isbn?: string[]
    language?: string[]
    publisher?: string[]
    publish_year?: number[]
    subject?: string[]
    hasCover?: boolean
    editions?: {
        num_found: number
        start: number
        num_found_exact: boolean
        docs: EditionDoc[]
    }
    [key: string]: any
}
```

**Step 2: Run type check**

Run: `pnpm type-check`
Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add convex/lib/openlibrary/types.ts
git commit -m "feat: add hasCover property to SearchResultDoc interface"
```

---

## Task 7: Simplify AnimatedBookItem to use hasCover

**Files:**

- Modify: `components/ui/AnimatedBookItem.tsx`

**Step 1: Remove failedImages and onImageError props**

Replace the entire component with:

```typescript
import {Pressable, View, Text} from 'react-native'
import Animated, {useAnimatedStyle, withDelay, withTiming, FadeIn} from 'react-native-reanimated'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import {OpenLibraryBook} from '@/hooks/useSearchBooks'
import {useAppTheme} from '@/components/material3-provider'
import {CoverSize, getCoverUrl, getEditionOlid} from '~/lib/openlibrary'

interface AnimatedBookItemProps {
    book: OpenLibraryBook
    index: number
    onPress: (book: OpenLibraryBook) => void
    isInShelf?: boolean
}

export const AnimatedBookItem = ({
    book,
    index,
    onPress,
    isInShelf,
}: AnimatedBookItemProps) => {
    const {colors} = useAppTheme()

    const editionOlid = getEditionOlid(book)
    const coverUrl = editionOlid ? getCoverUrl(editionOlid, CoverSize.Medium) : undefined
    const {hasCover} = book

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: withDelay(index * 80, withTiming(1, {duration: 400})),
            transform: [
                {
                    translateY: withDelay(index * 80, withTiming(0, {duration: 400})),
                },
            ],
        }
    })

    const imageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withDelay(index * 80 + 200, withTiming(1, {duration: 400})),
                },
            ],
        }
    })

    return (
        <Animated.View
            style={[{backgroundColor: colors.surface, borderRadius: 12}, containerStyle]}
            entering={FadeIn.duration(500).delay(index * 80)}>
            <Pressable onPress={() => onPress(book)} className="rounded-xl p-3" style={{gap: 12}}>
                <View className="flex-row gap-3">
                    <Animated.View
                        style={[
                            {width: 128, height: 176, borderRadius: 8, overflow: 'hidden'},
                            imageStyle,
                        ]}>
                        {hasCover && coverUrl ? (
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
                    </Animated.View>

                    <View className="flex-1 justify-between py-1">
                        <View>
                            <Text
                                className="text-lg font-semibold"
                                numberOfLines={2}
                                style={{color: colors.onSurface}}>
                                {book.title}
                            </Text>
                            <Text
                                className="mt-1 text-base"
                                numberOfLines={1}
                                style={{color: colors.onSurfaceVariant}}>
                                {book.author_name?.join(', ') || 'Unknown Author'}
                            </Text>
                            {book.first_publish_year ? (
                                <Text
                                    className="mt-2 text-sm"
                                    style={{color: colors.onSurfaceVariant}}>
                                    Published: {book.first_publish_year}
                                </Text>
                            ) : null}
                        </View>
                        {isInShelf && (
                            <View className="mt-2 flex-row items-center gap-1">
                                <MaterialIcons
                                    name="check-circle"
                                    size={16}
                                    color={colors.primary}
                                />
                                <Text
                                    className="text-sm font-medium"
                                    style={{color: colors.primary}}>
                                    Already in your shelf
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    )
}
```

**Step 2: Run type check**

Run: `pnpm type-check`
Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add components/ui/AnimatedBookItem.tsx
git commit -m "refactor: simplify AnimatedBookItem to use hasCover prop"
```

---

## Task 8: Remove failedImages state from search screen

**Files:**

- Modify: `app/(tabs)/search.tsx`

**Step 1: Remove failedImages state and handleImageError callback**

Remove these lines:

- `const [failedImages, setFailedImages] = useState<Set<string>>(new Set())`
- `const handleImageError = (coverUrl: string) => { setFailedImages((prev) => new Set(prev).add(coverUrl)) }`

**Step 2: Update AnimatedBookItem props**

Find the `<AnimatedBookItem>` component call and remove the `failedImages` and `onImageError` props:

```typescript
<AnimatedBookItem
    key={book.key}
    book={book}
    index={index}
    onPress={handleBookPress}
    isInShelf={isInShelf}
/>
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No TypeScript errors.

**Step 4: Commit**

```bash
git add app/(tabs)/search.tsx
git commit -m "refactor: remove failedImages state from search screen"
```

---

## Task 9: Final verification and testing

**Step 1: Run type check**

Run: `pnpm type-check`
Expected: No TypeScript errors.

**Step 2: Run linter**

Run: `pnpm lint`
Expected: No linting errors.

**Step 3: Format code**

Run: `pnpm format`
Expected: Code is formatted correctly.

**Step 4: Manual testing**

1. Start the dev server: `npx expo start -c`
2. Navigate to the search tab
3. Search for a book (e.g., "harry potter")
4. Verify that:
    - Books with covers display the cover image
    - Books without covers display the styled placeholder (book icon)
    - No broken images appear
    - No Open Library default placeholder images appear

**Step 5: Test cache behavior**

1. Search for the same book twice
2. Verify the second search is faster (covers are cached)
3. Check Convex dashboard to verify the `covers` table is populated

**Step 6: Final commit**

```bash
git add .
git commit -m "test: verify search book covers implementation"
```

---

## Summary of Changes

1. **Schema**: Added `covers` table with `by_olid` index for caching cover validity
2. **Backend**: Created `checkCover` mutation that checks Open Library cover metadata API and caches results
3. **Search flow**: Updated `searchBooks` action to check covers for each result
4. **Types**: Added `hasCover` property to `OpenLibraryBook` and `SearchResultDoc` interfaces
5. **UI**: Simplified `AnimatedBookItem` to use `hasCover` instead of client-side error handling
6. **Search screen**: Removed `failedImages` state and `handleImageError` callback

## Edge Cases Handled

- **Missing OLID**: Treated as `hasCover: false`, shows placeholder
- **API failures**: Logged, cached as `hasCover: false`, shows placeholder
- **Cache invalidation**: 7-day TTL; can manually clear `covers` table for development
- **Rate limiting**: Graceful degradation to placeholders if Open Library rate limits

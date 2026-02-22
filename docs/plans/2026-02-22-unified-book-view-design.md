# Unified Book View Design

**Date:** 2026-02-22
**Status:** Approved

## Overview

Combine the separate `/add-book/[workId]` and `/book/[id]` routes into a single `/book/[olid]` route that dynamically displays the appropriate UI based on whether the user has the book in their library.

## Goals

- Single URL scheme using Open Library ID for all books
- Seamless transition when user adds/removes a book
- Shared components between "Add" and "Owned" views
- Cleaner navigation from search results

## Architecture

### Route Structure

**Single route:** `app/book/[olid].tsx`

- The `olid` parameter is always an Open Library ID (e.g., `OL123M` or `/books/OL123M`)
- Replaces both `app/book/[id].tsx` and `app/add-book/[workId].tsx`

### Ownership Detection

New Convex query:

```typescript
// convex/functions/books.ts
getBookByOpenLibraryId: query({
  openLibraryId: v.string(),
}).returns(v.union(v.null(), booksSchema))
```

Returns the user's saved book if owned, `null` otherwise.

### Data Fetching Flow

1. Fetch Open Library metadata via `useBookEditions` (existing hook)
2. In parallel, query Convex for user's book by `openLibraryId`
3. Determine UI state based on ownership

## Component Structure

### Always Shown

- **`BookHeader`** - Cover, title, author
- **`BookDescription`** - Book description

### Not Owned (Add View)

- **`BookMetaInfo`** - Page count, publish date, publisher
- **Page count input** - Editable field for custom page count
- **`StatusSelector`** - Choose initial reading status
- **"Add to Your Library" button** - Calls `useAddBook` mutation

### Owned (Detail View)

- **Reading Progress card** - `ProgressCard`/`ProgressSlider`
- **Rating card** - `RatingDisplay`/`RatingChips`
- **Grid layout** - Details (BookMetaInfo) + Lists selector
- **"Remove from Library" button**
- **Bottom sheets** - List selector, remove confirmation

## State Transitions

```
User opens /book/[olid]
        ↓
   Loading State
   (spinner + fetching)
        ↓
Open Library Data Loaded
        ↓
    ┌─────┴─────┐
    ▼           ▼
NOT OWNED    OWNED
(Add View)  (Detail View)
    ↓           ↓
  Add →     Mutations
mutation   update UI
    ↓           ↓
 owned view  stays
    └─────┬─────┘
          │
     Seamless transition
```

### Add-to-Library Flow

1. User taps "Add to Your Library"
2. Call `useAddBook` mutation
3. On success, `useQuery` for `getBookByOpenLibraryId` auto-refetches
4. Component re-renders with `userBook` populated
5. UI transitions to "Owned" view
6. No navigation needed - stays on same route

## File Changes

### Create

1. **`convex/books.ts`** - Add `getBookByOpenLibraryId` query
2. **`hooks/useUnifiedBook.ts`** - Combines OL data fetch + ownership check

### Modify

1. **`app/book/[olid].tsx`** (rename from `[id].tsx`)
   - Use `olid` param instead of `id`
   - Add `useBookEditions` hook
   - Add ownership check query
   - Conditional rendering

2. **Search result links** - Update to use `/book/[olid]`

### Delete

1. **`app/add-book/[workId].tsx`** - No longer needed

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid OLID | Error state with retry |
| Open Library API fails | Error with retry; show saved data if owned |
| Add mutation fails | Inline error, stay on Add view |
| Ownership check fails | Default to Add view |

## Performance

- Parallel fetching: OL data + ownership check
- Use existing `bookCache` table for OL results
- Optimistic updates when adding

## Navigation Updates

Find and update:
```bash
href="/add-book/  →  href="/book/
router.push('/add-book/  →  router.push('/book/
```

## Backward Compatibility

If existing saved links use Convex IDs, consider a query param fallback:
```
/book/[olid]?convexId=xxx
```

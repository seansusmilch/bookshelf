# Book Provider Abstraction Design

## Overview

Replace the Open Library API integration with Hardcover API, using a provider-agnostic architecture that allows easy switching to other book data providers in the future.

## Goals

- Replace Open Library with Hardcover API
- Create a clean abstraction layer for book data providers
- Enable future provider switches with minimal code changes
- Fresh start on book data (no migration needed)

## Architecture

### Pattern: Interface + Adapter

A `BookProvider` interface defines the contract. `HardcoverAdapter` implements it. Future providers just implement the same interface.

### File Structure

```
convex/lib/bookProvider/
├── index.ts              # createBookProvider() factory
├── types.ts              # Book, Author, SearchResult, etc.
├── interface.ts          # BookProvider interface
└── adapters/
    └── hardcover/
        ├── index.ts      # Export HardcoverAdapter class
        ├── client.ts     # GraphQL fetch wrapper
        ├── search.ts     # searchBooks implementation
        ├── books.ts      # getBook, getBookEditions
        ├── authors.ts    # getAuthor, getAuthorWorks
        ├── mappers.ts    # Hardcover response → unified types
        └── types.ts      # Raw Hardcover API types

convex/
├── bookSearch.ts         # Renamed from openLibrarySearch.ts
└── ... (other files unchanged)
```

## Core Types

Provider-agnostic types that all adapters must produce:

```typescript
export interface Book {
    id: string // Provider's unique ID
    title: string
    subtitle?: string
    description?: string
    authors: Author[]
    pages?: number
    releaseYear?: number
    releaseDate?: string
    rating?: number // 0-5 scale
    ratingsCount?: number
    reviewsCount?: number
    coverUrl?: string
    isbn10?: string
    isbn13?: string
    editions?: BookEdition[]
}

export interface BookEdition {
    id: string
    title: string
    format?: 'physical' | 'ebook' | 'audiobook'
    pages?: number
    audioSeconds?: number
    isbn10?: string
    isbn13?: string
    coverUrl?: string
}

export interface Author {
    id: string
    name: string
    bio?: string
    photoUrl?: string
}

export interface SearchResult {
    id: string
    title: string
    authors: string[]
    coverUrl?: string
    releaseYear?: number
    rating?: number
}

export interface SearchResponse {
    results: SearchResult[]
    total: number
    hasMore: boolean
}

export interface BookProviderError extends Error {
    code: 'NOT_FOUND' | 'RATE_LIMITED' | 'INVALID_REQUEST' | 'SERVER_ERROR'
    providerId: string
}
```

## BookProvider Interface

```typescript
export interface BookProvider {
    readonly id: string // 'hardcover', 'openlibrary', etc.
    readonly name: string // Display name

    searchBooks(query: string, options?: SearchOptions): Promise<SearchResponse>
    getBook(id: string): Promise<Book>
    getBookEditions(bookId: string): Promise<BookEdition[]>
    getAuthor(id: string): Promise<Author>
    getAuthorWorks(authorId: string, options?: PaginationOptions): Promise<Book[]>
    getBookByISBN?(isbn: string): Promise<Book>
}

export interface SearchOptions {
    limit?: number
    offset?: number
}

export interface PaginationOptions {
    limit?: number
    offset?: number
}
```

## Hardcover Adapter

### Client

GraphQL client with authentication:

```typescript
const HARDCOVER_API_URL = 'https://api.hardcover.app/v1/graphql'

async function query<T>(query: string, variables?: object): Promise<T> {
    const response = await fetch(HARDCOVER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.HARDCOVER_API_KEY}`,
        },
        body: JSON.stringify({query, variables}),
    })
    // ... error handling, rate limiting
}
```

### Mapping Strategy

- GraphQL queries defined as constants in each module
- Mappers separate transformation logic from API calls
- Hardcover's nested `contributions` structure flattened to `authors`
- Cover URLs from `cached_image` field (pre-resolved by Hardcover)
- IDs stringified for provider flexibility

## Schema Changes

```typescript
books: defineTable({
    userId: v.string(),
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    isbn10: v.optional(v.string()),
    isbn13: v.optional(v.string()),
    totalPages: v.number(),
    currentPage: v.number(),
    status: v.string(),
    providerId: v.optional(v.string()), // Changed from openLibraryId
    providerName: v.optional(v.string()), // 'hardcover'
    createdAt: v.number(),
    updatedAt: v.number(),
})

bookCache: defineTable({
    providerId: v.string(),
    providerName: v.string(),
    bookData: v.any(),
    cachedAt: v.number(),
}).index('by_provider_id', ['providerId'])

covers: defineTable({
    providerId: v.string(),
    hasCover: v.boolean(),
    checkedAt: v.number(),
}).index('by_provider_id', ['providerId'])
```

## Files to Delete

```
convex/lib/openlibrary/       # Entire directory
convex/openLibrarySearch.ts   # Renamed to bookSearch.ts
convex/covers.ts              # Logic moves to adapter
```

## Files to Update

```
convex/schema.ts              # Field renames
hooks/useSearchBooks.ts       # Import path change
hooks/useBookEditions.ts      # Import path change
app/book/[olid].tsx           # Rename to [bookId].tsx
```

## Migration Steps

1. Create `bookProvider/` structure with types + interface
2. Implement Hardcover adapter (client, search, books, authors, mappers)
3. Create new `bookSearch.ts` using the adapter
4. Update schema (fresh start - just deploy new schema)
5. Update hooks and components to use new imports/routes
6. Delete `openlibrary/` directory and old files
7. Add `HARDCOVER_API_KEY` to environment variables

## Environment Variables

```
HARDCOVER_API_KEY=<your-api-key>
```

## Future Provider Switch

To switch providers in the future:

1. Create new adapter in `adapters/newprovider/`
2. Update `createBookProvider()` factory to return new adapter
3. Optionally update `providerName` in schema for new books

No changes to hooks, components, or core types needed.

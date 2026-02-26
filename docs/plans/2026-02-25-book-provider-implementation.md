# Book Provider Abstraction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Open Library API with Hardcover API using a provider-agnostic architecture.

**Architecture:** Interface + Adapter pattern. A `BookProvider` interface defines the contract, `HardcoverAdapter` implements it. Future providers implement the same interface.

**Tech Stack:** Convex (server functions), TypeScript, GraphQL (Hardcover API)

---

## Task 1: Create Core Types

**Files:**

- Create: `convex/lib/bookProvider/types.ts`

**Step 1: Create the types file**

```typescript
'use node'

export interface Book {
    id: string
    title: string
    subtitle?: string
    description?: string
    authors: Author[]
    pages?: number
    releaseYear?: number
    releaseDate?: string
    rating?: number
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

export interface SearchOptions {
    limit?: number
    offset?: number
}

export interface PaginationOptions {
    limit?: number
    offset?: number
}

export type ErrorCode = 'NOT_FOUND' | 'RATE_LIMITED' | 'INVALID_REQUEST' | 'SERVER_ERROR'

export class BookProviderError extends Error {
    constructor(
        message: string,
        public code: ErrorCode,
        public providerId: string
    ) {
        super(message)
        this.name = 'BookProviderError'
    }
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/types.ts
git commit -m "feat: add book provider core types"
```

---

## Task 2: Create BookProvider Interface

**Files:**

- Create: `convex/lib/bookProvider/interface.ts`

**Step 1: Create the interface file**

```typescript
'use node'

import {Book, BookEdition, Author, SearchResponse, SearchOptions, PaginationOptions} from './types'

export interface BookProvider {
    readonly id: string
    readonly name: string

    searchBooks(query: string, options?: SearchOptions): Promise<SearchResponse>
    getBook(id: string): Promise<Book>
    getBookEditions(bookId: string): Promise<BookEdition[]>
    getAuthor(id: string): Promise<Author>
    getAuthorWorks(authorId: string, options?: PaginationOptions): Promise<Book[]>
    getBookByISBN?(isbn: string): Promise<Book>
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/interface.ts
git commit -m "feat: add BookProvider interface"
```

---

## Task 3: Create Hardcover Client

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/client.ts`

**Step 1: Create the GraphQL client**

```typescript
'use node'

import {BookProviderError} from '../../types'

const HARDCOVER_API_URL = 'https://api.hardcover.app/v1/graphql'

interface GraphQLResponse<T> {
    data?: T
    errors?: Array<{message: string}>
}

export async function query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const apiKey = process.env.HARDCOVER_API_KEY

    if (!apiKey) {
        throw new BookProviderError(
            'HARDCOVER_API_KEY environment variable is not set',
            'INVALID_REQUEST',
            'hardcover'
        )
    }

    const response = await fetch(HARDCOVER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({query, variables}),
    })

    if (!response.ok) {
        if (response.status === 429) {
            throw new BookProviderError(
                'Rate limited by Hardcover API',
                'RATE_LIMITED',
                'hardcover'
            )
        }
        if (response.status === 404) {
            throw new BookProviderError('Resource not found', 'NOT_FOUND', 'hardcover')
        }
        throw new BookProviderError(
            `Hardcover API error: ${response.status} ${response.statusText}`,
            'SERVER_ERROR',
            'hardcover'
        )
    }

    const json: GraphQLResponse<T> = await response.json()

    if (json.errors && json.errors.length > 0) {
        throw new BookProviderError(
            `GraphQL error: ${json.errors[0].message}`,
            'SERVER_ERROR',
            'hardcover'
        )
    }

    if (!json.data) {
        throw new BookProviderError('No data in response', 'SERVER_ERROR', 'hardcover')
    }

    return json.data
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/client.ts
git commit -m "feat: add Hardcover GraphQL client"
```

---

## Task 4: Create Hardcover Types

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/types.ts`

**Step 1: Create raw API types**

```typescript
'use node'

export interface HardcoverBook {
    id: number
    title: string
    subtitle?: string
    description?: string
    pages?: number
    rating?: number
    ratings_count: number
    reviews_count: number
    release_year?: number
    release_date?: string
    cached_image?: {
        url: string
    }
    contributions: Array<{
        contribution: string
        author: HardcoverAuthor
    }>
    editions_count: number
}

export interface HardcoverEdition {
    id: number
    title: string
    pages?: number
    audio_seconds?: number
    isbn_10?: string
    isbn_13?: string
    reading_format?: {
        id: number
        name: string
    }
    cached_image?: {
        url: string
    }
}

export interface HardcoverAuthor {
    id: number
    name: string
    bio?: string
    cached_image?: {
        url: string
    }
}

export interface HardcoverSearchResult {
    id: number
    title: string
    release_year?: number
    rating?: number
    cached_image?: {
        url: string
    }
    contributions: Array<{
        author: {
            name: string
        }
    }>
}

export interface HardcoverSearchResponse {
    search: {
        results: HardcoverSearchResult[]
        total: number
        has_more: boolean
    }
}

export interface HardcoverBooksResponse {
    books: HardcoverBook[]
}

export interface HardcoverEditionsResponse {
    editions: HardcoverEdition[]
}

export interface HardcoverAuthorsResponse {
    authors: HardcoverAuthor[]
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/types.ts
git commit -m "feat: add Hardcover raw API types"
```

---

## Task 5: Create Mappers

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/mappers.ts`

**Step 1: Create mapper functions**

```typescript
'use node'

import {Book, BookEdition, Author, SearchResult} from '../../types'
import {HardcoverBook, HardcoverEdition, HardcoverAuthor, HardcoverSearchResult} from './types'

export function mapBook(hardcoverBook: HardcoverBook): Book {
    return {
        id: String(hardcoverBook.id),
        title: hardcoverBook.title,
        subtitle: hardcoverBook.subtitle,
        description: hardcoverBook.description,
        pages: hardcoverBook.pages,
        releaseYear: hardcoverBook.release_year,
        releaseDate: hardcoverBook.release_date,
        rating: hardcoverBook.rating,
        ratingsCount: hardcoverBook.ratings_count,
        reviewsCount: hardcoverBook.reviews_count,
        coverUrl: hardcoverBook.cached_image?.url,
        authors: hardcoverBook.contributions.map((c) => ({
            id: String(c.author.id),
            name: c.author.name,
        })),
    }
}

export function mapEdition(hardcoverEdition: HardcoverEdition): BookEdition {
    let format: 'physical' | 'ebook' | 'audiobook' | undefined
    const formatName = hardcoverEdition.reading_format?.name?.toLowerCase()

    if (formatName?.includes('audio')) {
        format = 'audiobook'
    } else if (formatName?.includes('ebook') || formatName?.includes('digital')) {
        format = 'ebook'
    } else if (formatName) {
        format = 'physical'
    }

    return {
        id: String(hardcoverEdition.id),
        title: hardcoverEdition.title,
        format,
        pages: hardcoverEdition.pages,
        audioSeconds: hardcoverEdition.audio_seconds,
        isbn10: hardcoverEdition.isbn_10,
        isbn13: hardcoverEdition.isbn_13,
        coverUrl: hardcoverEdition.cached_image?.url,
    }
}

export function mapAuthor(hardcoverAuthor: HardcoverAuthor): Author {
    return {
        id: String(hardcoverAuthor.id),
        name: hardcoverAuthor.name,
        bio: hardcoverAuthor.bio,
        photoUrl: hardcoverAuthor.cached_image?.url,
    }
}

export function mapSearchResult(hardcoverResult: HardcoverSearchResult): SearchResult {
    return {
        id: String(hardcoverResult.id),
        title: hardcoverResult.title,
        authors: hardcoverResult.contributions.map((c) => c.author.name),
        coverUrl: hardcoverResult.cached_image?.url,
        releaseYear: hardcoverResult.release_year,
        rating: hardcoverResult.rating,
    }
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/mappers.ts
git commit -m "feat: add Hardcover response mappers"
```

---

## Task 6: Implement Search

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/search.ts`

**Step 1: Create search implementation**

```typescript
'use node'

import {SearchResponse, SearchOptions} from '../../types'
import {query} from './client'
import {mapSearchResult} from './mappers'
import {HardcoverSearchResponse} from './types'

const SEARCH_BOOKS_QUERY = `
  query SearchBooks($query: String!, $perPage: Int!, $page: Int!) {
    search(
      query: $query
      query_type: "Book"
      per_page: $perPage
      page: $page
    ) {
      results
      total
      has_more
    }
  }
`

export async function searchBooks(
    queryText: string,
    options?: SearchOptions
): Promise<SearchResponse> {
    const perPage = options?.limit ?? 20
    const page = options?.offset ? Math.floor(options.offset / perPage) + 1 : 1

    const response = await query<HardcoverSearchResponse>(SEARCH_BOOKS_QUERY, {
        query: queryText,
        perPage,
        page,
    })

    return {
        results: response.search.results.map(mapSearchResult),
        total: response.search.total,
        hasMore: response.search.has_more,
    }
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/search.ts
git commit -m "feat: implement Hardcover book search"
```

---

## Task 7: Implement Books

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/books.ts`

**Step 1: Create books implementation**

```typescript
'use node'

import {Book, BookEdition} from '../../types'
import {query} from './client'
import {mapBook, mapEdition} from './mappers'
import {HardcoverBooksResponse, HardcoverEditionsResponse} from './types'

const GET_BOOK_QUERY = `
  query GetBook($id: Int!) {
    books(where: {id: {_eq: $id}}) {
      id
      title
      subtitle
      description
      pages
      rating
      ratings_count
      reviews_count
      release_year
      release_date
      cached_image {
        url
      }
      contributions {
        contribution
        author {
          id
          name
        }
      }
    }
  }
`

const GET_BOOK_EDITIONS_QUERY = `
  query GetBookEditions($bookId: Int!) {
    editions(where: {book_id: {_eq: $bookId}}) {
      id
      title
      pages
      audio_seconds
      isbn_10
      isbn_13
      reading_format {
        id
        name
      }
      cached_image {
        url
      }
    }
  }
`

export async function getBook(id: string): Promise<Book> {
    const response = await query<HardcoverBooksResponse>(GET_BOOK_QUERY, {
        id: parseInt(id, 10),
    })

    if (!response.books || response.books.length === 0) {
        throw new Error(`Book not found: ${id}`)
    }

    return mapBook(response.books[0])
}

export async function getBookEditions(bookId: string): Promise<BookEdition[]> {
    const response = await query<HardcoverEditionsResponse>(GET_BOOK_EDITIONS_QUERY, {
        bookId: parseInt(bookId, 10),
    })

    return (response.editions || []).map(mapEdition)
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/books.ts
git commit -m "feat: implement Hardcover book details and editions"
```

---

## Task 8: Implement Authors

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/authors.ts`

**Step 1: Create authors implementation**

```typescript
'use node'

import {Author, Book, PaginationOptions} from '../../types'
import {query} from './client'
import {mapAuthor, mapBook} from './mappers'
import {HardcoverAuthorsResponse, HardcoverBooksResponse} from './types'

const GET_AUTHOR_QUERY = `
  query GetAuthor($id: Int!) {
    authors(where: {id: {_eq: $id}}) {
      id
      name
      bio
      cached_image {
        url
      }
    }
  }
`

const GET_AUTHOR_WORKS_QUERY = `
  query GetAuthorWorks($authorId: Int!, $limit: Int!) {
    books(
      where: {contributions: {author_id: {_eq: $authorId}}}
      limit: $limit
    ) {
      id
      title
      subtitle
      description
      pages
      rating
      ratings_count
      reviews_count
      release_year
      cached_image {
        url
      }
      contributions {
        contribution
        author {
          id
          name
        }
      }
    }
  }
`

export async function getAuthor(id: string): Promise<Author> {
    const response = await query<HardcoverAuthorsResponse>(GET_AUTHOR_QUERY, {
        id: parseInt(id, 10),
    })

    if (!response.authors || response.authors.length === 0) {
        throw new Error(`Author not found: ${id}`)
    }

    return mapAuthor(response.authors[0])
}

export async function getAuthorWorks(
    authorId: string,
    options?: PaginationOptions
): Promise<Book[]> {
    const response = await query<HardcoverBooksResponse>(GET_AUTHOR_WORKS_QUERY, {
        authorId: parseInt(authorId, 10),
        limit: options?.limit ?? 20,
    })

    return (response.books || []).map(mapBook)
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/authors.ts
git commit -m "feat: implement Hardcover author details and works"
```

---

## Task 9: Create Hardcover Adapter Index

**Files:**

- Create: `convex/lib/bookProvider/adapters/hardcover/index.ts`

**Step 1: Create the adapter class**

```typescript
'use node'

import {BookProvider} from '../../interface'
import {
    Book,
    BookEdition,
    Author,
    SearchResponse,
    SearchOptions,
    PaginationOptions,
} from '../../types'
import {searchBooks} from './search'
import {getBook, getBookEditions} from './books'
import {getAuthor, getAuthorWorks} from './authors'

export class HardcoverAdapter implements BookProvider {
    readonly id = 'hardcover'
    readonly name = 'Hardcover'

    async searchBooks(query: string, options?: SearchOptions): Promise<SearchResponse> {
        return searchBooks(query, options)
    }

    async getBook(id: string): Promise<Book> {
        return getBook(id)
    }

    async getBookEditions(bookId: string): Promise<BookEdition[]> {
        return getBookEditions(bookId)
    }

    async getAuthor(id: string): Promise<Author> {
        return getAuthor(id)
    }

    async getAuthorWorks(authorId: string, options?: PaginationOptions): Promise<Book[]> {
        return getAuthorWorks(authorId, options)
    }
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/adapters/hardcover/index.ts
git commit -m "feat: create HardcoverAdapter implementing BookProvider"
```

---

## Task 10: Create BookProvider Factory

**Files:**

- Create: `convex/lib/bookProvider/index.ts`

**Step 1: Create the factory and re-exports**

```typescript
'use node'

import {BookProvider} from './interface'
import {HardcoverAdapter} from './adapters/hardcover'

export * from './types'
export * from './interface'

let providerInstance: BookProvider | null = null

export function createBookProvider(): BookProvider {
    if (!providerInstance) {
        providerInstance = new HardcoverAdapter()
    }
    return providerInstance
}

export function resetBookProvider(): void {
    providerInstance = null
}
```

**Step 2: Commit**

```bash
git add convex/lib/bookProvider/index.ts
git commit -m "feat: create BookProvider factory with Hardcover as default"
```

---

## Task 11: Create bookSearch Actions

**Files:**

- Create: `convex/bookSearch.ts`

**Step 1: Create the Convex actions**

```typescript
import {v} from 'convex/values'
import {action} from './_generated/server'
import {createBookProvider} from './lib/bookProvider'
import type {SearchResponse} from './lib/bookProvider'

export const searchBooks = action({
    args: {
        query: v.string(),
        skipCache: v.optional(v.boolean()),
    },
    handler: async (ctx, args): Promise<SearchResponse> => {
        const normalizedQuery = args.query.toLowerCase().trim()

        if (!normalizedQuery || normalizedQuery.length < 2) {
            console.warn('[searchBooks] Query too short or empty:', args.query)
            return {results: [], total: 0, hasMore: false}
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

        console.log('[searchBooks] Searching for query:', normalizedQuery)

        try {
            const provider = createBookProvider()
            const response = await provider.searchBooks(normalizedQuery, {limit: 20})

            const minimalResponse: SearchResponse = {
                results: response.results.map((r) => ({
                    id: r.id,
                    title: r.title,
                    authors: r.authors.slice(0, 3),
                    coverUrl: r.coverUrl,
                    releaseYear: r.releaseYear,
                    rating: r.rating,
                })),
                total: response.total,
                hasMore: response.hasMore,
            }

            try {
                await ctx.runMutation('cache:cacheSearchResults' as any, {
                    query: normalizedQuery,
                    results: minimalResponse,
                })
            } catch (cacheError) {
                console.warn('[searchBooks] Failed to cache results:', cacheError)
            }

            console.log('[searchBooks] Search successful:', {
                query: normalizedQuery,
                resultsCount: response.results.length,
                total: response.total,
            })

            return minimalResponse
        } catch (error) {
            console.error('[searchBooks] Error:', error)
            throw new Error('Failed to search books')
        }
    },
})

export const getBookDetails = action({
    args: {
        providerId: v.string(),
    },
    handler: async (ctx, args) => {
        console.log('[getBookDetails] Fetching book:', args.providerId)

        const cachedBook = await ctx.runQuery('cache:getCachedBookDetails' as any, {
            providerId: args.providerId,
        })

        if (cachedBook) {
            console.log('[getBookDetails] Cache hit for book:', args.providerId)
            return cachedBook
        }

        try {
            const provider = createBookProvider()
            const book = await provider.getBook(args.providerId)

            await ctx.runMutation('cache:cacheBookDetails' as any, {
                providerId: args.providerId,
                providerName: provider.id,
                bookData: book,
            })

            console.log('[getBookDetails] Successfully fetched book:', {
                providerId: args.providerId,
                title: book.title,
            })

            return book
        } catch (error) {
            console.error('[getBookDetails] Error:', error)
            throw new Error('Failed to fetch book details')
        }
    },
})

export const getBookEditions = action({
    args: {
        providerId: v.string(),
    },
    handler: async (ctx, args) => {
        console.log('[getBookEditions] Fetching editions:', args.providerId)

        try {
            const provider = createBookProvider()
            const editions = await provider.getBookEditions(args.providerId)

            console.log('[getBookEditions] Successfully fetched editions:', {
                providerId: args.providerId,
                count: editions.length,
            })

            return editions
        } catch (error) {
            console.error('[getBookEditions] Error:', error)
            throw new Error('Failed to fetch book editions')
        }
    },
})
```

**Step 2: Commit**

```bash
git add convex/bookSearch.ts
git commit -m "feat: create bookSearch actions using BookProvider"
```

---

## Task 12: Update Schema

**Files:**

- Modify: `convex/schema.ts`

**Step 1: Update field names**

Replace `openLibraryId` with `providerId` and add `providerName`:

```typescript
import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
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
        providerId: v.optional(v.string()),
        providerName: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_status', ['userId', 'status'])
        .index('by_provider_id', ['providerId']),

    searchCache: defineTable({
        query: v.string(),
        results: v.any(),
        cachedAt: v.number(),
    }).index('by_query', ['query']),

    bookCache: defineTable({
        providerId: v.string(),
        providerName: v.string(),
        bookData: v.any(),
        cachedAt: v.number(),
    }).index('by_provider_id', ['providerId']),

    lists: defineTable({
        userId: v.string(),
        name: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .searchIndex('search_name', {
            searchField: 'name',
            filterFields: ['userId'],
        }),

    bookListMembership: defineTable({
        bookId: v.id('books'),
        listId: v.id('lists'),
        userId: v.string(),
        addedAt: v.number(),
    })
        .index('by_list', ['listId'])
        .index('by_book', ['bookId'])
        .index('by_user', ['userId']),

    readingSessions: defineTable({
        bookId: v.id('books'),
        userId: v.string(),
        startPage: v.number(),
        endPage: v.number(),
        pagesRead: v.number(),
        startedAt: v.number(),
        endedAt: v.optional(v.number()),
    })
        .index('by_book', ['bookId'])
        .index('by_user', ['userId'])
        .index('by_user_date', ['userId', 'startedAt']),

    ratings: defineTable({
        bookId: v.id('books'),
        userId: v.string(),
        rating: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_book', ['bookId'])
        .index('by_user', ['userId'])
        .index('by_user_book', ['userId', 'bookId']),

    yearlyGoals: defineTable({
        userId: v.string(),
        year: v.number(),
        goal: v.number(),
        genreVarietyGoal: v.optional(v.number()),
        pageGoal: v.optional(v.number()),
        weeklyReadingDays: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index('by_user_year', ['userId', 'year']),

    covers: defineTable({
        providerId: v.string(),
        hasCover: v.boolean(),
        checkedAt: v.number(),
    }).index('by_provider_id', ['providerId']),
})
```

**Step 2: Commit**

```bash
git add convex/schema.ts
git commit -m "refactor: update schema with provider-agnostic field names"
```

---

## Task 13: Update Cache Module

**Files:**

- Modify: `convex/cache.ts`

**Step 1: Update cache functions for new field names**

Read the current file and update `openLibraryId` references to `providerId`:

```typescript
import {v} from 'convex/values'
import {query, internalMutation} from './_generated/server'

const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

export const getCachedSearchResults = query({
    args: {query: v.string()},
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query('searchCache')
            .withIndex('by_query', (q) => q.eq('query', args.query))
            .first()

        if (!cached) return null

        const now = Date.now()
        if (now - cached.cachedAt > CACHE_TTL) {
            return null
        }

        return cached.results
    },
})

export const getCachedBookDetails = query({
    args: {providerId: v.string()},
    handler: async (ctx, args) => {
        const cached = await ctx.db
            .query('bookCache')
            .withIndex('by_provider_id', (q) => q.eq('providerId', args.providerId))
            .first()

        if (!cached) return null

        const now = Date.now()
        if (now - cached.cachedAt > CACHE_TTL) {
            return null
        }

        return cached.bookData
    },
})

export const cacheSearchResults = internalMutation({
    args: {
        query: v.string(),
        results: v.any(),
    },
    handler: async (ctx, args) => {
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

export const cacheBookDetails = internalMutation({
    args: {
        providerId: v.string(),
        providerName: v.string(),
        bookData: v.any(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('bookCache')
            .withIndex('by_provider_id', (q) => q.eq('providerId', args.providerId))
            .first()

        if (existing) {
            await ctx.db.patch(existing._id, {
                bookData: args.bookData,
                cachedAt: Date.now(),
            })
        } else {
            await ctx.db.insert('bookCache', {
                providerId: args.providerId,
                providerName: args.providerName,
                bookData: args.bookData,
                cachedAt: Date.now(),
            })
        }
    },
})
```

**Step 2: Commit**

```bash
git add convex/cache.ts
git commit -m "refactor: update cache module for provider-agnostic field names"
```

---

## Task 14: Update Hooks

**Files:**

- Modify: `hooks/useSearchBooks.ts`
- Modify: `hooks/useBookEditions.ts`

**Step 1: Update useSearchBooks.ts**

Change import from `openLibrarySearch` to `bookSearch`:

```typescript
import {useAction} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useState, useCallback} from 'react'

export const useSearchBooks = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const searchBooks = useAction(api.bookSearch.searchBooks)

    const executeSearch = useCallback(
        async (query: string, options?: {skipCache?: boolean}) => {
            if (!query || query.length < 2) {
                return {results: [], total: 0, hasMore: false}
            }

            setIsLoading(true)
            setError(null)

            try {
                const data = await searchBooks({query, skipCache: options?.skipCache})
                return data
            } catch (err) {
                setError(err as Error)
                return {results: [], total: 0, hasMore: false}
            } finally {
                setIsLoading(false)
            }
        },
        [searchBooks]
    )

    return {isLoading, error, searchBooks: executeSearch}
}

export interface BookSearchResponse {
    results: BookSearchResult[]
    total: number
    hasMore: boolean
}

export interface BookSearchResult {
    id: string
    title: string
    authors: string[]
    coverUrl?: string
    releaseYear?: number
    rating?: number
}
```

**Step 2: Update useBookEditions.ts**

Change import and field names:

```typescript
import {useAction} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useState, useCallback} from 'react'

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

export const useBookEditions = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const getEditions = useAction(api.bookSearch.getBookEditions)

    const fetchEditions = useCallback(
        async (providerId: string) => {
            if (!providerId) {
                return []
            }

            setIsLoading(true)
            setError(null)

            try {
                const editions = await getEditions({providerId})
                return editions as BookEdition[]
            } catch (err) {
                setError(err as Error)
                return []
            } finally {
                setIsLoading(false)
            }
        },
        [getEditions]
    )

    return {isLoading, error, fetchEditions}
}
```

**Step 3: Commit**

```bash
git add hooks/useSearchBooks.ts hooks/useBookEditions.ts
git commit -m "refactor: update hooks to use bookSearch actions"
```

---

## Task 15: Update Book Detail Route

**Files:**

- Rename: `app/book/[olid].tsx` to `app/book/[bookId].tsx`

**Step 1: Rename and update the file**

Read current file, then update:

- Route parameter from `olid` to `bookId`
- Imports from `openLibrarySearch` to `bookSearch`
- Field references from `openLibraryId` to `providerId`

**Step 2: Commit**

```bash
git add app/book/[bookId].tsx
git rm app/book/[olid].tsx
git commit -m "refactor: rename book route and update to use bookSearch"
```

---

## Task 16: Update Remaining Files

**Files:**

- Modify: `hooks/useAddBook.ts`
- Modify: `hooks/useUnifiedBook.ts`
- Modify: `convex/books.ts`

**Step 1: Search and update openLibraryId references**

Run grep to find all remaining references:

```bash
grep -r "openLibraryId" --include="*.ts" --include="*.tsx"
```

**Step 2: Update each file**

Replace `openLibraryId` with `providerId` and update imports.

**Step 3: Commit**

```bash
git add hooks/useAddBook.ts hooks/useUnifiedBook.ts convex/books.ts
git commit -m "refactor: update remaining files for provider-agnostic field names"
```

---

## Task 17: Delete Open Library Code

**Files:**

- Delete: `convex/lib/openlibrary/` (entire directory)
- Delete: `convex/openLibrarySearch.ts`

**Step 1: Remove old files**

```bash
rm -rf convex/lib/openlibrary
rm convex/openLibrarySearch.ts
```

**Step 2: Commit**

```bash
git add -A
git commit -m "refactor: remove Open Library integration"
```

---

## Task 18: Add Environment Variable

**Files:**

- Modify: `.env.local` (or your env file)
- Update Convex dashboard environment variables

**Step 1: Add to local env**

```bash
echo "HARDCOVER_API_KEY=your-api-key-here" >> .env.local
```

**Step 2: Add to Convex**

In Convex dashboard, add `HARDCOVER_API_KEY` to environment variables.

---

## Task 19: Deploy and Test

**Step 1: Push schema changes**

```bash
npx convex deploy
```

**Step 2: Test search**

Run the app and test book search functionality.

**Step 3: Test book details**

Click on a search result to verify book details load.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Book Provider abstraction with Hardcover"
```

---

## Summary

This plan creates:

- Provider-agnostic types and interface
- Hardcover adapter with full implementation
- Updated schema with `providerId` and `providerName`
- Updated hooks and components
- Removed all Open Library code

Future provider switches require only:

1. Create new adapter in `adapters/newprovider/`
2. Update `createBookProvider()` to return new adapter

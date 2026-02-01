import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
    openLibraryId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_status', ['userId', 'status']),

  searchCache: defineTable({
    query: v.string(),
    results: v.any(),
    cachedAt: v.number(),
  })
    .index('by_query', ['query']),

  bookCache: defineTable({
    openLibraryId: v.string(),
    bookData: v.any(),
    cachedAt: v.number(),
  })
    .index('by_olid', ['openLibraryId']),

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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_year', ['userId', 'year']),
});

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';

export const getUserBooks = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }

    let books;

    if (args.status) {
      books = await ctx.db
        .query('books')
        .withIndex('by_user_status', (q) =>
          q.eq('userId', userId).eq('status', args.status!)
        )
        .collect();
    } else {
      books = await ctx.db
        .query('books')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
    }

    return books;
  },
});

export const getBookById = query({
  args: {
    bookId: v.id('books'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const book = await ctx.db.get(args.bookId);

    if (!book || book.userId !== userId) {
      return null;
    }

    const rating = await ctx.db
      .query('ratings')
      .withIndex('by_user_book', (q) => q.eq('userId', userId).eq('bookId', args.bookId))
      .first();

    return { ...book, rating };
  },
});

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    isbn10: v.optional(v.string()),
    isbn13: v.optional(v.string()),
    totalPages: v.number(),
    status: v.string(),
    googleBooksId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const now = Date.now();

    const bookId = await ctx.db.insert('books', {
      userId,
      title: args.title,
      author: args.author,
      description: args.description,
      coverUrl: args.coverUrl,
      isbn10: args.isbn10,
      isbn13: args.isbn13,
      totalPages: args.totalPages,
      currentPage: args.status === 'completed' ? args.totalPages : 0,
      status: args.status,
      googleBooksId: args.googleBooksId,
      createdAt: now,
      updatedAt: now,
    });

    if (args.status === 'completed') {
      await ctx.db.insert('readingSessions', {
        bookId,
        userId,
        startPage: 0,
        endPage: args.totalPages,
        pagesRead: args.totalPages,
        startedAt: now,
        endedAt: now,
      });
    }

    return bookId;
  },
});

export const updateProgress = mutation({
  args: {
    bookId: v.id('books'),
    currentPage: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const book = await ctx.db.get(args.bookId);

    if (!book || book.userId !== userId) {
      throw new Error('Book not found');
    }

    if (args.currentPage > book.totalPages) {
      throw new Error('Current page cannot exceed total pages');
    }

    if (args.currentPage < book.currentPage) {
      throw new Error('Current page cannot be less than previous page');
    }

    await ctx.db.patch(args.bookId, {
      currentPage: args.currentPage,
      updatedAt: Date.now(),
    });

    return args.bookId;
  },
});

export const completeBook = mutation({
  args: {
    bookId: v.id('books'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const book = await ctx.db.get(args.bookId);

    if (!book || book.userId !== userId) {
      throw new Error('Book not found');
    }

    const now = Date.now();

    await ctx.db.patch(args.bookId, {
      currentPage: book.totalPages,
      status: 'completed',
      updatedAt: now,
    });

    await ctx.db.insert('readingSessions', {
      bookId: args.bookId,
      userId,
      startPage: book.currentPage,
      endPage: book.totalPages,
      pagesRead: book.totalPages - book.currentPage,
      startedAt: book.updatedAt,
      endedAt: now,
    });

    return args.bookId;
  },
});

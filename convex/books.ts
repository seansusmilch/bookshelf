import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getUserBooks = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    console.log('getUserBooks - identity:', identity);

    if (identity === null) {
      console.log('getUserBooks - no identity found');
      return [];
    }

    const userId = identity.subject;
    console.log('getUserBooks - userId:', userId);
    console.log('getUserBooks - status filter:', args.status);

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

    console.log('getUserBooks - books found:', books);
    console.log('getUserBooks - books count:', books.length);

    return books;
  },
});

export const getBookById = query({
  args: {
    bookId: v.id('books'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return null;
    }

    const userId = identity.subject;

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
    openLibraryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    console.log('addBook - identity:', identity);
    console.log('addBook - args:', args);

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;
    console.log('addBook - userId:', userId);

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
      openLibraryId: args.openLibraryId,
      createdAt: now,
      updatedAt: now,
    });

    console.log('addBook - book inserted with ID:', bookId);

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
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

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
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

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

export const uncompleteBook = mutation({
  args: {
    bookId: v.id('books'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

    const book = await ctx.db.get(args.bookId);

    if (!book || book.userId !== userId) {
      throw new Error('Book not found');
    }

    if (book.status !== 'completed') {
      throw new Error('Book is not completed');
    }

    const latestSession = await ctx.db
      .query('readingSessions')
      .withIndex('by_book', (q) => q.eq('bookId', args.bookId))
      .order('desc')
      .first();

    if (!latestSession) {
      throw new Error('No reading session found');
    }

    const previousPage = latestSession.startPage;

    await ctx.db.patch(args.bookId, {
      currentPage: previousPage,
      status: 'reading',
      updatedAt: Date.now(),
    });

    await ctx.db.delete(latestSession._id);

    return args.bookId;
  },
});

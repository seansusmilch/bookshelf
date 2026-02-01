import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getUserLists = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return [];
    }

    const userId = identity.subject;

    const lists = await ctx.db
      .query('lists')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    return lists;
  },
});

export const getBooksInList = query({
  args: {
    listId: v.id('lists'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return [];
    }

    const userId = identity.subject;

    const memberships = await ctx.db
      .query('bookListMembership')
      .withIndex('by_list', (q) => q.eq('listId', args.listId))
      .collect();

    const bookIds = memberships.map((m) => m.bookId);
    const books = await Promise.all(bookIds.map((id) => ctx.db.get(id)));

    return books.filter((b): b is NonNullable<typeof b> => b !== null);
  },
});

export const createList = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

    const now = Date.now();

    const listId = await ctx.db.insert('lists', {
      userId,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    });

    return listId;
  },
});

export const addBookToList = mutation({
  args: {
    bookId: v.id('books'),
    listId: v.id('lists'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

    const book = await ctx.db.get(args.bookId);
    const list = await ctx.db.get(args.listId);

    if (!book || book.userId !== userId) {
      throw new Error('Book not found');
    }

    if (!list || list.userId !== userId) {
      throw new Error('List not found');
    }

    const existing = await ctx.db
      .query('bookListMembership')
      .withIndex('by_book', (q) => q.eq('bookId', args.bookId))
      .filter((q) => q.eq(q.field('listId'), args.listId))
      .first();

    if (existing) {
      throw new Error('Book already in list');
    }

    const now = Date.now();

    await ctx.db.insert('bookListMembership', {
      bookId: args.bookId,
      listId: args.listId,
      userId,
      addedAt: now,
    });

    return args.bookId;
  },
});

export const removeBookFromList = mutation({
  args: {
    bookId: v.id('books'),
    listId: v.id('lists'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

    const membership = await ctx.db
      .query('bookListMembership')
      .withIndex('by_book', (q) => q.eq('bookId', args.bookId))
      .filter((q) => q.eq(q.field('listId'), args.listId))
      .first();

    if (!membership || membership.userId !== userId) {
      throw new Error('Membership not found');
    }

    await ctx.db.delete(membership._id);

    return args.bookId;
  },
});

export const deleteList = mutation({
  args: {
    listId: v.id('lists'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error('User not authenticated');
    }

    const userId = identity.subject;

    const list = await ctx.db.get(args.listId);

    if (!list || list.userId !== userId) {
      throw new Error('List not found');
    }

    const memberships = await ctx.db
      .query('bookListMembership')
      .withIndex('by_list', (q) => q.eq('listId', args.listId))
      .collect();

    if (memberships.length > 0) {
      throw new Error('Cannot delete list with books');
    }

    await ctx.db.delete(args.listId);

    return args.listId;
  },
});

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';

export const getBookRating = query({
  args: {
    bookId: v.id('books'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const rating = await ctx.db
      .query('ratings')
      .withIndex('by_user_book', (q) => q.eq('userId', userId).eq('bookId', args.bookId))
      .first();

    return rating;
  },
});

export const rateBook = mutation({
  args: {
    bookId: v.id('books'),
    rating: v.number(),
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

    if (args.rating < 1 || args.rating > 10) {
      throw new Error('Rating must be between 1 and 10');
    }

    const existing = await ctx.db
      .query('ratings')
      .withIndex('by_user_book', (q) => q.eq('userId', userId).eq('bookId', args.bookId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const ratingId = await ctx.db.insert('ratings', {
        bookId: args.bookId,
        userId,
        rating: args.rating,
        createdAt: now,
        updatedAt: now,
      });
      return ratingId;
    }
  },
});

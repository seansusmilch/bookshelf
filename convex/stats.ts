import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';

export const getReadingStats = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const currentYear = args.year;
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    const endOfYear = new Date(currentYear + 1, 0, 1).getTime();

    const completedBooks = await ctx.db
      .query('books')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const booksCompletedInYear = completedBooks.filter(
      (book) =>
        book.status === 'completed' && book.updatedAt >= startOfYear && book.updatedAt < endOfYear
    );

    const sessions = await ctx.db
      .query('readingSessions')
      .withIndex('by_user_date', (q) => q.eq('userId', userId))
      .collect();

    const sessionsInYear = sessions.filter(
      (session) => session.startedAt >= startOfYear && session.startedAt < endOfYear
    );

    const totalPagesRead = sessionsInYear.reduce((sum, session) => sum + session.pagesRead, 0);

    const goal = await ctx.db
      .query('yearlyGoals')
      .withIndex('by_user_year', (q) => q.eq('userId', userId).eq('year', currentYear))
      .first();

    return {
      booksRead: booksCompletedInYear.length,
      totalPagesRead,
      goal: goal?.goal ?? 0,
      goalProgress: goal ? (booksCompletedInYear.length / goal.goal) * 100 : 0,
    };
  },
});

export const setYearlyGoal = mutation({
  args: {
    year: v.number(),
    goal: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const existing = await ctx.db
      .query('yearlyGoals')
      .withIndex('by_user_year', (q) => q.eq('userId', userId).eq('year', args.year))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        goal: args.goal,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const goalId = await ctx.db.insert('yearlyGoals', {
        userId,
        year: args.year,
        goal: args.goal,
        createdAt: now,
        updatedAt: now,
      });
      return goalId;
    }
  },
});

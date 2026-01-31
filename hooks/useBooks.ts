import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';

export const useBooks = (statusFilter?: string) => {
  return useQuery(
    api.books.getUserBooks,
    statusFilter ? { status: statusFilter } : {}
  );
};

export const useBookDetail = (bookId: string | null) => {
  return useQuery(
    api.books.getBookById,
    bookId ? { bookId: bookId as Id<'books'> } : 'skip'
  );
};

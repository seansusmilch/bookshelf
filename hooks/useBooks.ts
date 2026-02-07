import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useEffect } from 'react';

export const useBooks = (statusFilter?: string) => {
  const books = useQuery(
    api.books.getUserBooks,
    statusFilter ? { status: statusFilter } : {}
  );

  useEffect(() => {
    console.log('useBooks called with statusFilter:', statusFilter);
    console.log('Books returned:', books?.map(book => book.title).join(', '));
    console.log('Books length:', books?.length);
  }, [books, statusFilter]);

  return books;
};

export const useBookDetail = (bookId: string | null) => {
  return useQuery(
    api.books.getBookById,
    bookId ? { bookId: bookId as Id<'books'> } : 'skip'
  );
};

export const useUserBookOpenLibraryIds = () => {
  const openLibraryIds = useQuery(api.books.getUserBookOpenLibraryIds);

  useEffect(() => {
    console.log('useUserBookOpenLibraryIds:', openLibraryIds);
  }, [openLibraryIds]);

  return openLibraryIds;
};

export const useUserBooksWithIds = () => {
  const books = useQuery(api.books.getUserBooksWithIds);

  useEffect(() => {
    console.log('useUserBooksWithIds:', books);
  }, [books]);

  return books;
};

export const useBookIdByOpenLibraryId = (openLibraryId: string | null | undefined) => {
  const bookId = useQuery(api.books.getBookIdByOpenLibraryId, openLibraryId ? { openLibraryId } : 'skip');

  useEffect(() => {
    console.log('useBookIdByOpenLibraryId:', openLibraryId, '->', bookId);
  }, [openLibraryId, bookId]);

  return bookId;
};

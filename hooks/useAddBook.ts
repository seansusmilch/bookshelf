import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';

type AddBookArgs = {
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  isbn10?: string;
  isbn13?: string;
  totalPages: number;
  status: string;
  googleBooksId?: string;
};

export const useAddBook = () => {
  return useMutation(api.books.addBook);
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useToast } from '@/hooks/useToast';
import { bookSchema } from '~/lib/validations';

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
  const toast = useToast();
  const queryClient = useQueryClient();
  const convex = useConvex();

  return useMutation({
    mutationFn: (args: AddBookArgs) => convex.mutation(api.books.addBook, args),
    onSuccess: () => {
      toast.showSuccess('Book added to library');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: Error) => {
      toast.showError('Failed to add book');
      console.error('Add book error:', error);
    },
  });
};

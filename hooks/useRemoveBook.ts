import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';

export const useRemoveBook = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const convex = useConvex();
  const router = useRouter();

  return useMutation({
    mutationFn: (bookId: Id<'books'>) => convex.mutation(api.books.deleteBook, { bookId }),
    onSuccess: () => {
      toast.showSuccess('Book removed from library');
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.back();
    },
    onError: (error: Error) => {
      toast.showError('Failed to remove book');
      console.error('Remove book error:', error);
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useToast } from '@/hooks/useToast';

export const useCompleteBook = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const convex = useConvex();

  return useMutation({
    mutationFn: (bookId: Id<'books'>) => convex.mutation(api.books.completeBook, { bookId }),
    onSuccess: () => {
      toast.showSuccess('Book marked as completed!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: Error) => {
      toast.showError('Failed to mark book as completed');
      console.error('Complete book error:', error);
    },
  });
};

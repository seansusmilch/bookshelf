import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useToast } from '@/hooks/useToast';

type UpdateProgressArgs = {
  bookId: Id<'books'>;
  currentPage: number;
};

export const useUpdateProgress = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const convex = useConvex();

  return useMutation({
    mutationFn: (args: UpdateProgressArgs) => convex.mutation(api.books.updateProgress, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: Error) => {
      toast.showError('Failed to update progress');
      console.error('Update progress error:', error);
    },
  });
};

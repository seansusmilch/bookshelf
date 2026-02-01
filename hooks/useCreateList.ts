import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useToast } from '@/hooks/useToast';

export const useCreateList = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const convex = useConvex();

  return useMutation({
    mutationFn: (name: string) => convex.mutation(api.lists.createList, { name }),
    onSuccess: () => {
      toast.showSuccess('List created');
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
    onError: (error: Error) => {
      toast.showError('Failed to create list');
      console.error('Create list error:', error);
    },
  });
};

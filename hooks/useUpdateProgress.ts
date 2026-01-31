import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';

export const useUpdateProgress = () => {
  return useMutation(api.books.updateProgress);
};

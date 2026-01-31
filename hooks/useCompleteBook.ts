import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';

export const useCompleteBook = () => {
  return useMutation(api.books.completeBook);
};

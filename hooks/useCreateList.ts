import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';

export const useCreateList = () => {
  return useMutation(api.lists.createList);
};

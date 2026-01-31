import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';

export const useLists = () => {
  return useQuery(api.lists.getUserLists, {});
};

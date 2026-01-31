import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';

export const useUpdateGoal = () => {
  return useMutation(api.stats.setYearlyGoal);
};

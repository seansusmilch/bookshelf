import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useAuth } from '@clerk/clerk-expo';

if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL in your .env.local file');
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);

type ConvexClientProviderProps = {
  children: ReactNode;
};

export const ConvexClientProvider = ({ children }: ConvexClientProviderProps) => {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
};

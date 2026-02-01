import { ViewStyle } from 'react-native';
import { View as StyledView } from '@/tw';

type SkeletonProps = {
  className?: string;
  style?: ViewStyle;
};

export const Skeleton = ({ className, style }: SkeletonProps) => {
  return (
    <StyledView
      className={`bg-gray-200 animate-pulse ${className}`}
      style={style}
    />
  );
};

type BookCardSkeletonProps = {
  className?: string;
};

export const BookCardSkeleton = ({ className }: BookCardSkeletonProps) => {
  return (
    <StyledView className={`flex-row bg-white p-4 mb-3 rounded-lg shadow-sm ${className}`}>
      <Skeleton className="w-16 h-24 rounded-md" />
      <StyledView className="ml-3 flex-1">
        <Skeleton className="h-5 w-3/4 mb-2 rounded" />
        <Skeleton className="h-4 w-1/2 mb-2 rounded" />
        <Skeleton className="h-3 w-1/3 mb-2 rounded" />
        <Skeleton className="h-2 w-full mt-3 rounded" />
      </StyledView>
    </StyledView>
  );
};

type ListItemSkeletonProps = {
  className?: string;
};

export const ListItemSkeleton = ({ className }: ListItemSkeletonProps) => {
  return (
    <StyledView className={`bg-white px-4 py-3 mb-2 rounded-lg ${className}`}>
      <Skeleton className="h-5 w-1/2 mb-1 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
    </StyledView>
  );
};

type StatsCardSkeletonProps = {
  className?: string;
};

export const StatsCardSkeleton = ({ className }: StatsCardSkeletonProps) => {
  return (
    <StyledView className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <StyledView className="items-center mb-4">
        <Skeleton className="h-12 w-24 mb-2 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </StyledView>
      <Skeleton className="h-2 w-full rounded" />
      <StyledView className="mt-4 flex-row justify-between">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </StyledView>
    </StyledView>
  );
};

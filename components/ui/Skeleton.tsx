import { View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/components/material3-provider';

type SkeletonProps = {
  className?: string;
  style?: ViewStyle;
};

export const Skeleton = ({ className, style }: SkeletonProps) => {
  const { colors } = useAppTheme();
  return (
    <View
      className={`animate-pulse ${className}`}
      style={[style, { backgroundColor: colors.surfaceContainerHighest }]}
    />
  );
};

type BookCardSkeletonProps = {
  className?: string;
};

export const BookCardSkeleton = ({ className }: BookCardSkeletonProps) => {
  const { colors } = useAppTheme();
  return (
    <View className={`flex-row p-4 mb-3 rounded-lg shadow-sm ${className}`} style={{ backgroundColor: colors.surface }}>
      <Skeleton className="w-16 h-24 rounded-md" />
      <View className="ml-3 flex-1">
        <Skeleton className="h-5 w-3/4 mb-2 rounded" />
        <Skeleton className="h-4 w-1/2 mb-2 rounded" />
        <Skeleton className="h-3 w-1/3 mb-2 rounded" />
        <Skeleton className="h-2 w-full mt-3 rounded" />
      </View>
    </View>
  );
};

type ListItemSkeletonProps = {
  className?: string;
};

export const ListItemSkeleton = ({ className }: ListItemSkeletonProps) => {
  const { colors } = useAppTheme();
  return (
    <View className={`px-4 py-3 mb-2 rounded-lg ${className}`} style={{ backgroundColor: colors.surface }}>
      <Skeleton className="h-5 w-1/2 mb-1 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
    </View>
  );
};

type StatsCardSkeletonProps = {
  className?: string;
};

export const StatsCardSkeleton = ({ className }: StatsCardSkeletonProps) => {
  const { colors } = useAppTheme();
  return (
    <View className={`p-6 rounded-lg shadow-sm ${className}`} style={{ backgroundColor: colors.surface }}>
      <View className="items-center mb-4">
        <Skeleton className="h-12 w-24 mb-2 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </View>
      <Skeleton className="h-2 w-full rounded" />
      <View className="mt-4 flex-row justify-between">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </View>
    </View>
  );
};

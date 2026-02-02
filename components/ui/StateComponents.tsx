import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type LoadingStateProps = {
  message?: string;
  size?: 'small' | 'large';
  className?: string;
};

export const LoadingState = ({ message = 'Loading...', size = 'large', className = '' }: LoadingStateProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-1 items-center justify-center px-8 ${className}`}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text className="mt-4 text-center" style={{ color: colors.onSurfaceVariant }}>
        {message}
      </Text>
    </View>
  );
};

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export const ErrorState = ({ message = 'Something went wrong', onRetry, className = '' }: ErrorStateProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-1 items-center justify-center px-8 ${className}`}>
      <MaterialIcons name="error-outline" size={48} color={colors.error} />
      <Text className="mt-4 text-center" style={{ color: colors.onSurface }}>
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-semibold" style={{ color: colors.onPrimary }}>
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
};

type EmptyStateProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title?: string;
  message?: string;
  action?: { label: string; onPress: () => void };
  className?: string;
};

export const EmptyState = ({
  icon = 'inbox',
  title = 'Nothing here',
  message = 'No content to display',
  action,
  className = '',
}: EmptyStateProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-1 items-center justify-center px-8 ${className}`}>
      <MaterialIcons name={icon} size={64} color={colors.onSurfaceVariant} />
      <Text className="mt-4 text-lg font-semibold text-center" style={{ color: colors.onSurface }}>
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm" style={{ color: colors.onSurfaceVariant }}>
        {message}
      </Text>
      {action && (
        <Pressable
          onPress={action.onPress}
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-semibold" style={{ color: colors.onPrimary }}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

type InlineLoadingProps = {
  message?: string;
  className?: string;
};

export const InlineLoading = ({ message = 'Loading...', className = '' }: InlineLoadingProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-row items-center justify-center py-8 ${className}`}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text className="ml-3 text-sm" style={{ color: colors.onSurfaceVariant }}>
        {message}
      </Text>
    </View>
  );
};

type PageLoadingProps = {
  message?: string;
  className?: string;
};

export const PageLoading = ({ message = 'Loading...', className = '' }: PageLoadingProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-1 items-center justify-center ${className}`} style={{ backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-4" style={{ color: colors.onSurfaceVariant }}>
        {message}
      </Text>
    </View>
  );
};

type PageErrorProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export const PageError = ({ message = 'Something went wrong', onRetry, className = '' }: PageErrorProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-1 items-center justify-center px-8 ${className}`} style={{ backgroundColor: colors.background }}>
      <MaterialIcons name="error-outline" size={48} color={colors.error} />
      <Text className="mt-4 text-center text-lg" style={{ color: colors.onSurface }}>
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-semibold" style={{ color: colors.onPrimary }}>
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
};

import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { forwardRef } from 'react';
import { useAppTheme } from '@/components/material3-provider';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  mode?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  className?: string;
};

export const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      variant = 'filled',
      size = 'medium',
      loading = false,
      disabled = false,
      icon,
      onPress,
      className = '',
    },
    ref,
  ) => {
    const { colors } = useAppTheme();

    const sizeStyles = {
      small: 'h-8 px-3',
      medium: 'h-10 px-4',
      large: 'h-12 px-6',
    };

    const textSize = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

    const variantStyles = {
      filled: {
        bg: disabled ? colors.surfaceVariant : colors.primary,
        text: disabled ? colors.onSurfaceVariant : colors.onPrimary,
        border: 'border-transparent',
      },
      outlined: {
        bg: 'transparent',
        text: disabled ? colors.onSurfaceVariant : colors.primary,
        border: `border-2 ${disabled ? 'border-transparent' : 'border-current'}`,
      },
      text: {
        bg: 'transparent',
        text: disabled ? colors.onSurfaceVariant : colors.primary,
        border: 'border-transparent',
      },
      elevated: {
        bg: disabled ? colors.surfaceVariant : colors.primary,
        text: disabled ? colors.onSurfaceVariant : colors.onPrimary,
        border: 'border-transparent',
      },
      tonal: {
        bg: disabled ? colors.surfaceVariant : colors.secondaryContainer,
        text: disabled ? colors.onSurfaceVariant : colors.onSecondaryContainer,
        border: 'border-transparent',
      },
    };

    const styles = variantStyles[variant];

    return (
      <Pressable
        ref={ref as any}
        onPress={onPress}
        disabled={disabled || loading}
        className={`flex-row items-center justify-center rounded-full ${sizeStyles[size]} ${styles.border} ${className}`}
        style={{
          backgroundColor: styles.bg,
          elevation: variant === 'elevated' ? 2 : 0,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={styles.text} />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={`${textSize[size]} font-semibold`} style={{ color: styles.text }}>
              {children}
            </Text>
          </>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';

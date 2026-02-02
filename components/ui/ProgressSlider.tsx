import { Pressable, View, Text, LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { useAppTheme } from '@/components/material3-provider';

type ProgressSliderProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
};

export const ProgressSlider = ({
  value,
  max,
  onChange,
  showLabel = true,
  disabled = false,
  className = '',
}: ProgressSliderProps) => {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);
  const progress = max > 0 ? value / max : 0;

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (event: any) => {
    if (disabled || width === 0) return;
    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / width));
    const newValue = Math.round(newProgress * max);
    onChange(Math.max(0, Math.min(max, newValue)));
  };

  return (
    <View className={className}>
      {showLabel && (
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>
            Progress
          </Text>
          <Text className="text-sm font-semibold" style={{ color: colors.onSurface }}>
            {value} / {max}
          </Text>
        </View>
      )}

      <Pressable
        onPress={handlePress}
        onLayout={handleLayout}
        disabled={disabled}
        className="h-6 rounded-full overflow-hidden active:opacity-80"
        style={{
          backgroundColor: colors.surfaceContainerHighest,
        }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: disabled ? colors.surfaceContainerHighest : colors.primary,
          }}
        />
      </Pressable>

      {!disabled && (
        <Text className="text-xs text-center mt-2" style={{ color: colors.onSurfaceVariant }}>
          Tap to update progress
        </Text>
      )}
    </View>
  );
};

type LinearProgressProps = {
  value: number;
  max: number;
  variant?: 'determinate' | 'indeterminate';
  className?: string;
};

export const LinearProgress = ({ value, max, variant = 'determinate', className = '' }: LinearProgressProps) => {
  const { colors } = useAppTheme();
  const progress = max > 0 ? value / max : 0;

  if (variant === 'indeterminate') {
    return (
      <View className={`h-1 overflow-hidden rounded-full ${className}`} style={{ backgroundColor: colors.surfaceContainerHighest }}>
        <View
          className="h-full"
          style={{
            backgroundColor: colors.primary,
            width: '30%',
          }}
        />
      </View>
    );
  }

  return (
    <View className={`h-1 overflow-hidden rounded-full ${className}`} style={{ backgroundColor: colors.surfaceContainerHighest }}>
      <View
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
};

type CircularProgressProps = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export const CircularProgress = ({
  value,
  max,
  size = 48,
  strokeWidth = 4,
  className = '',
}: CircularProgressProps) => {
  const { colors } = useAppTheme();
  const progress = max > 0 ? value / max : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View className={`items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <View className="absolute">
        <Text className="text-xs font-semibold" style={{ color: colors.onSurface }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
};

type ProgressCardProps = {
  label: string;
  value: number;
  max: number;
  onEdit?: () => void;
  className?: string;
};

export const ProgressCard = ({ label, value, max, onEdit, className = '' }: ProgressCardProps) => {
  const { colors } = useAppTheme();
  const progress = max > 0 ? (value / max) * 100 : 0;

  return (
    <View className={`p-4 rounded-xl ${className}`} style={{ backgroundColor: colors.surfaceContainerLow }}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>
          {label}
        </Text>
        {onEdit && (
          <Pressable onPress={onEdit} className="px-2 py-1 rounded-full" style={{ backgroundColor: colors.primaryContainer }}>
            <Text className="text-xs font-semibold" style={{ color: colors.onPrimaryContainer }}>
              Edit
            </Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row items-baseline gap-1 mb-2">
        <Text className="text-2xl font-bold" style={{ color: colors.onSurface }}>
          {value}
        </Text>
        <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>
          / {max}
        </Text>
        <Text className="text-sm ml-auto font-semibold" style={{ color: colors.primary }}>
          {Math.round(progress)}%
        </Text>
      </View>

      <LinearProgress value={value} max={max} />
    </View>
  );
};

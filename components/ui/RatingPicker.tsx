import { Pressable, View, Text } from 'react-native';
import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type RatingPickerProps = {
  value?: number;
  max?: number;
  onChange: (rating: number) => void;
  size?: number;
  interactive?: boolean;
  className?: string;
};

export const RatingPicker = ({
  value,
  max = 10,
  onChange,
  size = 32,
  interactive = true,
  className = '',
}: RatingPickerProps) => {
  const { colors } = useAppTheme();

  const Wrapper = interactive ? Pressable : View;

  return (
    <View className={`items-center ${className}`}>
      <View className="flex-row gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
          const isFilled = value !== undefined && rating <= value;
          const isHalf = value !== undefined && rating === Math.ceil(value) && !Number.isInteger(value);

          return (
            <Wrapper
              key={rating}
              onPress={() => interactive && onChange(rating)}
              style={{ opacity: interactive ? 1 : 0.7 }}
            >
              <MaterialIcons
                name={isHalf ? 'star-half' : isFilled ? 'star' : 'star-border'}
                size={size}
                color={isFilled ? colors.tertiary : colors.outline}
              />
            </Wrapper>
          );
        })}
      </View>
      {value !== undefined && (
        <Text className="text-sm mt-2 font-medium" style={{ color: colors.onSurfaceVariant }}>
          {value} / {max}
        </Text>
      )}
    </View>
  );
};

type RatingChipsProps = {
  value?: number;
  max?: number;
  onChange: (rating: number) => void;
  className?: string;
};

export const RatingChips = ({ value, max = 10, onChange, className = '' }: RatingChipsProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
        const isSelected = value === rating;

        return (
          <Pressable
            key={rating}
            onPress={() => onChange(rating)}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isSelected ? '' : ''
            }`}
            style={{
              backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainerHighest,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
              }}
            >
              {rating}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

type RatingDisplayProps = {
  rating: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

export const RatingDisplay = ({ rating, max = 10, size = 'medium', className = '' }: RatingDisplayProps) => {
  const { colors } = useAppTheme();

  const sizeStyles = {
    small: { icon: 20, text: 'text-base' },
    medium: { icon: 28, text: 'text-xl' },
    large: { icon: 36, text: 'text-2xl' },
  };

  const { icon: iconSize, text } = sizeStyles[size];

  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <MaterialIcons name="star" size={iconSize} color={colors.tertiary} />
      <Text className={`${text} font-semibold`} style={{ color: colors.onSurface }}>
        {rating}
      </Text>
      <Text className={`text-sm ${text}`} style={{ color: colors.onSurfaceVariant }}>
        / {max}
      </Text>
    </View>
  );
};

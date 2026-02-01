import { Pressable, View, Text } from '@/tw';
import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  variant?: 'filled' | 'outlined' | 'tonal';
  className?: string;
};

export const Chip = ({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  variant = 'outlined',
  className = '',
}: ChipProps) => {
  const { colors } = useAppTheme();

  const variantStyles = {
    filled: {
      bg: selected ? colors.primary : colors.surface,
      text: selected ? colors.onPrimary : colors.onSurface,
      border: 'border-transparent',
    },
    outlined: {
      bg: selected ? colors.secondaryContainer : 'transparent',
      text: selected ? colors.onSecondaryContainer : colors.onSurfaceVariant,
      border: `border ${selected ? 'border-transparent' : 'border-current'}`,
    },
    tonal: {
      bg: selected ? colors.secondaryContainer : colors.surfaceVariant,
      text: selected ? colors.onSecondaryContainer : colors.onSurfaceVariant,
      border: 'border-transparent',
    },
  };

  const styles = variantStyles[variant];
  const opacity = disabled ? 0.38 : 1;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-2 px-3 py-2 rounded-full self-start ${styles.border} ${className}`}
      style={{
        backgroundColor: styles.bg,
        opacity,
      }}
    >
      {icon && <MaterialIcons name={icon} size={18} color={styles.text} />}
      <Text className="text-sm font-medium" style={{ color: styles.text }}>
        {label}
      </Text>
    </Pressable>
  );
};

type ChoiceChipProps = {
  options: { value: string; label: string; icon?: keyof typeof MaterialIcons.glyphMap }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const ChoiceChip = ({ options, value, onChange, className = '' }: ChoiceChipProps) => {
  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
          icon={option.icon}
        />
      ))}
    </View>
  );
};

type FilterChipProps = {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
};

export const FilterChip = ({ options, selected, onToggle, className = '' }: FilterChipProps) => {
  return (
    <View className={`flex-row flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={selected.includes(option.value)}
          onPress={() => onToggle(option.value)}
        />
      ))}
    </View>
  );
};

type ActionChipProps = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  className?: string;
};

export const ActionChip = ({ label, icon, onPress, className = '' }: ActionChipProps) => {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 px-3 py-2 rounded-full self-start"
      style={{ backgroundColor: colors.surfaceContainerHighest }}
    >
      <MaterialIcons name={icon} size={18} color={colors.onSurfaceVariant} />
      <Text className="text-sm font-medium" style={{ color: colors.onSurface }}>
        {label}
      </Text>
    </Pressable>
  );
};

type InputChipProps = {
  label: string;
  onRemove?: () => void;
  avatar?: React.ReactNode;
  className?: string;
};

export const InputChip = ({ label, onRemove, avatar, className = '' }: InputChipProps) => {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-row items-center gap-2 px-3 py-2 rounded-full self-start"
      style={{ backgroundColor: colors.surfaceContainerHighest }}
    >
      {avatar && <View>{avatar}</View>}
      <Text className="text-sm font-medium" style={{ color: colors.onSurface }}>
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-1">
          <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
      )}
    </View>
  );
};

type SuggestionChipProps = {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  className?: string;
};

export const SuggestionChip = ({ label, icon, onPress, className = '' }: SuggestionChipProps) => {
  const { colors } = useAppTheme();

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper onPress={onPress} className="flex-row items-center gap-2 px-3 py-2 rounded-full self-start">
      {icon && <MaterialIcons name={icon} size={16} color={colors.primary} />}
      <Text className="text-sm font-medium" style={{ color: colors.primary }}>
        {label}
      </Text>
    </Wrapper>
  );
};

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export const Checkbox = ({ label, checked, onChange, disabled = false, className = '' }: CheckboxProps) => {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex-row items-center gap-3 px-2 py-3 ${className}`}
      style={{ opacity: disabled ? 0.38 : 1 }}
    >
      <View
        className="w-6 h-6 rounded items-center justify-center"
        style={{
          backgroundColor: checked ? colors.primary : 'transparent',
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.outline,
        }}
      >
        {checked && <MaterialIcons name="check" size={16} color={colors.onPrimary} />}
      </View>
      <Text className="text-sm flex-1" style={{ color: colors.onSurface }}>
        {label}
      </Text>
    </Pressable>
  );
};

type RadioGroupProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const RadioGroup = ({ options, value, onChange, className = '' }: RadioGroupProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={className}>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-row items-center gap-3 px-2 py-3"
          >
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.outline,
              }}
            >
              {isSelected && (
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
              )}
            </View>
            <Text className="text-sm flex-1" style={{ color: colors.onSurface }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

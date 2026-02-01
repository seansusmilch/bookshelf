import { View, Text } from '@/tw';
import { useAppTheme } from '@/components/material3-provider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type SectionProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export const Section = ({ title, children, className = '' }: SectionProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={className}>
      {title && (
        <Text className="text-sm font-semibold mb-3 px-1" style={{ color: colors.primary }}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export const SectionHeader = ({ title, subtitle, action, className = '' }: SectionHeaderProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-row items-start justify-between mb-3 ${className}`}>
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.onSurface }}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm mt-0.5" style={{ color: colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View className="ml-2">{action}</View>}
    </View>
  );
};

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
  className?: string;
};

export const InfoRow = ({ icon, label, value, className = '' }: InfoRowProps) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-row items-center gap-3 ${className}`}>
      <MaterialIcons name={icon} size={18} color={colors.onSurfaceVariant} />
      <View className="flex-1">
        <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>
          {label}
        </Text>
      </View>
      <Text className="text-sm font-medium" style={{ color: colors.onSurface }}>
        {value}
      </Text>
    </View>
  );
};

type DividerProps = {
  className?: string;
};

export const Divider = ({ className = '' }: DividerProps) => {
  const { colors } = useAppTheme();

  return (
    <View
      className={`h-px ${className}`}
      style={{ backgroundColor: colors.outlineVariant }}
    />
  );
};

type SpacerProps = {
  size?: number;
  className?: string;
};

export const Spacer = ({ size = 16, className = '' }: SpacerProps) => {
  return <View className="" style={{ height: size }} />;
};

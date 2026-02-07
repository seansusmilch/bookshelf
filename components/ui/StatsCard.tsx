import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/components/material3-provider';

type StatsCardProps = {
  booksRead: number;
  yearlyGoal: number;
  pagesRead: number;
  onSetGoalPress?: () => void;
};

export const StatsCard = ({ booksRead, yearlyGoal, pagesRead, onSetGoalPress }: StatsCardProps) => {
  const { colors } = useAppTheme();
  const progressPercent = yearlyGoal > 0 ? Math.min(100, (booksRead / yearlyGoal) * 100) : 0;

  return (
    <View className="rounded-xl shadow-sm p-4" style={{ backgroundColor: colors.surface }}>
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-sm mb-1" style={{ color: colors.onSurfaceVariant }}>Books read this year</Text>
          <Text className="text-4xl font-bold" style={{ color: colors.onSurface }}>{booksRead}</Text>
        </View>
        <Pressable
          onPress={onSetGoalPress}
          className="px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.onPrimary }}>Set Goal</Text>
        </Pressable>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>Yearly goal</Text>
          <Text className="text-sm font-semibold" style={{ color: colors.onSurface }}>
            {booksRead} / {yearlyGoal} books
          </Text>
        </View>
        <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceContainerHighest }}>
          <View
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPercent}%`, backgroundColor: colors.primary }}
          />
        </View>
      </View>

      <View className="flex-row items-center gap-2 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.outlineVariant }}>
        <FontAwesome name="file-text-o" size={16} color={colors.onSurfaceVariant} />
        <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>
          {pagesRead.toLocaleString()} pages read
        </Text>
      </View>
    </View>
  );
};

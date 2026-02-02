import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type StatsCardProps = {
  booksRead: number;
  yearlyGoal: number;
  pagesRead: number;
  onSetGoalPress?: () => void;
};

export const StatsCard = ({ booksRead, yearlyGoal, pagesRead, onSetGoalPress }: StatsCardProps) => {
  const progressPercent = yearlyGoal > 0 ? Math.min(100, (booksRead / yearlyGoal) * 100) : 0;

  return (
    <View className="bg-white rounded-xl shadow-sm p-4">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-sm text-gray-500 mb-1">Books read this year</Text>
          <Text className="text-4xl font-bold text-gray-900">{booksRead}</Text>
        </View>
        <Pressable
          onPress={onSetGoalPress}
          className="px-3 py-1.5 bg-blue-500 rounded-lg"
        >
          <Text className="text-xs font-semibold text-white">Set Goal</Text>
        </Pressable>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Yearly goal</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {booksRead} / {yearlyGoal} books
          </Text>
        </View>
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <View className="flex-row items-center gap-2 pt-3 border-t border-gray-100">
        <FontAwesome name="file-text-o" size={16} color="#6b7280" />
        <Text className="text-sm text-gray-600">
          {pagesRead.toLocaleString()} pages read
        </Text>
      </View>
    </View>
  );
};

import { View, Text, TextInput, Pressable } from '@/tw';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StatsCard } from '@/components/ui/StatsCard';
import { useStats } from '@/hooks/useStats';
import { useUpdateGoal } from '@/hooks/useUpdateGoal';
import { StatsCardSkeleton } from '@/components/ui/Skeleton';

export default function StatsScreen() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const stats = useStats();
  const updateGoal = useUpdateGoal();

  const handleSetGoalPress = () => {
    if (stats) {
      setNewGoal(stats.goal?.toString() || '12');
    }
    setShowGoalModal(true);
  };

  const handleSaveGoal = () => {
    const goal = parseInt(newGoal, 10);
    if (goal > 0 && goal <= 1000) {
      updateGoal.mutate(goal);
      setShowGoalModal(false);
      setNewGoal('');
    }
  };

  const handleCancelGoal = () => {
    setShowGoalModal(false);
    setNewGoal('');
  };

   const booksRead = stats?.booksRead || 0;
   const yearlyGoal = stats?.goal || 0;
   const pagesRead = stats?.totalPagesRead || 0;

   return (
     <>
       <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
         <View className="px-4 pt-4">
           {stats === undefined ? (
             <StatsCardSkeleton />
           ) : (
             <StatsCard
               booksRead={booksRead}
               yearlyGoal={yearlyGoal}
               pagesRead={pagesRead}
               onSetGoalPress={handleSetGoalPress}
             />
           )}

          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Yearly Overview</Text>

            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Books completed</Text>
                <Text className="text-xl font-bold text-gray-900">{booksRead}</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${yearlyGoal > 0 ? Math.min(100, (booksRead / yearlyGoal) * 100) : 0}%` }}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-2">
                {yearlyGoal > 0
                  ? `${Math.min(100, Math.round((booksRead / yearlyGoal) * 100))}% of goal`
                  : 'No goal set'}
              </Text>
            </View>

            <View className="bg-white rounded-xl shadow-sm p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Pages read</Text>
                <Text className="text-xl font-bold text-gray-900">{pagesRead.toLocaleString()}</Text>
              </View>
              {booksRead > 0 && (
                <Text className="text-xs text-gray-500">
                  Average {Math.round(pagesRead / booksRead)} pages per book
                </Text>
              )}
            </View>
          </View>

          {yearlyGoal === 0 && (
            <Pressable
              onPress={handleSetGoalPress}
              className="mt-6 bg-blue-500 rounded-xl p-4"
            >
              <Text className="text-white text-center font-semibold">Set Your Reading Goal</Text>
              <Text className="text-blue-100 text-center text-sm mt-1">
                Start tracking your reading journey
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      {showGoalModal && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={handleCancelGoal}
        >
          <View className="flex-1 bg-black/50 items-center justify-center px-4">
            <View className="bg-white rounded-2xl w-full max-w-sm p-6">
              <Text className="text-xl font-bold text-gray-900 mb-2">Set Yearly Goal</Text>
              <Text className="text-sm text-gray-600 mb-4">
                How many books do you want to read this year?
              </Text>

              <TextInput
                value={newGoal}
                onChangeText={setNewGoal}
                placeholder="Enter number of books"
                keyboardType="number-pad"
                className="px-4 py-3 bg-gray-100 rounded-xl text-lg text-center font-semibold text-gray-900 mb-4"
              />

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleCancelGoal}
                  className="flex-1 py-3 bg-gray-100 rounded-xl"
                >
                  <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveGoal}
                  className="flex-1 py-3 bg-blue-500 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useAppTheme } from '@/components/material3-provider';
import { StatsCard } from '@/components/ui/StatsCard';
import { useStats } from '@/hooks/useStats';
import { useUpdateGoal } from '@/hooks/useUpdateGoal';
import { StatsCardSkeleton } from '@/components/ui/Skeleton';

 export default function StatsScreen() {
   const { signOut } = useAuth();
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

  const handleSignOut = () => {
    signOut();
  };

   const booksRead = stats?.booksRead || 0;
    const yearlyGoal = stats?.goal || 0;
    const pagesRead = stats?.totalPagesRead || 0;
    const { colors } = useAppTheme();

    return (
      <>
        <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
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
              <Text className="text-lg font-semibold mb-4" style={{ color: colors.onSurface }}>
                Yearly Overview
              </Text>

              <View className="rounded-xl shadow-sm p-4 mb-4" style={{ backgroundColor: colors.surface }}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>
                    Books completed
                  </Text>
                  <Text className="text-xl font-bold" style={{ color: colors.onSurface }}>
                    {booksRead}
                  </Text>
                </View>
                <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceContainerHighest }}>
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${yearlyGoal > 0 ? Math.min(100, (booksRead / yearlyGoal) * 100) : 0}%`, backgroundColor: colors.primary }}
                  />
                </View>
                <Text className="text-xs mt-2" style={{ color: colors.onSurfaceVariant }}>
                  {yearlyGoal > 0
                    ? `${Math.min(100, Math.round((booksRead / yearlyGoal) * 100))}% of goal`
                    : 'No goal set'}
                </Text>
              </View>

              <View className="rounded-xl shadow-sm p-4" style={{ backgroundColor: colors.surface }}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm" style={{ color: colors.onSurfaceVariant }}>
                    Pages read
                  </Text>
                  <Text className="text-xl font-bold" style={{ color: colors.onSurface }}>
                    {pagesRead.toLocaleString()}
                  </Text>
                </View>
                {booksRead > 0 && (
                  <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>
                    Average {Math.round(pagesRead / booksRead)} pages per book
                  </Text>
                )}
              </View>
            </View>

            {yearlyGoal === 0 && (
              <Pressable
                onPress={handleSetGoalPress}
                className="mt-6 rounded-xl p-4"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white text-center font-semibold">Set Your Reading Goal</Text>
                <Text className="text-white text-center text-sm mt-1" style={{ opacity: 0.8 }}>
                  Start tracking your reading journey
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleSignOut}
              className="mt-6 rounded-xl p-4"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-white text-center font-semibold">Sign Out</Text>
            </Pressable>
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
              <View className="rounded-2xl w-full max-w-sm p-6" style={{ backgroundColor: colors.surface }}>
                <Text className="text-xl font-bold mb-2" style={{ color: colors.onSurface }}>Set Yearly Goal</Text>
                <Text className="text-sm mb-4" style={{ color: colors.onSurfaceVariant }}>
                  How many books do you want to read this year?
                </Text>

                <TextInput
                  value={newGoal}
                  onChangeText={setNewGoal}
                  placeholder="Enter number of books"
                  keyboardType="number-pad"
                  className="px-4 py-3 rounded-xl text-lg text-center font-semibold"
                  style={{
                    backgroundColor: colors.surfaceContainerHighest,
                    color: colors.onSurface,
                  }}
                  placeholderTextColor={colors.onSurfaceVariant}
                />

                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    onPress={handleCancelGoal}
                    className="flex-1 py-3 rounded-xl"
                    style={{ backgroundColor: colors.surfaceContainerHighest }}
                  >
                    <Text className="text-center font-semibold" style={{ color: colors.onSurface }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveGoal}
                    className="flex-1 py-3 rounded-xl"
                    style={{ backgroundColor: colors.primary }}
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

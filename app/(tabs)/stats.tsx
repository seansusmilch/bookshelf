import {View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useState} from 'react'
import {useAuth} from '@clerk/clerk-expo'
import {useAppTheme} from '@/components/material3-provider'
import {StatsCard} from '@/components/ui/StatsCard'
import {useStats} from '@/hooks/useStats'
import {useUpdateGoal} from '@/hooks/useUpdateGoal'
import {StatsCardSkeleton} from '@/components/ui/Skeleton'

export default function StatsScreen() {
    const {signOut} = useAuth()
    const [showGoalModal, setShowGoalModal] = useState(false)
    const [newGoal, setNewGoal] = useState('')

    const stats = useStats()
    const updateGoal = useUpdateGoal()

    const handleSetGoalPress = () => {
        if (stats) {
            setNewGoal(stats.goal?.toString() || '12')
        }
        setShowGoalModal(true)
    }

    const handleSaveGoal = () => {
        const goal = parseInt(newGoal, 10)
        if (goal > 0 && goal <= 1000) {
            updateGoal.mutate(goal)
            setShowGoalModal(false)
            setNewGoal('')
        }
    }

    const handleCancelGoal = () => {
        setShowGoalModal(false)
        setNewGoal('')
    }

    const handleSignOut = () => {
        signOut()
    }

    const booksRead = stats?.booksRead || 0
    const yearlyGoal = stats?.goal || 0
    const pagesRead = stats?.totalPagesRead || 0
    const {colors} = useAppTheme()

    return (
        <>
            <SafeAreaView
                className="flex-1"
                edges={['top']}
                style={{backgroundColor: colors.background}}>
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
                        <Text
                            className="mb-4 text-lg font-semibold"
                            style={{color: colors.onSurface}}>
                            Yearly Overview
                        </Text>

                        <View
                            className="mb-4 rounded-xl p-4 shadow-sm"
                            style={{backgroundColor: colors.surface}}>
                            <View className="mb-2 flex-row items-center justify-between">
                                <Text className="text-sm" style={{color: colors.onSurfaceVariant}}>
                                    Books completed
                                </Text>
                                <Text
                                    className="text-xl font-bold"
                                    style={{color: colors.onSurface}}>
                                    {booksRead}
                                </Text>
                            </View>
                            <View
                                className="h-2 overflow-hidden rounded-full"
                                style={{backgroundColor: colors.surfaceContainerHighest}}>
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${yearlyGoal > 0 ? Math.min(100, (booksRead / yearlyGoal) * 100) : 0}%`,
                                        backgroundColor: colors.primary,
                                    }}
                                />
                            </View>
                            <Text className="mt-2 text-xs" style={{color: colors.onSurfaceVariant}}>
                                {yearlyGoal > 0
                                    ? `${Math.min(100, Math.round((booksRead / yearlyGoal) * 100))}% of goal`
                                    : 'No goal set'}
                            </Text>
                        </View>

                        <View
                            className="rounded-xl p-4 shadow-sm"
                            style={{backgroundColor: colors.surface}}>
                            <View className="mb-2 flex-row items-center justify-between">
                                <Text className="text-sm" style={{color: colors.onSurfaceVariant}}>
                                    Pages read
                                </Text>
                                <Text
                                    className="text-xl font-bold"
                                    style={{color: colors.onSurface}}>
                                    {pagesRead.toLocaleString()}
                                </Text>
                            </View>
                            {booksRead > 0 && (
                                <Text className="text-xs" style={{color: colors.onSurfaceVariant}}>
                                    Average {Math.round(pagesRead / booksRead)} pages per book
                                </Text>
                            )}
                        </View>
                    </View>

                    {yearlyGoal === 0 && (
                        <Pressable
                            onPress={handleSetGoalPress}
                            className="mt-6 rounded-xl p-4"
                            style={{backgroundColor: colors.primary}}>
                            <Text className="text-center font-semibold text-white">
                                Set Your Reading Goal
                            </Text>
                            <Text
                                className="mt-1 text-center text-sm text-white"
                                style={{opacity: 0.8}}>
                                Start tracking your reading journey
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handleSignOut}
                        className="mt-6 rounded-xl p-4"
                        style={{backgroundColor: colors.error}}>
                        <Text className="text-center font-semibold text-white">Sign Out</Text>
                    </Pressable>
                </View>
            </SafeAreaView>

            <Modal
                visible={showGoalModal}
                transparent
                animationType="fade"
                onRequestClose={handleCancelGoal}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{flex: 1}}>
                    <Pressable
                        onPress={handleCancelGoal}
                        className="flex-1 items-center justify-center bg-black/60 px-6">
                        <Pressable onPress={() => {}} className="w-full max-w-md">
                            <View
                                className="rounded-3xl p-6"
                                style={{backgroundColor: colors.surface}}>
                                <Text
                                    className="mb-1 text-2xl font-bold"
                                    style={{color: colors.onSurface}}>
                                    Set Reading Goal
                                </Text>
                                <Text
                                    className="mb-6 text-base"
                                    style={{color: colors.onSurfaceVariant}}>
                                    How many books would you like to read this year?
                                </Text>

                                <TextInput
                                    value={newGoal}
                                    onChangeText={setNewGoal}
                                    placeholder="12"
                                    keyboardType="number-pad"
                                    className="mb-6 rounded-2xl px-5 py-4 text-center text-2xl font-bold"
                                    style={{
                                        backgroundColor: colors.surfaceContainerHighest,
                                        color: colors.onSurface,
                                        borderCurve: 'continuous',
                                    }}
                                    placeholderTextColor={colors.onSurfaceVariant}
                                    autoFocus
                                    selectTextOnFocus
                                />

                                <View className="flex-row gap-3">
                                    <Pressable
                                        onPress={handleCancelGoal}
                                        className="flex-1 rounded-2xl py-4"
                                        style={{backgroundColor: colors.surfaceContainerHighest}}
                                        android_ripple={{color: 'rgba(0,0,0,0.1)'}}>
                                        <Text
                                            className="text-center text-base font-bold"
                                            style={{color: colors.onSurface}}>
                                            Cancel
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleSaveGoal}
                                        className="flex-1 rounded-2xl py-4"
                                        style={{backgroundColor: colors.primary}}
                                        android_ripple={{color: 'rgba(255,255,255,0.2)'}}>
                                        <Text className="text-center text-base font-bold text-white">
                                            Save Goal
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </>
    )
}

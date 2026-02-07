import {View, ViewStyle} from 'react-native'
import {useAppTheme} from '@/components/material3-provider'

type SkeletonProps = {
    className?: string
    style?: ViewStyle
}

export const Skeleton = ({className, style}: SkeletonProps) => {
    const {colors} = useAppTheme()
    return (
        <View
            className={`animate-pulse ${className}`}
            style={[style, {backgroundColor: colors.surfaceContainerHighest}]}
        />
    )
}

type BookCardSkeletonProps = {
    className?: string
}

export const BookCardSkeleton = ({className}: BookCardSkeletonProps) => {
    const {colors} = useAppTheme()
    return (
        <View
            className={`mb-3 flex-row rounded-lg p-4 shadow-sm ${className}`}
            style={{backgroundColor: colors.surface}}>
            <Skeleton className="h-24 w-16 rounded-md" />
            <View className="ml-3 flex-1">
                <Skeleton className="mb-2 h-5 w-3/4 rounded" />
                <Skeleton className="mb-2 h-4 w-1/2 rounded" />
                <Skeleton className="mb-2 h-3 w-1/3 rounded" />
                <Skeleton className="mt-3 h-2 w-full rounded" />
            </View>
        </View>
    )
}

type ListItemSkeletonProps = {
    className?: string
}

export const ListItemSkeleton = ({className}: ListItemSkeletonProps) => {
    const {colors} = useAppTheme()
    return (
        <View
            className={`mb-2 rounded-lg px-4 py-3 ${className}`}
            style={{backgroundColor: colors.surface}}>
            <Skeleton className="mb-1 h-5 w-1/2 rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
        </View>
    )
}

type StatsCardSkeletonProps = {
    className?: string
}

export const StatsCardSkeleton = ({className}: StatsCardSkeletonProps) => {
    const {colors} = useAppTheme()
    return (
        <View
            className={`rounded-lg p-6 shadow-sm ${className}`}
            style={{backgroundColor: colors.surface}}>
            <View className="mb-4 items-center">
                <Skeleton className="mb-2 h-12 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
            </View>
            <Skeleton className="h-2 w-full rounded" />
            <View className="mt-4 flex-row justify-between">
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
            </View>
        </View>
    )
}

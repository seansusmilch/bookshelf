import {useAppTheme} from '@/components/material3-provider'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import {Image, Pressable, Text, View} from 'react-native'

type BookHeaderProps = {
    title: string
    author: string
    coverUrl?: string
    showBackButton?: boolean
    onBackPress?: () => void
    className?: string
}

export const BookHeader = ({
    title,
    author,
    coverUrl,
    showBackButton = false,
    onBackPress,
    className = '',
}: BookHeaderProps) => {
    const {colors} = useAppTheme()
    const backgroundColor = colors.background

    return (
        <View className={`relative overflow-hidden ${className}`} style={{height: 400}}>
            <View className="absolute inset-0" style={{backgroundColor}} />

            {coverUrl ? (
                <Image
                    source={{uri: coverUrl}}
                    className="absolute inset-0 h-full w-full"
                    resizeMode="cover"
                    blurRadius={25}
                />
            ) : (
                <View className="absolute inset-0 items-center justify-center opacity-10">
                    <MaterialIcons name="menu-book" size={200} color={colors.onSurface} />
                </View>
            )}

            <View className="absolute inset-0 bg-black/50" />

            {showBackButton && (
                <Pressable
                    onPress={onBackPress}
                    className="absolute left-4 top-4 z-20 h-10 w-10 items-center justify-center rounded-full"
                    style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
            )}

            <View className="z-10 flex-1 items-center justify-end pb-8">
                {coverUrl ? (
                    <View className="mb-5 overflow-hidden rounded-xl shadow-2xl">
                        <Image source={{uri: coverUrl}} className="h-48 w-32" resizeMode="cover" />
                    </View>
                ) : (
                    <View
                        className="mb-5 h-48 w-32 items-center justify-center rounded-xl shadow-lg"
                        style={{backgroundColor: colors.surfaceContainerHighest}}>
                        <MaterialIcons name="menu-book" size={56} color={colors.onSurfaceVariant} />
                    </View>
                )}

                <Text
                    className="mb-1 px-8 text-center text-2xl font-bold"
                    style={{color: '#FFFFFF'}}
                    numberOfLines={2}>
                    {title}
                </Text>

                <Text
                    className="px-8 text-center text-base"
                    style={{color: 'rgba(255,255,255,0.8)'}}
                    numberOfLines={1}>
                    {author}
                </Text>
            </View>
        </View>
    )
}

type CompactBookHeaderProps = {
    title: string
    author: string
    coverUrl?: string
    className?: string
}

export const CompactBookHeader = ({
    title,
    author,
    coverUrl,
    className = '',
}: CompactBookHeaderProps) => {
    const {colors} = useAppTheme()

    return (
        <View className={`flex-row items-center gap-4 p-4 ${className}`}>
            {coverUrl ? (
                <Image
                    source={{uri: coverUrl}}
                    className="h-24 w-16 rounded-lg shadow-md"
                    resizeMode="cover"
                />
            ) : (
                <View
                    className="h-24 w-16 items-center justify-center rounded-lg"
                    style={{backgroundColor: colors.surfaceContainerHighest}}>
                    <MaterialIcons name="menu-book" size={28} color={colors.onSurfaceVariant} />
                </View>
            )}

            <View className="flex-1">
                <Text
                    className="mb-1 text-lg font-semibold"
                    style={{color: colors.onSurface}}
                    numberOfLines={2}>
                    {title}
                </Text>
                <Text
                    className="text-sm"
                    style={{color: colors.onSurfaceVariant}}
                    numberOfLines={1}>
                    {author}
                </Text>
            </View>
        </View>
    )
}

import {Pressable, View, Text} from 'react-native'
import Animated, {useAnimatedStyle, withDelay, withTiming, FadeIn} from 'react-native-reanimated'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import {OpenLibraryBook} from '@/hooks/useSearchBooks'
import {useAppTheme} from '@/components/material3-provider'
import {CoverSize, getBestCoverUrl, hasCover} from '~/lib/openlibrary'

interface AnimatedBookItemProps {
    book: OpenLibraryBook
    index: number
    onPress: (book: OpenLibraryBook) => void
    isInShelf?: boolean
}

export const AnimatedBookItem = ({book, index, onPress, isInShelf}: AnimatedBookItemProps) => {
    const {colors} = useAppTheme()

    const coverUrl = getBestCoverUrl(book, CoverSize.Medium)

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: withDelay(index * 80, withTiming(1, {duration: 400})),
            transform: [
                {
                    translateY: withDelay(index * 80, withTiming(0, {duration: 400})),
                },
            ],
        }
    })

    const imageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withDelay(index * 80 + 200, withTiming(1, {duration: 400})),
                },
            ],
        }
    })

    return (
        <Animated.View
            style={[{backgroundColor: colors.surface, borderRadius: 12}, containerStyle]}
            entering={FadeIn.duration(500).delay(index * 80)}>
            <Pressable onPress={() => onPress(book)} className="rounded-xl p-3" style={{gap: 12}}>
                <View className="flex-row gap-3">
                    <Animated.View
                        style={[
                            {width: 128, height: 176, borderRadius: 8, overflow: 'hidden'},
                            imageStyle,
                        ]}>
                        {hasCover(book) && coverUrl ? (
                            <Animated.Image
                                source={{uri: coverUrl}}
                                className="h-full w-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View
                                className="h-full w-full items-center justify-center"
                                style={{backgroundColor: colors.surfaceContainerHighest}}>
                                <MaterialIcons
                                    name="book"
                                    size={40}
                                    color={colors.onSurfaceVariant}
                                />
                            </View>
                        )}
                    </Animated.View>

                    <View className="flex-1 justify-between py-1">
                        <View>
                            <Text
                                className="text-lg font-semibold"
                                numberOfLines={2}
                                style={{color: colors.onSurface}}>
                                {book.title}
                            </Text>
                            <Text
                                className="mt-1 text-base"
                                numberOfLines={1}
                                style={{color: colors.onSurfaceVariant}}>
                                {book.author_name?.join(', ') || 'Unknown Author'}
                            </Text>
                            {book.first_publish_year ? (
                                <Text
                                    className="mt-2 text-sm"
                                    style={{color: colors.onSurfaceVariant}}>
                                    Published: {book.first_publish_year}
                                </Text>
                            ) : null}
                        </View>
                        {isInShelf && (
                            <View className="mt-2 flex-row items-center gap-1">
                                <MaterialIcons
                                    name="check-circle"
                                    size={16}
                                    color={colors.primary}
                                />
                                <Text
                                    className="text-sm font-medium"
                                    style={{color: colors.primary}}>
                                    Already in your shelf
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    )
}

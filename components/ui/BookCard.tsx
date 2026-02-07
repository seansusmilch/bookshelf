import {useAppTheme} from '@/components/material3-provider'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {Id} from 'convex/_generated/dataModel'
import {Image, Pressable, Text, View} from 'react-native'

type BookProps = {
    _id: Id<'books'>
    title: string
    author: string
    coverUrl?: string
    currentPage: number
    totalPages: number
    status: string
    rating?: {rating: number}
}

type BookCardProps = {
    book: BookProps
    onPress?: () => void
}

export const BookCard = ({book, onPress}: BookCardProps) => {
    const {colors} = useAppTheme()
    const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0

    console.log('📚 [BookCard] Rendering book:', book.title)
    console.log('📚 [BookCard] book._id:', book._id)
    console.log('📚 [BookCard] book._id type:', typeof book._id)

    return (
        <Pressable
            onPress={onPress}
            className="mb-3 min-h-[120px] rounded-xl shadow-sm"
            style={{backgroundColor: colors.surface}}>
            <View className="flex-row gap-3 p-3">
                <View
                    className="h-44 w-32 flex-shrink-0 overflow-hidden rounded-lg"
                    style={{backgroundColor: colors.surfaceContainerHighest}}>
                    {book.coverUrl ? (
                        <Image
                            source={{uri: book.coverUrl}}
                            className="h-full w-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <Text style={{color: colors.onSurfaceVariant, fontSize: 12}}>
                                No cover
                            </Text>
                        </View>
                    )}
                </View>

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
                            {book.author}
                        </Text>
                    </View>

                    <View>
                        {book.status === 'reading' && (
                            <View className="mt-2">
                                <View
                                    className="h-2 overflow-hidden rounded-full"
                                    style={{backgroundColor: colors.surfaceContainerHighest}}>
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${progressPercent}%`,
                                            backgroundColor: colors.primary,
                                        }}
                                    />
                                </View>
                                <Text
                                    className="mt-1 text-xs"
                                    style={{color: colors.onSurfaceVariant}}>
                                    {book.currentPage} / {book.totalPages} pages
                                </Text>
                            </View>
                        )}

                        <View className="mt-2 flex-row items-center">
                            {book.rating && (
                                <View className="flex-row items-center gap-1">
                                    <FontAwesome name="star" size={12} color={colors.tertiary} />
                                    <Text
                                        className="text-xs"
                                        style={{color: colors.onSurfaceVariant}}>
                                        {book.rating.rating}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

import {useQuery} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useState, useEffect} from 'react'
import {View, Text, Pressable, ScrollView, Image, ActivityIndicator} from 'react-native'
import {ProgressSlider} from '../ui/ProgressSlider'
import {RatingPicker} from '../ui/RatingPicker'
import {ListSelector} from '../ui/ListSelector'
import {useCompleteBook} from '../../hooks/useCompleteBook'
import {useCreateList} from '../../hooks/useCreateList'
import {useRateBook} from '../../hooks/useRateBook'
import {useUpdateProgress} from '../../hooks/useUpdateProgress'
import {Id} from 'convex/_generated/dataModel'

type BookDetail = {
    _id: Id<'books'>
    title: string
    author: string
    description?: string
    coverUrl?: string
    currentPage: number
    totalPages: number
    status: string
    rating?: {rating: number}
}

type BookDetailModalProps = {
    visible: boolean
    bookId: string | null
    onClose: () => void
}

export const BookDetailModal = ({visible, bookId, onClose}: BookDetailModalProps) => {
    const bookDetail = useQuery(api.books.getBookById, bookId ? {bookId: bookId as any} : 'skip')
    const lists = useQuery(api.lists.getUserLists, {})
    const updateProgress = useUpdateProgress()
    const rateBook = useRateBook()
    const completeBook = useCompleteBook()
    const createList = useCreateList()

    const [selectedListIds, setSelectedListIds] = useState<string[]>([])
    const [showProgressSlider, setShowProgressSlider] = useState(false)
    const [showRatingPicker, setShowRatingPicker] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const book = bookDetail as BookDetail | null | undefined

    useEffect(() => {
        if (bookId === undefined || bookId === null || bookId === '') {
            setIsLoading(false)
        } else if (bookDetail !== undefined) {
            setIsLoading(false)
        }
    }, [bookId, bookDetail])

    if (!visible) return null

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Loading book details...</Text>
            </View>
        )
    }

    if (!book) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-8">
                <Text className="text-center text-gray-900">Book not found</Text>
                <Text className="mt-2 text-center text-sm text-gray-600">
                    This book may have been deleted or you don&apos;t have access to it.
                </Text>
            </View>
        )
    }

    const handleProgressUpdate = (newPage: number) => {
        updateProgress.mutate({bookId: book._id, currentPage: newPage})
        setShowProgressSlider(false)
    }

    const handleRatingUpdate = (rating: number) => {
        rateBook.mutate({bookId: book._id, rating})
        setShowRatingPicker(false)
    }

    const handleComplete = () => {
        completeBook.mutate(book._id)
    }

    const handleCreateList = (name: string) => {
        createList.mutate(name)
    }

    const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0

    return (
        <View className="flex-1 bg-white">
            <View className="relative">
                {book.coverUrl ? (
                    <Image
                        source={{uri: book.coverUrl}}
                        className="h-72 w-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="h-72 w-full items-center justify-center bg-gray-100">
                        <Text className="text-gray-400">No cover available</Text>
                    </View>
                )}
                <Pressable
                    onPress={onClose}
                    className="absolute left-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-black/30">
                    <Text className="text-xl font-bold text-white">✕</Text>
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-4 py-4"
                keyboardShouldPersistTaps="handled"
                contentInsetAdjustmentBehavior="automatic">
                <Text className="mb-1 text-2xl font-bold text-gray-900">{book.title}</Text>
                <Text className="mb-4 text-base text-gray-600">{book.author}</Text>

                {book.description && (
                    <Text className="mb-4 text-sm leading-relaxed text-gray-700">
                        {book.description}
                    </Text>
                )}

                <View className="mb-4 rounded-lg bg-gray-50 p-3">
                    <View className="mb-2 flex-row justify-between">
                        <Text className="text-sm text-gray-600">Status</Text>
                        <Text className="text-sm font-semibold capitalize text-gray-900">
                            {book.status.replace('_', ' ')}
                        </Text>
                    </View>
                    <View className="mb-2 flex-row justify-between">
                        <Text className="text-sm text-gray-600">Progress</Text>
                        <Text className="text-sm font-semibold text-gray-900">
                            {book.currentPage} / {book.totalPages} pages
                        </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <View
                            className="h-full rounded-full bg-blue-500"
                            style={{width: `${progressPercent}%`}}
                        />
                    </View>
                </View>

                {book.rating && (
                    <View className="mb-4 flex-row items-center gap-2">
                        <Text className="text-3xl">⭐</Text>
                        <Text className="text-lg font-semibold text-gray-900">
                            {book.rating.rating}/10
                        </Text>
                    </View>
                )}

                {showProgressSlider && (
                    <ProgressSlider
                        value={book.currentPage}
                        max={book.totalPages}
                        onChange={handleProgressUpdate}
                    />
                )}

                {showRatingPicker && (
                    <RatingPicker value={book.rating?.rating} onChange={handleRatingUpdate} />
                )}

                {lists && lists.length > 0 && (
                    <ListSelector
                        lists={lists}
                        selectedListIds={selectedListIds}
                        onSelectionChange={setSelectedListIds}
                        onCreateList={handleCreateList}
                    />
                )}

                <View className="mt-6 flex-row gap-3">
                    {!showProgressSlider && book.status !== 'completed' && (
                        <Pressable
                            onPress={() => setShowProgressSlider(true)}
                            className="flex-1 rounded-lg bg-blue-500 py-3">
                            <Text className="text-center font-semibold text-white">
                                Update Progress
                            </Text>
                        </Pressable>
                    )}

                    {!showRatingPicker && (
                        <Pressable
                            onPress={() => setShowRatingPicker(true)}
                            className="flex-1 rounded-lg bg-gray-100 py-3">
                            <Text className="text-center font-semibold text-gray-700">Rate</Text>
                        </Pressable>
                    )}

                    {book.status !== 'completed' && (
                        <Pressable
                            onPress={handleComplete}
                            className="flex-1 rounded-lg bg-green-500 py-3">
                            <Text className="text-center font-semibold text-white">
                                Mark Complete
                            </Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

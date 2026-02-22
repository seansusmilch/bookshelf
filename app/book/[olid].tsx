import {useState, useEffect, useLayoutEffect} from 'react'
import {View, Text, Animated, ScrollView, TextInput} from 'react-native'
import {useLocalSearchParams} from 'expo-router'
import {useNavigation} from '@react-navigation/native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller'
import {useQuery} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useColorScheme} from '@/hooks/use-color-scheme'
import {BookHeader} from '@/components/book/BookHeader'
import {BookDescription} from '@/components/book/BookDescription'
import {BookMetaInfo} from '@/components/book/BookMetaInfo'
import {StatusSelector} from '@/components/book/StatusSelector'
import {Button} from '@/components/ui/Button'
import {Card, CardContent} from '@/components/ui/Card'
import {Spacer} from '@/components/ui/Section'
import {ProgressSlider, ProgressCard} from '@/components/ui/ProgressSlider'
import {RatingChips, RatingDisplay} from '@/components/ui/RatingPicker'
import {Checkbox} from '@/components/ui/Chips'
import {BottomSheet} from '@/components/ui/BottomSheet'
import {PageLoading, PageError} from '@/components/ui/StateComponents'
import {useAppTheme} from '@/components/material3-provider'
import {BookDetail} from '@/types/book'
import {useScrollAnimation} from '@/hooks/useScrollAnimation'
import {useBookDetailUI} from '@/hooks/useBookDetailUI'
import {useBookHandlers} from '@/hooks/useBookHandlers'
import {useUnifiedBook} from '@/hooks/useUnifiedBook'
import {useAddBook} from '@/hooks/useAddBook'

type UserBookWithRating = BookDetail & {
    openLibraryId?: string
}

export default function UnifiedBookScreen() {
    const {olid} = useLocalSearchParams<{olid: string}>()
    const navigation = useNavigation()
    const colorScheme = useColorScheme()
    const {colors} = useAppTheme()
    const addBook = useAddBook()

    // Get unified book data (OL metadata + user's book if owned)
    const {olData, userBook, isLoading, error, workTitle, reload} = useUnifiedBook({
        olid,
    })

    const lists = useQuery(api.lists.getUserLists, {})

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        })
    }, [colorScheme, navigation])

    const {scrollY} = useScrollAnimation({
        title: workTitle || olData?.title || '',
        colors,
        navigation,
    })

    // Add book UI state
    const [selectedStatus, setSelectedStatus] = useState('want_to_read')
    const [isAdding, setIsAdding] = useState(false)
    const [manualPageCount, setManualPageCount] = useState(
        olData?.pageCount ? String(olData.pageCount) : ''
    )

    // Update page count when OL data loads
    useEffect(() => {
        if (olData?.pageCount) {
            setManualPageCount(String(olData.pageCount))
        }
    }, [olData?.pageCount])

    // Owned book UI state
    const {
        selectedListIds,
        showProgressSlider,
        setShowProgressSlider,
        showRatingPicker,
        setShowRatingPicker,
        showListSelector,
        setShowListSelector,
        showRemoveDialog,
        setShowRemoveDialog,
        toggleList,
    } = useBookDetailUI()

    const book = userBook as UserBookWithRating | null

    const {
        handleProgressUpdate,
        handleRatingUpdate,
        handleComplete,
        handleUncomplete,
        handleRemove,
        removeBook,
    } = useBookHandlers(book)

    const handleRatingUpdateWithClose = (rating: number) => {
        handleRatingUpdate(rating)
        setShowRatingPicker(false)
    }

    const handleAddBook = async () => {
        if (!olData) {
            return
        }

        const authorToSave = olData.author
        if (!authorToSave || authorToSave.trim() === '') {
            return
        }

        const titleToSave = workTitle || olData.title
        if (!titleToSave || titleToSave.trim() === '') {
            return
        }

        const pageCount = manualPageCount.trim()
            ? parseInt(manualPageCount.trim(), 10)
            : olData.pageCount || 0

        try {
            setIsAdding(true)
            // Extract OLID from the key
            const openLibraryId = olData.key.split('/').pop()
            await addBook.mutate({
                title: titleToSave,
                author: authorToSave.trim(),
                description: olData.description,
                coverUrl: olData.coverUrl,
                isbn10: olData.isbn10?.[0],
                isbn13: olData.isbn13?.[0],
                totalPages: pageCount,
                status: selectedStatus,
                openLibraryId,
            })
            // After successful add, the useUnifiedBook hook will refetch and userBook will be populated
            // No navigation needed - UI will transition to owned view
        } catch {
            // Error handled by useAddBook hook
        } finally {
            setIsAdding(false)
        }
    }

    // Loading state
    if (isLoading) {
        return <PageLoading message="Loading book details..." />
    }

    // Error state - but if user owns the book, show their data anyway
    if (error && !userBook) {
        return <PageError message={error} onRetry={reload} />
    }

    // If no OL data and user doesn't own the book, show error
    if (!olData && !userBook) {
        return (
            <View
                className="flex-1 items-center justify-center px-8"
                style={{backgroundColor: colors.background}}>
                <Text className="text-center" style={{color: colors.onSurface}}>
                    Book not found
                </Text>
                <Text className="mt-2 text-center text-sm" style={{color: colors.onSurfaceVariant}}>
                    Could not load book details from Open Library.
                </Text>
            </View>
        )
    }

    // Use user's book data if available, otherwise fall back to OL data
    const displayTitle = book?.title || workTitle || olData?.title || ''
    const displayAuthor = book?.author || olData?.author || ''
    const displayCoverUrl = book?.coverUrl || olData?.coverUrl
    const displayDescription = book?.description || olData?.description
    const displayPageCount = book?.totalPages || olData?.pageCount || 0
    const displayPublishDate = olData?.publishDate
    const displayPublisher = olData?.publishers?.[0]?.name

    const isOwned = !!book
    const isCompleted = book?.status === 'completed'

    const hasMetaInfo = displayPageCount || displayPublishDate || displayPublisher

    return (
        <View className="flex-1" style={{backgroundColor: colors.background}}>
            {isOwned ? (
                // OWNED BOOK VIEW
                <>
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
                            useNativeDriver: false,
                        })}
                        keyboardShouldPersistTaps="handled"
                        contentInsetAdjustmentBehavior="automatic">
                        <BookHeader
                            title={displayTitle}
                            author={displayAuthor}
                            coverUrl={displayCoverUrl}
                        />

                        <View className="gap-5 px-4 pb-32 pt-5">
                            {/* Description */}
                            {displayDescription && (
                                <Card variant="elevated">
                                    <CardContent className="p-4">
                                        <BookDescription description={displayDescription} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reading Progress */}
                            <View className="gap-2">
                                <Text
                                    className="px-1 text-xs font-medium uppercase"
                                    style={{color: colors.onSurfaceVariant, letterSpacing: 1}}>
                                    Reading Progress
                                </Text>
                                <Card variant="elevated">
                                    <CardContent className="p-4">
                                        <ProgressCard
                                            label="Pages Read"
                                            value={book!.currentPage}
                                            max={book!.totalPages}
                                            onEdit={() => setShowProgressSlider(true)}
                                        />

                                        {showProgressSlider && (
                                            <View className="mt-4">
                                                <ProgressSlider
                                                    value={book!.currentPage}
                                                    max={book!.totalPages}
                                                    onChange={handleProgressUpdate}
                                                />
                                            </View>
                                        )}

                                        <Spacer size={16} />

                                        <View className="flex-row gap-3">
                                            <Button
                                                onPress={() =>
                                                    setShowProgressSlider(!showProgressSlider)
                                                }
                                                variant="outlined"
                                                size="medium"
                                                className="flex-1">
                                                {showProgressSlider ? 'Done' : 'Update Progress'}
                                            </Button>

                                            {isCompleted ? (
                                                <Button
                                                    onPress={handleUncomplete}
                                                    variant="outlined"
                                                    size="medium"
                                                    className="flex-1">
                                                    Mark as Reading
                                                </Button>
                                            ) : (
                                                <Button
                                                    onPress={handleComplete}
                                                    variant="filled"
                                                    size="medium"
                                                    className="flex-1">
                                                    Mark Complete
                                                </Button>
                                            )}
                                        </View>
                                    </CardContent>
                                </Card>
                            </View>

                            {/* Rating */}
                            <View className="gap-2">
                                <Text
                                    className="px-1 text-xs font-medium uppercase"
                                    style={{color: colors.onSurfaceVariant, letterSpacing: 1}}>
                                    Rating
                                </Text>
                                <Card variant="elevated">
                                    <CardContent className="p-4">
                                        {book!.rating && !showRatingPicker && (
                                            <View className="mb-4 items-center">
                                                <RatingDisplay rating={book!.rating.rating} />
                                            </View>
                                        )}

                                        {showRatingPicker && (
                                            <View className="mb-4">
                                                <Text
                                                    className="mb-3 text-center text-sm"
                                                    style={{color: colors.onSurfaceVariant}}>
                                                    Rate this book
                                                </Text>
                                                <RatingChips
                                                    value={book!.rating?.rating}
                                                    onChange={handleRatingUpdateWithClose}
                                                />
                                            </View>
                                        )}

                                        <Button
                                            onPress={() => setShowRatingPicker(!showRatingPicker)}
                                            variant="outlined"
                                            size="medium"
                                            className="w-full">
                                            {showRatingPicker
                                                ? 'Cancel'
                                                : book!.rating
                                                  ? 'Change Rating'
                                                  : 'Rate Book'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </View>

                            {/* Grid: Details + Lists */}
                            {(displayPageCount > 0 || (lists && lists.length > 0)) && (
                                <View className="flex-row gap-4">
                                    {displayPageCount > 0 && (
                                        <View className="flex-1 gap-2">
                                            <Text
                                                className="px-1 text-xs font-medium uppercase"
                                                style={{
                                                    color: colors.onSurfaceVariant,
                                                    letterSpacing: 1,
                                                }}>
                                                Details
                                            </Text>
                                            <BookMetaInfo pageCount={displayPageCount} />
                                        </View>
                                    )}

                                    {lists && lists.length > 0 && (
                                        <View className="flex-1 gap-2">
                                            <Text
                                                className="px-1 text-xs font-medium uppercase"
                                                style={{
                                                    color: colors.onSurfaceVariant,
                                                    letterSpacing: 1,
                                                }}>
                                                Lists
                                            </Text>
                                            <Card
                                                variant="outlined"
                                                onPress={() => setShowListSelector(true)}>
                                                <CardContent className="p-4">
                                                    <Text
                                                        className="text-sm"
                                                        style={{color: colors.onSurface}}>
                                                        {selectedListIds.length > 0
                                                            ? `${selectedListIds.length} list${selectedListIds.length > 1 ? 's' : ''} selected`
                                                            : 'Tap to select lists'}
                                                    </Text>
                                                </CardContent>
                                            </Card>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Remove */}
                            <Card variant="outlined">
                                <CardContent className="p-3">
                                    <Button
                                        onPress={() => setShowRemoveDialog(true)}
                                        variant="outlined"
                                        className="w-full"
                                        danger>
                                        Remove from Library
                                    </Button>
                                </CardContent>
                            </Card>
                        </View>
                    </ScrollView>

                    {/* Bottom Sheets */}
                    <BottomSheet
                        visible={showListSelector}
                        onClose={() => setShowListSelector(false)}
                        title="Add to Lists"
                        subtitle="Select lists to add this book to"
                        maxHeight={500}>
                        <View className="gap-2">
                            {lists?.map((list) => (
                                <Checkbox
                                    key={list._id}
                                    label={list.name}
                                    checked={selectedListIds.includes(list._id)}
                                    onChange={() => toggleList(list._id)}
                                />
                            ))}
                        </View>
                    </BottomSheet>

                    <BottomSheet
                        visible={showRemoveDialog}
                        onClose={() => setShowRemoveDialog(false)}
                        title="Remove Book"
                        subtitle="Are you sure you want to remove this book from your library?">
                        <View className="gap-3">
                            <Text className="text-center" style={{color: colors.onSurfaceVariant}}>
                                This action cannot be undone. All reading progress, ratings, and
                                list associations will be deleted.
                            </Text>
                            <View className="mt-4 flex-row gap-3">
                                <Button
                                    onPress={() => setShowRemoveDialog(false)}
                                    variant="outlined"
                                    className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    onPress={handleRemove}
                                    variant="filled"
                                    className="flex-1"
                                    loading={removeBook.isPending}
                                    danger>
                                    Remove
                                </Button>
                            </View>
                        </View>
                    </BottomSheet>
                </>
            ) : (
                // NOT OWNED (ADD) VIEW
                <KeyboardAwareScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
                        useNativeDriver: false,
                    })}
                    bottomOffset={60}
                    keyboardShouldPersistTaps="handled">
                    <BookHeader
                        title={displayTitle}
                        author={displayAuthor}
                        coverUrl={displayCoverUrl}
                    />

                    <View className="gap-5 px-4 pb-24 pt-5">
                        {/* Description */}
                        {displayDescription && (
                            <Card variant="elevated">
                                <CardContent className="p-4">
                                    <BookDescription description={displayDescription} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Details */}
                        {hasMetaInfo && (
                            <View className="gap-2">
                                <Text
                                    className="px-1 text-xs font-medium uppercase"
                                    style={{color: colors.onSurfaceVariant, letterSpacing: 1}}>
                                    Details
                                </Text>
                                <BookMetaInfo
                                    pageCount={displayPageCount}
                                    publishDate={displayPublishDate}
                                    publisher={displayPublisher}
                                />
                            </View>
                        )}

                        {/* Page Count */}
                        <View className="gap-2">
                            <Text
                                className="px-1 text-xs font-medium uppercase"
                                style={{color: colors.onSurfaceVariant, letterSpacing: 1}}>
                                Page Count
                            </Text>
                            <Card variant="outlined">
                                <CardContent className="p-3">
                                    <TextInput
                                        value={manualPageCount}
                                        onChangeText={setManualPageCount}
                                        placeholder="Enter page count"
                                        placeholderTextColor={colors.onSurfaceVariant}
                                        keyboardType="number-pad"
                                        className="text-base"
                                        style={{color: colors.onSurface}}
                                    />
                                </CardContent>
                            </Card>
                        </View>

                        {/* Reading Status */}
                        <View className="gap-2">
                            <Text
                                className="px-1 text-xs font-medium uppercase"
                                style={{color: colors.onSurfaceVariant, letterSpacing: 1}}>
                                Reading Status
                            </Text>
                            <StatusSelector
                                selectedStatus={selectedStatus}
                                onStatusChange={setSelectedStatus}
                            />
                        </View>

                        {/* Add Button */}
                        <Button
                            onPress={handleAddBook}
                            loading={isAdding}
                            disabled={isAdding}
                            variant="filled"
                            size="large"
                            className="w-full">
                            Add to Your Library
                        </Button>
                    </View>
                </KeyboardAwareScrollView>
            )}
        </View>
    )
}

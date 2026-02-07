import {View, Text} from 'react-native'
import {PageLoading} from '@/components/ui/StateComponents'

interface BookDetailLoadingProps {
    isLoading: boolean
    book: any
    colors: {
        background: string
        onSurface: string
        onSurfaceVariant: string
    }
    id: string
}

export const BookDetailLoading = ({isLoading, book, colors, id}: BookDetailLoadingProps) => {
    if (isLoading) {
        return <PageLoading message="Loading book details..." />
    }

    if (!book) {
        return (
            <View
                className="flex-1 items-center justify-center px-8"
                style={{backgroundColor: colors.background}}>
                <Text className="text-center" style={{color: colors.onSurface}}>
                    Book not found
                </Text>
                <Text className="mt-2 text-center text-sm" style={{color: colors.onSurfaceVariant}}>
                    This book may have been deleted or you don&apos;t have access to it.
                </Text>
                <Text className="mt-4 text-center text-xs" style={{color: colors.onSurfaceVariant}}>
                    Debug: id = {id}
                </Text>
            </View>
        )
    }

    return null
}

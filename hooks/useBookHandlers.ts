import {BookDetail} from '@/types/book'
import {useUpdateProgress} from '@/hooks/useUpdateProgress'
import {useRateBook} from '@/hooks/useRateBook'
import {useCompleteBook} from '@/hooks/useCompleteBook'
import {useUncompleteBook} from '@/hooks/useUncompleteBook'
import {useRemoveBook} from '@/hooks/useRemoveBook'

export const useBookHandlers = (book: BookDetail | null | undefined) => {
    const updateProgress = useUpdateProgress()
    const rateBook = useRateBook()
    const completeBook = useCompleteBook()
    const uncompleteBook = useUncompleteBook()
    const removeBook = useRemoveBook()

    const handleProgressUpdate = (newPage: number) => {
        if (!book) return
        updateProgress.mutate({bookId: book._id, currentPage: newPage})
    }

    const handleRatingUpdate = (rating: number) => {
        if (!book) return
        rateBook.mutate({bookId: book._id, rating})
    }

    const handleComplete = () => {
        if (!book) return
        completeBook.mutate(book._id)
    }

    const handleUncomplete = () => {
        if (!book) return
        uncompleteBook.mutate(book._id)
    }

    const handleRemove = () => {
        if (!book) return
        removeBook.mutate(book._id)
    }

    return {
        handleProgressUpdate,
        handleRatingUpdate,
        handleComplete,
        handleUncomplete,
        handleRemove,
        removeBook,
    }
}

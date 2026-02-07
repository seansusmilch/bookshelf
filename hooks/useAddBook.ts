import {useMutation} from 'convex/react'
import {api} from 'convex/_generated/api'
import {useToast} from '@/hooks/useToast'

type AddBookArgs = {
    title: string
    author: string
    description?: string
    coverUrl?: string
    isbn10?: string
    isbn13?: string
    totalPages: number
    status: string
    openLibraryId?: string
}

export const useAddBook = () => {
    const toast = useToast()
    const addBookMutation = useMutation(api.books.addBook)

    return {
        ...addBookMutation,
        mutate: (args: AddBookArgs) => {
            console.log('useAddBook.mutate called with:', args)
            return addBookMutation(args)
                .then((result) => {
                    console.log('useAddBook.mutate success:', result)
                    toast.showSuccess('Book added to library')
                })
                .catch((error: Error) => {
                    console.error('useAddBook.mutate error:', error)
                    toast.showError('Failed to add book')
                })
        },
    }
}
